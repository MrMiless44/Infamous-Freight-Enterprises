const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const healthRouter = require('./routes/health');
const aiCommandsRouter = require('./routes/ai.commands');
const billingRouter = require('./routes/billing');
const voiceRouter = require('./routes/voice');
const aiSimRouter = require('./routes/aiSim.internal');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Routes
app.use('/api', healthRouter);
app.use('/api/ai', aiCommandsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/voice', voiceRouter);
app.use('/internal/ai-sim', aiSimRouter);

// Root health check (no /api prefix)
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: "Infamous Freight API",
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Infamous Freight API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? '✓ Connected' : '✗ Not configured'}`);
});
