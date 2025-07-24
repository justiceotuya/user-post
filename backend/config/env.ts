import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env file (parent directory)
dotenv.config({ path: resolve(process.cwd(), '../.env') });

interface BackendConfig {
  port: number;
  nodeEnv: string;
  database: {
    path: string;
    url: string;
  };
  cors: {
    origin: string;
    allowedOrigins: string[];
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  logging: {
    level: string;
  };
  api: {
    prefix: string;
  };
}

const backendConfig: BackendConfig = {
  port: parseInt(process.env.PORT || '5003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    // Use './data.db' instead of './backend/data.db' since we're already in the backend directory
    path: process.env.DATABASE_PATH || './var/data/data.db',
    url: process.env.DATABASE_URL || 'sqlite://./var/data/data.db',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  },
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  api: {
    prefix: process.env.VITE_API_PREFIX || '/api',
  },
};

// Validation
if (!backendConfig.port || backendConfig.port < 1 || backendConfig.port > 65535) {
  throw new Error('Invalid PORT configuration. Must be between 1 and 65535.');
}

if (!['development', 'production', 'test'].includes(backendConfig.nodeEnv)) {
  console.warn(`Unknown NODE_ENV: ${backendConfig.nodeEnv}. Defaulting to development.`);
}

console.log(`🔧 Backend Config Loaded:
  - Port: ${backendConfig.port}
  - Environment: ${backendConfig.nodeEnv}
  - Database: ${backendConfig.database.path}
  - CORS Origin: ${backendConfig.cors.origin}
  - API Prefix: ${backendConfig.api.prefix}`);

export default backendConfig;
export { BackendConfig };
