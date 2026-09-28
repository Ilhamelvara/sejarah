import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// System Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SEJARAH.ID Backend Server',
    supabaseConfigured: !!(process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('xyzcompany')),
    timestamp: new Date().toISOString()
  });
});

// App Config API
app.get('/api/config', (req, res) => {
  res.json({
    appName: 'SEJARAH.ID',
    version: '2.0.0 (React + Supabase)',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🏛️ SEJARAH.ID Backend Express Server running on http://localhost:${PORT}`);
});
