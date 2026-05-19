// Apply pass 5 backlog (additive) — extra AI endpoints.
// Three new MECHANICAL endpoints:
//   POST /api/extras/multi-platform-optimize  — adapts content to N platforms
//   POST /api/extras/trend-forecast            — text-only forward-looking trend AI
//   POST /api/extras/audience-sentiment        — bulk-comment sentiment analyser
//
// Each gates on OPENROUTER_API_KEY and returns 503 + { missing: 'OPENROUTER_API_KEY' }
// when the key is unset. All three reuse the existing generateAIContent helper —
// no new heavy deps, no model files, no migrations.

import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { generateAIContent, repurposeContent } from '../services/openrouter.service';

const router = Router();

router.use(authMiddleware);

function aiKeyConfigured(res: Response): boolean {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({
      error: 'AI service unavailable: OPENROUTER_API_KEY not configured',
      missing: 'OPENROUTER_API_KEY',
    });
    return false;
  }
  return true;
}

// POST /api/extras/multi-platform-optimize
// Body: { content: string, sourcePlatform: string, targetPlatforms: string[] }
// Reuses repurposeContent across each requested target platform.
router.post('/multi-platform-optimize', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!aiKeyConfigured(res)) return;
  try {
    const { content, sourcePlatform, targetPlatforms } = req.body || {};
    if (!content || !sourcePlatform || !Array.isArray(targetPlatforms) || targetPlatforms.length === 0) {
      res.status(400).json({ error: 'content, sourcePlatform, and targetPlatforms[] are required' });
      return;
    }
    // Cap to 5 to avoid runaway loops.
    const targets = targetPlatforms.slice(0, 5);
    const results: Record<string, string> = {};
    for (const target of targets) {
      try {
        results[target] = await repurposeContent(content, sourcePlatform, target);
      } catch (err) {
        results[target] = `[error: ${(err as Error).message}]`;
      }
    }
    res.json({ sourcePlatform, results });
  } catch (error) {
    console.error('multi-platform-optimize error:', error);
    res.status(500).json({ error: 'Failed to optimize across platforms' });
  }
});

// POST /api/extras/trend-forecast
// Body: { niche: string, platform: string, horizon?: '7d' | '30d' | '90d' }
router.post('/trend-forecast', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!aiKeyConfigured(res)) return;
  try {
    const { niche, platform, horizon } = req.body || {};
    if (!niche || !platform) {
      res.status(400).json({ error: 'niche and platform are required' });
      return;
    }
    const horizonStr = ['7d', '30d', '90d'].includes(horizon) ? horizon : '30d';
    const prompt = `Forecast emerging content trends for the next ${horizonStr}.
Niche: ${niche}
Platform: ${platform}

Return JSON ONLY with shape:
{
  "horizon": "${horizonStr}",
  "trends": [
    { "name": string, "rationale": string, "confidence": "low"|"medium"|"high", "first_mover_actions": [string] }
  ],
  "watchouts": [string]
}`;
    const aiOutput = await generateAIContent({ prompt, maxTokens: 1500, temperature: 0.5 });
    res.json({ aiOutput, horizon: horizonStr });
  } catch (error) {
    console.error('trend-forecast error:', error);
    res.status(500).json({ error: 'Failed to forecast trends' });
  }
});

// POST /api/extras/audience-sentiment
// Body: { comments: string[], platform: string }
router.post('/audience-sentiment', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!aiKeyConfigured(res)) return;
  try {
    const { comments, platform } = req.body || {};
    if (!Array.isArray(comments) || comments.length === 0 || !platform) {
      res.status(400).json({ error: 'comments[] and platform are required' });
      return;
    }
    // Cap input to 50 comments (each truncated) to control token use.
    const sample = comments.slice(0, 50).map((c: unknown) => String(c).slice(0, 500));
    const prompt = `Analyse audience sentiment from these ${platform} comments.

Comments:
${sample.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

Return JSON ONLY with shape:
{
  "overall_sentiment": "positive"|"neutral"|"negative"|"mixed",
  "sentiment_distribution": { "positive": number, "neutral": number, "negative": number },
  "top_themes": [{ "theme": string, "examples": [string] }],
  "audience_pain_points": [string],
  "engagement_recommendations": [string]
}`;
    const aiOutput = await generateAIContent({ prompt, maxTokens: 1800, temperature: 0.4 });
    res.json({ aiOutput, sample_size: sample.length });
  } catch (error) {
    console.error('audience-sentiment error:', error);
    res.status(500).json({ error: 'Failed to analyse audience sentiment' });
  }
});

export default router;
