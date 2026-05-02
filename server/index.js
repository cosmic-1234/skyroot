require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
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
