import { initializeDatabase, seedDatabase } from '../database/init.js';
import sqlite3, { Database } from 'sqlite3';

import path from 'path';

const setupDatabase = async (): Promise<void> => {
  const dbPath = process.env.DATABASE_PATH || './data.db';
  const shouldSeed = process.env.SEED_DATABASE === 'true';

  console.log(`Setting up database at: ${dbPath}`);

  const db: Database = new sqlite3.Database(dbPath);

  try {
    await initializeDatabase(db);

    if (shouldSeed) {
      await seedDatabase(db);
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
};

setupDatabase();
