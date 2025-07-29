import sqlite3, { Database } from 'sqlite3';

import path from 'path';

let db: Database;

export const connectToDatabase = (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DATABASE_PATH || './var/data/data.db';
    const absolutePath = path.resolve(dbPath);

    console.log(`🔌 Connecting to existing database at: ${absolutePath}`);

    db = new sqlite3.Database(absolutePath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error('❌ Failed to connect to existing database:', err.message);
        reject(err);
        return;
      }

      console.log('✅ Connected to existing SQLite database');
      resolve(db);
    });

    // Handle database errors
    db.on('error', (err) => {
      console.error('❌ Database error:', err);
    });
  });
};

export const getDatabaseInfo = (database: Database): Promise<{ tables: string[], version: string, userCount?: number }> => {
  return new Promise((resolve, reject) => {
    database.get("SELECT sqlite_version() as version", (versionErr: Error | null, versionRow: any) => {
      if (versionErr) {
        reject(versionErr);
        return;
      }

      database.all("SELECT name FROM sqlite_master WHERE type='table'", (tablesErr: Error | null, tables: any[]) => {
        if (tablesErr) {
          reject(tablesErr);
          return;
        }

        const tableNames = tables.map(table => table.name);

        // Get user count if users table exists
        if (tableNames.includes('users')) {
          database.get('SELECT COUNT(*) as count FROM users', (countErr: Error | null, countRow: { count: number }) => {
            resolve({
              version: versionRow.version,
              tables: tableNames,
              userCount: countErr ? undefined : countRow.count
            });
          });
        } else {
          resolve({
            version: versionRow.version,
            tables: tableNames
          });
        }
      });
    });
  });
};

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
};
