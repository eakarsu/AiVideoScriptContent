// Custom Views feature routes for AiVideoScriptContent
// Provides 4 endpoints to back the 4 custom-views frontend features.
const express = require('express');
const path = require('path');
const router = express.Router();

let PDFDocument = null;
try { PDFDocument = require('pdfkit'); } catch (_) { PDFDocument = null; }

// Lazy resolve the Script sequelize model (compiled or ts-node)
let Script = null;
let User = null;
function getModels() {
  if (Script && User) return { Script, User };
  try {
    const models = require('../models');
    Script = models.Script || (models.default && models.default.Script);
    User = models.User || (models.default && models.default.User);
  } catch (_) { /* ignore */ }
  return { Script, User };
}

// Try to lazy-load JWT verification (we mirror the project's auth pattern).
let jwt = null;
try { jwt = require('jsonwebtoken'); } catch (_) {}
function verifyAuth(req) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret);
    return decoded && decoded.userId ? decoded.userId : null;
  } catch (_) { return null; }
}

// In-memory storyboard layout store (per-process; layouts also work without DB).
const storyboardStore = new Map(); // userId -> array of layouts

/**
 * GET /api/custom-views/beats?scriptId=...
 * VIZ 1 backing data: Script Beat Timeline.
 * Returns a deterministic beat breakdown derived from a script's duration string.
 */
router.get('/beats', async (req, res) => {
  try {
    const userId = verifyAuth(req);
    const { Script } = getModels();
    const scriptId = req.query.scriptId ? parseInt(String(req.query.scriptId), 10) : null;

    let totalSeconds = 60;
    let scriptTitle = 'Sample Script';
    if (Script && scriptId && userId) {
      try {
        const row = await Script.findOne({ where: { id: scriptId, userId } });
        if (row) {
          scriptTitle = row.title || scriptTitle;
          const dur = String(row.duration || '').toLowerCase();
          const m = dur.match(/(\d+)/);
          if (m) {
            const n = parseInt(m[1], 10);
            if (dur.includes('min')) totalSeconds = n * 60;
            else if (dur.includes('sec')) totalSeconds = n;
            else totalSeconds = n > 30 ? n : n * 60;
          }
        }
      } catch (_) { /* fall back to default */ }
    }

    // Beat weights (industry-ish): hook 10%, setup 20%, conflict 30%, climax 25%, resolution 15%
    const weights = [
      { key: 'hook', label: 'Hook', weight: 0.10, color: '#ef4444' },
      { key: 'setup', label: 'Setup', weight: 0.20, color: '#f59e0b' },
      { key: 'conflict', label: 'Conflict', weight: 0.30, color: '#3b82f6' },
      { key: 'climax', label: 'Climax', weight: 0.25, color: '#8b5cf6' },
      { key: 'resolution', label: 'Resolution', weight: 0.15, color: '#10b981' },
    ];
    let elapsed = 0;
    const beats = weights.map((w) => {
      const seconds = Math.round(w.weight * totalSeconds);
      const start = elapsed;
      elapsed += seconds;
      return { ...w, seconds, start, end: elapsed };
    });
    res.json({ scriptId, scriptTitle, totalSeconds, beats });
  } catch (err) {
    res.status(500).json({ error: err.message || 'beats failed' });
  }
});

/**
 * GET /api/custom-views/scenes?scriptId=...
 * VIZ 2 backing data: Scene Gallery.
 * Returns a deterministic list of scenes for a script with thumbnail placeholders.
 */
