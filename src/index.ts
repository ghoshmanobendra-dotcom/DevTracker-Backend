import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import https from 'https';
import http from 'http';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import goalsRoutes from './routes/goals';
import problemsRoutes from './routes/problems';
import projectsRoutes from './routes/projects';
import notesRoutes from './routes/notes';
import shortcutsRoutes from './routes/shortcuts';
import scoresRoutes from './routes/scores';
import careerRoutes from './routes/career';
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/shortcuts', shortcutsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/career-progress', careerRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────────────────
// Keep-alive: prevents Render free tier from spinning down
// Pings /api/health every 14 minutes in production
// ──────────────────────────────────────────────────────
const startKeepAlive = () => {
  const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_PING_URL;
  if (!selfUrl) {
    console.log('ℹ️  Keep-alive disabled (no RENDER_EXTERNAL_URL set)');
    return;
  }

  const pingUrl = `${selfUrl}/api/health`;
  const intervalMs = 14 * 60 * 1000; // 14 minutes

  const ping = () => {
    const client = pingUrl.startsWith('https') ? https : http;
    client.get(pingUrl, (res) => {
      console.log(`🏓 Keep-alive ping → ${pingUrl} [${res.statusCode}]`);
    }).on('error', (err) => {
      console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
    });
  };

  setInterval(ping, intervalMs);
  console.log(`✅ Keep-alive started — pinging ${pingUrl} every 14 minutes`);
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      startKeepAlive();
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();
