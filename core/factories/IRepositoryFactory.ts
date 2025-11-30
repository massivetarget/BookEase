import { IAccountRepository } from '../interfaces/IAccountRepository';
import { IJournalRepository } from '../interfaces/IJournalRepository';

export interface IRepositoryFactory {
    createAccountRepository(): Promise<IAccountRepository>;
    createJournalRepository(): Promise<IJournalRepository>;
    initializeDatabase(): Promise<void>;
}
