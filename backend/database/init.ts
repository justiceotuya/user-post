import { Database } from 'sqlite3';

export const initializeDatabase = (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('🔌 Testing existing database connection...');

    // Simple connection test - just verify we can query
    db.get("SELECT 1 as test", (err: Error | null, row: any) => {
      if (err) {
        console.error('❌ Database connection test failed:', err.message);
        reject(err);
        return;
      }

      console.log('✅ Database connection test successful');
      resolve();
    });
  });
};

export const validateDatabaseSchema = (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('📋 Checking existing database schema...');

    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err: Error | null, tables: any[]) => {
      if (err) {
        console.error('❌ Schema validation failed:', err.message);
        reject(err);
        return;
      }

      const existingTables = tables.map(table => table.name);
      console.log(`📊 Found ${existingTables.length} table(s): ${existingTables.join(', ')}`);

      // Just log what we found, don't create anything
      console.log('✅ Using existing database schema');
      resolve();
    });
  });
};

export const getDatabaseInfo = (db: Database): Promise<{ tables: string[], version: string, userCount?: number }> => {
  return new Promise((resolve, reject) => {
    db.get("SELECT sqlite_version() as version", (versionErr: Error | null, versionRow: any) => {
      if (versionErr) {
        reject(versionErr);
        return;
      }

      db.all("SELECT name FROM sqlite_master WHERE type='table'", (tablesErr: Error | null, tables: any[]) => {
        if (tablesErr) {
          reject(tablesErr);
          return;
        }

        const tableNames = tables.map(table => table.name);

        // Try to get user count if users table exists
        if (tableNames.includes('users')) {
          db.get('SELECT COUNT(*) as count FROM users', (countErr: Error | null, countRow: { count: number }) => {
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
