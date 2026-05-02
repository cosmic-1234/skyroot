require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://vikram-stratos.netlify.app', /\.netlify\.app$/]
    : true,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'vikram-stratos-api', timestamp: new Date().toISOString() });
});

// API v1 routes
app.use('/api/v1', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Vikram-Stratos API running on http://localhost:${PORT}`);
});
