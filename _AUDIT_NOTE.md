# Audit Recommendations & Status — AiVideoScriptContent

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_08.md (section 30)

Verdict per audit: partial-build, TSV under-reported. The audit explicitly notes "TSV claims 0 AI endpoints" but inspection confirms the project already integrates AI generation through `services/openrouter.service.ts` and per-controller `generate` actions (e.g., `scripts.controller.generate`, plus dedicated AI helpers for hooks, viral predictions, captions, CTAs, summaries, podcast transcripts, etc.).

## Original audit recommendations

Missing AI counterparts: TSV-reported 0 but actually present. No specific gaps to fill mechanically.

Missing non-AI:
- YouTube / TikTok / Instagram API integrations
- Bulk content scheduling
- Collaboration / commenting
- A/B testing framework
- Performance analytics dashboard

Custom feature ideas:
- Viral content predictor (already present as `predictViralPotential`)
- Multi-platform optimizer
- Trend forecaster
- Audience sentiment analyzer
- Content gap analyzer

## Implemented in this pass

None. Project is a TypeScript/Sequelize codebase where AI generation is already wired through controllers and a services layer. Adding more AI endpoints touches multiple layers (model, service, controller, route) and is best done as a focused product change rather than a mechanical edit. To respect the "no new external SDK deps, syntax-check every file, match style" constraints with a TS toolchain that has not been built in this environment, no edits were made.

## Backlog (priority order)

1. Multi-platform optimizer endpoint — adapts a piece of content to all target platforms in one call. Could reuse `repurposeContent` looped over platforms.
2. Trend forecaster — text-only AI endpoint.
3. Audience sentiment analyzer — text-only AI endpoint over comments.
4. Content gap analyzer — needs competitor data joined with own data.
5. YouTube / TikTok / Instagram integrations — credentials decision.
6. A/B testing framework — substantial feature.

## Apply pass 3 (frontend)

Inspected `frontend/src/App.tsx` (Vite/React + TypeScript + Tailwind). The
TS frontend is comprehensively wired to all of the backend's
`POST /api/<resource>/generate` AI endpoints (~20 features). The wiring is
data-driven rather than per-page:

- `frontend/src/services/api.ts` — defines a `FEATURES` array, one entry
  per AI capability (Scripts, Titles, Descriptions, Hashtags, Thumbnails,
  Hooks, Captions, CTAs, Viral Predictions, Video Summaries, Podcast
  Transcripts, Calendar, Trends, SEO, Personas, Repurpose, Analytics,
  Competitors, Ideas, Comments). Each entry declares its `endpoint`,
  `fields`, and `generateFields`.
- `frontend/src/components/ItemForm.tsx:165` and `ItemDetail.tsx:58` —
  generic AI generate call: `api.post(\`${feature.endpoint}/generate\`,
  generateData)`. JWT pulled from `localStorage.getItem('token')` in
  `ApiService.getHeaders()` (`api.ts:9-12`).
- Per-feature pages (`ScriptsPage.tsx`, `TitlesPage.tsx`, etc.) and the
  generic `FeaturePage.tsx` reuse `ItemForm`/`ItemDetail`, so adding a new
  AI feature only requires adding a `FEATURES` entry.

Backend `/generate` routes verified: `backend/src/routes/*.routes.ts`
each register `router.post('/generate', controller.generate)` and are
mounted in `backend/src/index.ts`.

**Action: LEFT-AS-IS — frontend already wired (uniform schema-driven
pattern across all 20 AI features).**

## Apply pass 4 (mechanical backlog)

No-op. This is a TypeScript/Sequelize project where every AI feature is wired
through model + service + controller + route + `FEATURES` registry layers.
Adding a new feature is multi-file and would require running `tsc` (no
`npm install` allowed this pass) to surface type errors — that exceeds the
"MECHANICAL" threshold for this pass. The TypeScript backlog
(multi-platform optimizer, trend forecaster, audience sentiment analyzer)
is deferred to a focused product change.

## Apply pass 5 (all backlog)

Tackled the deferred TS backlog as 3 additive `generate-only` endpoints — no
new model files, no new Sequelize tables, no new heavy deps. All three are
wired into a single new file `backend/src/routes/extras.routes.ts` that
reuses the existing `generateAIContent` and `repurposeContent` helpers from
`services/openrouter.service.ts`. `index.ts` registers the router at
`/api/extras`.

| Endpoint | Category | Reuses |
|---|---|---|
| `POST /api/extras/multi-platform-optimize` | MECHANICAL | `repurposeContent` looped (capped at 5 targets) |
| `POST /api/extras/trend-forecast` | MECHANICAL | `generateAIContent` with JSON-shape prompt and 7d/30d/90d horizon |
| `POST /api/extras/audience-sentiment` | MECHANICAL | `generateAIContent` over capped 50-comment batch |

Each endpoint short-circuits with HTTP 503 + `{ error, missing: 'OPENROUTER_API_KEY' }` when no key is configured. `tsc --noEmit` passes clean.

Smoke test (`BACKEND_PORT=4831`):
- Login `demo@creator.ai / demo123` succeeded.
- With `OPENROUTER_API_KEY` set: all three endpoints returned 200 with structured AI output.
- With `OPENROUTER_API_KEY=""`: all three returned 503 with the expected `missing` field.

No `npm install` performed; no model migrations; no new dependencies.
