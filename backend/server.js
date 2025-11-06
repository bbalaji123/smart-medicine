const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const medicationSearchRoutes = require('./routes/medicationSearch');
const healthRoutes = require('./routes/health');
const emergencyContactsRoutes = require('./routes/emergencyContacts');
const careRecipientsRoutes = require('./routes/careRecipients');

// Initialize express app
const app = express();

// CORS configuration - MUST come first before other middleware
// Allow multiple origins for development and production
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600, // Cache preflight requests for 10 minutes
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware - before other middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - skip for OPTIONS (preflight) requests
// Very lenient for development - adjust in production
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // 1000 requests per minute (very high for development)
  skip: (req) => {
    // Skip rate limiting for:
    // 1. OPTIONS (CORS preflight) requests
    // 2. Development environment
    return req.method === 'OPTIONS' || process.env.NODE_ENV === 'development';
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// Apply to all /api routes (but will be skipped in development)
app.use('/api', limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-medicine', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('⚠️  Continuing without MongoDB - some features may not work');
  // Don't exit the process, continue without MongoDB for now
});

// Root endpoint - Welcome message
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Smart Medicine Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      medications: '/api/medications/*',
      medicationSearch: '/api/medication-search/*',
      healthMetrics: '/api/health/*',
      emergencyContacts: '/api/emergency-contacts/*',
      careRecipients: '/api/care-recipients/*'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'Smart Medicine Backend Server is running',
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/medication-search', medicationSearchRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/emergency-contacts', emergencyContactsRoutes);
app.use('/api/care-recipients', careRecipientsRoutes);

// Handle 404 errors - must be AFTER all routes
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/signup',
      'GET /api/medications',
      'POST /api/medications',
      'GET /api/health',
      'GET /api/emergency-contacts',
      'GET /api/care-recipients'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});