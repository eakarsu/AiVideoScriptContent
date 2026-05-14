import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDatabase, syncDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import scriptsRoutes from './routes/scripts.routes';
import titlesRoutes from './routes/titles.routes';
import descriptionsRoutes from './routes/descriptions.routes';
import hashtagsRoutes from './routes/hashtags.routes';
import thumbnailsRoutes from './routes/thumbnails.routes';
import hooksRoutes from './routes/hooks.routes';
import calendarRoutes from './routes/calendar.routes';
import trendsRoutes from './routes/trends.routes';
import commentsRoutes from './routes/comments.routes';
import ideasRoutes from './routes/ideas.routes';
import seoRoutes from './routes/seo.routes';
import analyticsRoutes from './routes/analytics.routes';
import competitorsRoutes from './routes/competitors.routes';
import personasRoutes from './routes/personas.routes';
import repurposeRoutes from './routes/repurpose.routes';
// New feature routes
import captionsRoutes from './routes/captions.routes';
import ctasRoutes from './routes/ctas.routes';
import viralPredictionsRoutes from './routes/viral-predictions.routes';
import videoSummariesRoutes from './routes/video-summaries.routes';
import podcastTranscriptsRoutes from './routes/podcast-transcripts.routes';
import activityRoutes from './routes/activity.routes';
// Apply pass 5 backlog
import extrasRoutes from './routes/extras.routes';
import viralcontentpredictorRoutes from './routes/viral-content-predictor.routes';
import multiplatformoptimizerRoutes from './routes/multi-platform-optimizer.routes';
import trendforecasterRoutes from './routes/trend-forecaster.routes';
import audiencesentimentanalyzerRoutes from './routes/audience-sentiment-analyzer.routes';
import contentgapanalyzerRoutes from './routes/content-gap-analyzer.routes';
import platformpublishingRoutes from './routes/platform-publishing.routes';

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI generation requests, please try again later' },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limit to all API routes
app.use('/api/', generalLimiter);

// Apply stricter rate limit to auth routes
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/titles', titlesRoutes);
app.use('/api/descriptions', descriptionsRoutes);
app.use('/api/hashtags', hashtagsRoutes);
app.use('/api/thumbnails', thumbnailsRoutes);
app.use('/api/hooks', hooksRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/personas', personasRoutes);
app.use('/api/repurpose', repurposeRoutes);
// New feature routes
app.use('/api/captions', captionsRoutes);
app.use('/api/ctas', ctasRoutes);
app.use('/api/viral-predictions', viralPredictionsRoutes);
app.use('/api/video-summaries', videoSummariesRoutes);
app.use('/api/podcast-transcripts', podcastTranscriptsRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/extras', extrasRoutes);
app.use('/api/viral-content-predictor', viralcontentpredictorRoutes); app.use('/api/multi-platform-optimizer', multiplatformoptimizerRoutes); app.use('/api/trend-forecaster', trendforecasterRoutes); app.use('/api/audience-sentiment-analyzer', audiencesentimentanalyzerRoutes); app.use('/api/content-gap-analyzer', contentgapanalyzerRoutes); app.use('/api/platform-publishing', platformpublishingRoutes);

// Apply AI rate limit to all generate endpoints
app.use('*/generate', aiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    await syncDatabase();

    
// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-tsv-reports-0-ai-but-routes-suggest-under-reported', require('./routes/gapTsvReports0AiButRoutesSuggestUnderReported'));
app.use('/api/gap-no-vision-based-thumbnail-scoring', require('./routes/gapNoVisionBasedThumbnailScoring'));
app.use('/api/gap-no-multimodal-script-to-storyboard-generator', require('./routes/gapNoMultimodalScriptToStoryboardGenerator'));
app.use('/api/gap-limited-platform-api-integration-youtube-tiktok-instagram-beyond-stub', require('./routes/gapLimitedPlatformApiIntegrationYoutubeTiktokInstagramBeyondStub'));
app.use('/api/gap-no-bulk-content-scheduling-publishing', require('./routes/gapNoBulkContentSchedulingPublishing'));
app.use('/api/gap-no-collaboration-commenting-on-scripts', require('./routes/gapNoCollaborationCommentingOnScripts'));
app.use('/api/gap-no-a-b-testing-framework', require('./routes/gapNoABTestingFramework'));
app.use('/api/gap-no-performance-analytics-dashboard', require('./routes/gapNoPerformanceAnalyticsDashboard'));

app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
