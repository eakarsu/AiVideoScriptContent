import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Audience sentiment analyzer predicting comment sentiment
// Feature: audience-sentiment-analyzer

async function callOpenRouter(systemPrompt: string, userPrompt: string, opts: { maxTokens?: number; temperature?: number } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY missing. TODO: configure credentials');
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
  const base = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const httpResp = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: opts.maxTokens || 2048,
      temperature: opts.temperature ?? 0.5,
    }),
  });
  if (!httpResp.ok) throw new Error(`OpenRouter HTTP ${httpResp.status}`);
  const data: any = await httpResp.json();
  let txt: string = data.choices[0].message.content.trim();
  txt = txt.replace(/^```(?:json|JSON)?\s*\n?/, '').replace(/\n?\s*```\s*$/, '');
  try { return JSON.parse(txt); } catch { return { raw: txt }; }
}

router.use(authMiddleware);

router.post('/analyze', async (req: Request, res: Response) => {
  const payload = req.body || {};
  try {
    const result = await callOpenRouter(
      'You are an expert assistant for the "AiVideoScriptContent" platform. Always return strict JSON only.',
      `Feature: Audience sentiment analyzer predicting comment sentiment.\nInput: ${JSON.stringify(payload).slice(0, 3500)}\nReturn JSON: { summary, findings:[], recommendations:[], score:0.0, details:{} }`
    );
    res.json({ success: true, feature: 'audience-sentiment-analyzer', ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/batch', async (req: Request, res: Response) => {
  const { items = [] } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items array required' });
  try {
    const result = await callOpenRouter(
      'You analyze batches for "AiVideoScriptContent". JSON only.',
      `Feature: Audience sentiment analyzer predicting comment sentiment. Batch of ${items.length} items: ${JSON.stringify(items).slice(0, 3500)}.\nReturn JSON: { results:[], aggregate:{} }`,
      { maxTokens: 3072 }
    );
    res.json({ success: true, count: items.length, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/info', (req: Request, res: Response) => {
  res.json({ feature: 'audience-sentiment-analyzer', title: 'Audience sentiment analyzer predicting comment sentiment', project: 'AiVideoScriptContent' });
});

export default router;
