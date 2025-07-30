import { connectToDatabase, getDatabase, getDatabaseInfo } from './database/connection';
import express, { Application, NextFunction, Request, Response } from 'express';

import config from './config/env';
import cors from 'cors';
import { createRoutes } from './routes';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '../.env') });

const app: Application = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (config.nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

// Request logging (development only)
if (config.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction): void => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase();
    const dbInfo = await getDatabaseInfo(db);

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      port: config.port,
      database: {
        status: 'connected',
        version: dbInfo.version,
        tables: dbInfo.tables,
        userCount: dbInfo.userCount
      },
      api_prefix: config.api.prefix
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to existing database (no initialization)
    console.log('🗄️ Connecting to existing database...');
    const db = await connectToDatabase();

    // Log existing database info
    const dbInfo = await getDatabaseInfo(db);
    console.log(`📊 SQLite version: ${dbInfo.version}`);
    console.log(`📋 Existing tables: ${dbInfo.tables.join(', ')}`);
    if (dbInfo.userCount !== undefined) {
      console.log(`👥 Existing users: ${dbInfo.userCount}`);
    }

    // Setup API routes
    app.use(config.api.prefix, createRoutes(db));

    // 404 handler
    app.use('*', (req: Request, res: Response): void => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
      console.error('❌ Error:', err.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    app.listen(config.port, (): void => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🗄️ Using existing database with ${dbInfo.tables.length} tables`);
      console.log(`🌐 API Prefix: ${config.api.prefix}`);
      console.log(`🔗 Health Check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
