const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const jobSeekerRoutes = require('./routes/jobSeeker');
const employerRoutes = require('./routes/employer');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/jobseeker', jobSeekerRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Portal API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      jobseeker: '/api/jobseeker',
      employer: '/api/employer',
      admin: '/api/admin'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception thrown:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  if (server) {
    server.close(() => {
      console.log('💤 Process terminated');
    });
  }
});