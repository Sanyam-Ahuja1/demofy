import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { disconnectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import v1Routes from './routes/v1';

/**
 * Initialize Express application
 */
const app = express();
// Trust proxy (required for running behind a proxy/load balancer like Nginx, Cloud Run, or Docker)
app.set('trust proxy', 1);

// Force server reload for new admin routes

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));

// CORS configuration
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  })
);

// Configure Passport for Google OAuth
import { configurePassport } from './config/passport';
import passport from './config/passport';
configurePassport();
app.use(passport.initialize());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', v1Routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Start server
 */
const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🌍 Base URL: ${env.BASE_URL}`);
});

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await disconnectDatabase();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

export default app;
