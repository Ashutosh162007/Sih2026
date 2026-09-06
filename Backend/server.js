const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// JWT_SECRET is required for signing/verifying auth tokens
if (!process.env.JWT_SECRET) {
  console.error('[Sahayog Backend] FATAL: JWT_SECRET is not set.');
  console.error('[Sahayog Backend] Copy Backend/.env.example to Backend/.env and set a strong JWT_SECRET.');
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Root / Healthcheck
app.get('/', (req, res) => {
  res.json({
    name: 'Sahayog API — Societal Innovation Collaboration Platform',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/university', require('./routes/universityRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/industry', require('./routes/industryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Sahayog Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Sahayog Backend] API URL: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] Error: ${err.message}`);
});

module.exports = app;