router.get('/scenes', async (req, res) => {
  try {
    const userId = verifyAuth(req);
    const { Script } = getModels();
    const scriptId = req.query.scriptId ? parseInt(String(req.query.scriptId), 10) : null;

    let title = 'Sample Script';
    let aiOutput = '';
    if (Script && scriptId && userId) {
      try {
        const row = await Script.findOne({ where: { id: scriptId, userId } });
        if (row) {
          title = row.title || title;
          aiOutput = row.aiOutput || '';
        }
      } catch (_) { /* fall back to default */ }
    }

    // Split script roughly into 6-8 scenes; durations sum to a plausible total.
    const colors = ['#1e293b', '#0ea5e9', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
    const numScenes = 8;
    const chunks = [];
    const text = (aiOutput || `Scene description placeholder for ${title}. Visual + dialogue cues.`).slice(0, 1600);
    const slice = Math.max(20, Math.floor(text.length / numScenes) || 40);
    for (let i = 0; i < numScenes; i++) {
      chunks.push(text.slice(i * slice, (i + 1) * slice) || `Scene ${i + 1}`);
    }
    const scenes = chunks.map((desc, i) => ({
      sceneNumber: i + 1,
      duration: 8 + ((i * 5) % 12),
      caption: desc.replace(/\s+/g, ' ').trim().slice(0, 90) || `Scene ${i + 1}`,
      color: colors[i % colors.length],
      cameraAngle: ['Wide', 'Medium', 'Close-up', 'Over-shoulder'][i % 4],
    }));
    res.json({ scriptId, scriptTitle: title, scenes });
  } catch (err) {
    res.status(500).json({ error: err.message || 'scenes failed' });
  }
});

/**
 * POST /api/custom-views/script-pdf
 * NON-VIZ 1: Generate an industry-formatted PDF for a script.
 * Body: { scriptId, format: 'standard' | 'short-form' | 'long-form' }
 */
router.post('/script-pdf', async (req, res) => {
  try {
    if (!PDFDocument) return res.status(500).json({ error: 'pdfkit not installed' });
    const userId = verifyAuth(req);
    const { Script } = getModels();
    const { scriptId, format } = req.body || {};
    const fmt = ['standard', 'short-form', 'long-form'].includes(format) ? format : 'standard';

    let scriptRow = null;
    if (Script && scriptId && userId) {
      try { scriptRow = await Script.findOne({ where: { id: scriptId, userId } }); } catch (_) {}
    }
    const title = (scriptRow && scriptRow.title) || `Sample ${fmt} Script`;
    const topic = (scriptRow && scriptRow.topic) || 'General topic';
    const platform = (scriptRow && scriptRow.platform) || 'YouTube';
    const duration = (scriptRow && scriptRow.duration) || (fmt === 'short-form' ? '60 sec' : '5 min');
    const aiOutput = (scriptRow && scriptRow.aiOutput) || 'No script body available.';

    // Industry-standard formatting: Courier 12pt, generous margins.
    const fontSize = fmt === 'short-form' ? 11 : 12;
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 108, right: 72 },
      info: { Title: title, Author: 'AiVideoScriptContent' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="script-${scriptId || 'sample'}-${fmt}.pdf"`);
    doc.pipe(res);

    // Title page block
    doc.font('Courier-Bold').fontSize(18).text(title.toUpperCase(), { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Courier').fontSize(10).text(`Format: ${fmt}    Platform: ${platform}    Duration: ${duration}`, { align: 'center' });
    doc.moveDown(1.5);
    doc.font('Courier-Bold').fontSize(12).text('LOGLINE');
    doc.font('Courier').fontSize(fontSize).text(topic);
    doc.moveDown(1);
    doc.font('Courier-Bold').fontSize(12).text('SCRIPT BODY');
    doc.moveDown(0.5);

    const lines = String(aiOutput).split(/\n+/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) { doc.moveDown(0.5); return; }
      // Slate-style: ALL CAPS lines treated as scene headings.
      if (/^[A-Z0-9 \-#\.\:]+$/.test(trimmed) && trimmed.length < 70) {
        doc.moveDown(0.4);
        doc.font('Courier-Bold').fontSize(fontSize).text(trimmed);
      } else {
        doc.font('Courier').fontSize(fontSize).text(trimmed, { align: 'left', lineGap: 2 });
      }
    });

    doc.moveDown(2);
    doc.font('Courier').fontSize(9).fillColor('#64748b')
      .text(`Generated by AiVideoScriptContent Custom Views | ${new Date().toISOString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message || 'pdf failed' });
  }
});

/**
 * POST /api/custom-views/storyboard
 * NON-VIZ 2: Save a storyboard layout (in-memory per user).
 * GET also supported to list stored layouts.
 */
router.post('/storyboard', (req, res) => {
  try {
    const userId = verifyAuth(req) || 0;
    const body = req.body || {};
    const layout = {
      id: Date.now(),
      name: body.name || `Storyboard ${new Date().toISOString().slice(0, 19)}`,
      panels: Array.isArray(body.panels) ? body.panels : [],
      savedAt: new Date().toISOString(),
    };
    const list = storyboardStore.get(userId) || [];
    list.unshift(layout);
    storyboardStore.set(userId, list.slice(0, 25));
    res.json({ success: true, layout });
  } catch (err) {
    res.status(500).json({ error: err.message || 'storyboard save failed' });
  }
});

router.get('/storyboard', (req, res) => {
  const userId = verifyAuth(req) || 0;
  res.json({ layouts: storyboardStore.get(userId) || [] });
});

module.exports = router;
