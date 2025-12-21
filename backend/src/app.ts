import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimiter from './middlewares/rateLimiter';
import errorHandler from './middlewares/errorHandler';
import AppError from './utils/AppError';

import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import bookingRoutes from './routes/bookingRoutes';
import tripRoutes from './routes/tripRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import driverRoutes from './routes/driverRoutes';

const app = express();

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Disable for CORS
}));
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true, // Allow cookies and credentials
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // Cache preflight request for 24 hours
}));
app.use(express.json());
app.use(cookieParser());

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // Apache-style logging for production
}

// Rate Limiting
app.use('/api', rateLimiter(100, 60 * 15)); // 100 requests per 15 minutes

// Health Check Route (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/drivers', driverRoutes);

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
