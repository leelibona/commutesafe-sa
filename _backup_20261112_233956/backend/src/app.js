const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.use('/vehicles', require('./routes/vehicleRoutes'));
app.use('/sos', require('./routes/sosRoutes'));
app.use('/risk', require('./routes/riskRoutes'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler (must be last)
app.use(require('./middleware/errorHandler'));

module.exports = app;