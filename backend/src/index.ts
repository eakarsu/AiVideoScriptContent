import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
