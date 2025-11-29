import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async () => {
    if (db) {
        return db;
    }
    db = await SQLite.openDatabaseAsync('bookease.db');
    return db;
};

export const createTables = async (db: SQLite.SQLiteDatabase) => {
    // Accounts Table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      subtype TEXT,
      balance REAL DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

    // Journal Entries Table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      reference TEXT,
      status TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

    // Journal Lines Table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS journal_lines (
      id TEXT PRIMARY KEY NOT NULL,
      entryId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      description TEXT,
      createdAt TEXT,
      FOREIGN KEY (entryId) REFERENCES journal_entries (id) ON DELETE CASCADE,
      FOREIGN KEY (accountId) REFERENCES accounts (id)
    );
  `);
};
