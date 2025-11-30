import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Account, JournalEntry, JournalLine } from '@/models';

interface BookEaseDB extends DBSchema {
    accounts: {
        key: string;
        value: Account;
        indexes: { 'by-code': string };
    };
    journal_entries: {
        key: string;
        value: JournalEntry;
        indexes: { 'by-date': string };
    };
    journal_lines: {
        key: string;
        value: JournalLine;
        indexes: { 'by-entry': string; 'by-account': string };
    };
}

const DB_NAME = 'BookEaseDB';
const DB_VERSION = 1;

export class IndexedDBService {
    private dbPromise: Promise<IDBPDatabase<BookEaseDB>>;

    constructor() {
        this.dbPromise = openDB<BookEaseDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Accounts Store
                const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
                accountStore.createIndex('by-code', 'code', { unique: true });

                // Journal Entries Store
                const entryStore = db.createObjectStore('journal_entries', { keyPath: 'id' });
                entryStore.createIndex('by-date', 'date');

                // Journal Lines Store
                const lineStore = db.createObjectStore('journal_lines', { keyPath: 'id' });
                lineStore.createIndex('by-entry', 'entryId');
                lineStore.createIndex('by-account', 'accountId');
            },
        });
    }

    async getDB() {
        return this.dbPromise;
    }
}

export const indexedDBService = new IndexedDBService();
