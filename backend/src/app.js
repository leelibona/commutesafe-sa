const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Uploaded report photos, e.g. http://localhost:3000/uploads/abc.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { maxAge: '7d' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.use('/vehicles', require('./routes/vehicleRoutes'));
app.use('/sos', require('./routes/sosRoutes'));
app.use('/risk', require('./routes/riskRoutes'));
app.use('/contacts', require('./routes/contactRoutes'));
app.use('/trips', require('./routes/tripRoutes'));
app.use('/ranks', require('./routes/rankRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler (must be last)
app.use(require('./middleware/errorHandler'));

module.exports = app;