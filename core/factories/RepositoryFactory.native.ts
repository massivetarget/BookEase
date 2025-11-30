import { IRepositoryFactory } from './IRepositoryFactory';
import { SQLiteAccountRepository } from '../repositories/sqlite/SQLiteAccountRepository';
import { SQLiteJournalRepository } from '../repositories/sqlite/SQLiteJournalRepository';
import { getDBConnection, createTables, seedDatabase } from '../database/Database';

class NativeRepositoryFactory implements IRepositoryFactory {
    private db: any = null;

    async initializeDatabase(): Promise<void> {
        if (!this.db) {
            this.db = await getDBConnection();
            await createTables(this.db);
            await seedDatabase(this.db);
        }
    }

    async createAccountRepository() {
        await this.initializeDatabase();
        return new SQLiteAccountRepository(this.db);
    }

    async createJournalRepository() {
        await this.initializeDatabase();
        return new SQLiteJournalRepository(this.db);
    }
}

export const RepositoryFactory = new NativeRepositoryFactory();
