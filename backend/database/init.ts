import { Database } from 'sqlite3';

export const initializeDatabase = (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('🔌 Testing database connection...');

    // Simple connection test - just run a basic query
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

      resolve();
    });
  });
};

export const getDatabaseInfo = (db: Database): Promise<{ tables: string[], version: string }> => {
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

        resolve({
          version: versionRow.version,
          tables: tables.map(table => table.name)
        });
      });
    });
  });
};
