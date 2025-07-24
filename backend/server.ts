import { existsSync, mkdirSync } from 'fs';
import express, { Application, NextFunction, Request, Response } from 'express';
import { getDatabaseInfo, initializeDatabase, validateDatabaseSchema } from './database/init.js';
import sqlite3, { Database } from 'sqlite3';

import config from './config/env.js';
import cors from 'cors';
import { createRoutes } from './routes/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { resolve } from 'path';

// Load environment variables from root .env file first
dotenv.config({ path: resolve(process.cwd(), '../.env') });

const app: Application = express();

// Create absolute path for database and ensure directory exists
const ensureDatabaseDirectory = (dbPath: string): string => {
  const absolutePath = path.resolve(dbPath);
  const directory = path.dirname(absolutePath);

  console.log(`📁 Database directory: ${directory}`);
  console.log(`📄 Database file: ${absolutePath}`);

  try {
    if (!existsSync(directory)) {
      console.log(`📁 Creating database directory: ${directory}`);
      mkdirSync(directory, { recursive: true });
      console.log(`✅ Database directory created successfully`);
    } else {
      console.log(`✅ Database directory already exists`);
    }
  } catch (error) {
    console.error(`❌ Failed to create database directory:`, error);
    throw error;
  }

  return absolutePath;
};

const dbPath = ensureDatabaseDirectory(config.database.path);

// Initialize database connection with better error handling
let db: Database;

const createDatabaseConnection = (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    console.log(`🔌 Connecting to database at: ${dbPath}`);

    const database = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('📍 Attempted path:', dbPath);

        // Try to create with just OPEN_CREATE flag as fallback
        const fallbackDb = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE, (fallbackErr) => {
          if (fallbackErr) {
            console.error('❌ Fallback database creation failed:', fallbackErr.message);
            reject(fallbackErr);
            return;
          }

          console.log('✅ Database created successfully (fallback method)');
          resolve(fallbackDb);
        });
        return;
      }

      console.log('✅ Database connection established');
      resolve(database);
    });

    // Handle database errors
    database.on('error', (err) => {
      console.error('❌ Database error:', err);
    });
  });
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware with environment-based configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow any localhost origin
    if (config.nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

// Request logging middleware (only in development)
if (config.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction): void => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Test database connection and check schema
const testDatabase = async (): Promise<void> => {
  try {
    console.log('🗄️ Initializing database connection...');

    // Create database connection
    db = await createDatabaseConnection();

    // Test basic connection
    await initializeDatabase(db);

    // Check what tables exist and create if needed
    await validateDatabaseSchema(db);

    // Log database info in development
    if (config.nodeEnv === 'development') {
      const dbInfo = await getDatabaseInfo(db);
      console.log(`📊 SQLite version: ${dbInfo.version}`);
      console.log(`📋 Available tables: ${dbInfo.tables.join(', ')}`);
    }

    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('💡 Please check your database file path and permissions');
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db) {
      res.status(503).json({
        status: 'ERROR',
        message: 'Database not initialized',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const dbInfo = await getDatabaseInfo(db);
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      port: config.port,
      database: {
        path: dbPath,
        version: dbInfo.version,
        tables: dbInfo.tables
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

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Shutting down gracefully...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server after testing database
const startServer = async (): Promise<void> => {
  try {
    await testDatabase();

    // API routes with configurable prefix (after db is initialized)
    app.use(config.api.prefix, createRoutes(db));

    app.listen(config.port, (): void => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🗄️ Database: ${dbPath}`);
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
