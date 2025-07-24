import express, { Application, NextFunction, Request, Response } from 'express';
import sqlite3, { Database } from 'sqlite3';

import { createRoutes } from './routes/index.js';

const app: Application = express();

// Built-in environment variable access
const PORT: number = parseInt(process.env.PORT || '5003', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';
const DATABASE_PATH ='./data.db';
const CORS_ORIGIN: string =  '*';

const db: Database = new sqlite3.Database(DATABASE_PATH);

// Middleware
app.use(express.json());

// CORS middleware with environment-based origin
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Create index for fast joins if it doesn't exist
db.run('CREATE INDEX IF NOT EXISTS idx_address_user_id ON addresses(user_id)', (err: Error | null): void => {
  if (err && NODE_ENV === 'development') {
    console.log('Index creation warning:', err.message);
  }
});

// Use routes
app.use('/', createRoutes(db));

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT
  });
});

app.listen(PORT, (): void => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🗄️ Database: ${DATABASE_PATH}`);
});

export default app;
