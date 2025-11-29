import { IAccountRepository } from '../../interfaces/IAccountRepository';
import { Account } from '../../../models';

export class SQLiteAccountRepository implements IAccountRepository {
    constructor(db: any) { }

    subscribe(callback: () => void): () => void {
        return () => { };
    }

    async getAll(): Promise<Account[]> {
        throw new Error("Not implemented on Web");
    }

    async getById(id: string): Promise<Account | null> {
        throw new Error("Not implemented on Web");
    }

    async create(account: Partial<Account>): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async update(id: string, account: Partial<Account>): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async toggleStatus(id: string): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async search(query: string, typeFilter: string | null): Promise<Account[]> {
        throw new Error("Not implemented on Web");
    }
}
