import { IRepositoryFactory } from './IRepositoryFactory';
import { WebAccountRepository } from '../repositories/web/WebAccountRepository';
import { WebJournalRepository } from '../repositories/web/WebJournalRepository';
import { seedWebDatabase } from '../database/WebSeeder';

class WebRepositoryFactory implements IRepositoryFactory {
    async initializeDatabase(): Promise<void> {
        await seedWebDatabase();
    }

    async createAccountRepository() {
        await this.initializeDatabase();
        return new WebAccountRepository();
    }

    async createJournalRepository() {
        await this.initializeDatabase();
        return new WebJournalRepository();
    }
}

export const RepositoryFactory = new WebRepositoryFactory();
