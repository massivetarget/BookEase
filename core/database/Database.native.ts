import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async () => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabaseAsync('bookease.db');
  return db;
};

export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
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

export const seedDatabase = async (db: SQLite.SQLiteDatabase) => {
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM accounts');
  if (result && result.count === 0) {
    const now = new Date().toISOString();
    const accounts = [
      { id: '1', code: '1001', name: 'Cash on Hand', type: 'Asset', balance: 5000 },
      { id: '2', code: '2001', name: 'Accounts Payable', type: 'Liability', balance: 2000 },
      { id: '3', code: '3001', name: 'Owner Equity', type: 'Equity', balance: 3000 },
      { id: '4', code: '4001', name: 'Sales Revenue', type: 'Income', balance: 15000 },
      { id: '5', code: '5001', name: 'Rent Expense', type: 'Expense', balance: 1200 },
    ];

    for (const acc of accounts) {
      await db.runAsync(
        `INSERT INTO accounts (id, code, name, type, balance, isActive, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [acc.id, acc.code, acc.name, acc.type, acc.balance, 1, now, now]
      );
    }
  }
};
export const clearDatabaseData = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync('DELETE FROM journal_lines');
  await db.execAsync('DELETE FROM journal_entries');
  // Reset account balances to 0
  await db.execAsync('UPDATE accounts SET balance = 0');
};
