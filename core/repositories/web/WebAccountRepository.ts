import { IAccountRepository } from '../../interfaces/IAccountRepository';
import { Account } from '../../../models';
import { indexedDBService } from '../../database/IndexedDBService';
import { v4 as uuidv4 } from 'uuid';

export class WebAccountRepository implements IAccountRepository {
    private subscribers: (() => void)[] = [];

    subscribe(callback: () => void): () => void {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    private notify() {
        this.subscribers.forEach(cb => cb());
    }

    async getAll(): Promise<Account[]> {
        const db = await indexedDBService.getDB();
        const accounts = await db.getAll('accounts');
        return accounts.map(acc => ({ ...acc, _id: (acc as any).id }));
    }

    async getById(id: string): Promise<Account | null> {
        const db = await indexedDBService.getDB();
        const account = await db.get('accounts', id);
        return account ? { ...account, _id: (account as any).id } : null;
    }

    async create(account: Partial<Account>): Promise<void> {
        const db = await indexedDBService.getDB();
        const newAccount = {
            id: account._id || uuidv4(),
            code: account.code!,
            name: account.name!,
            type: account.type!,
            subtype: account.subtype,
            balance: account.balance || 0,
            isActive: account.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.put('accounts', newAccount as any);
        this.notify();
    }

    async update(id: string, account: Partial<Account>): Promise<void> {
        const db = await indexedDBService.getDB();
        const existing = await db.get('accounts', id);
        if (!existing) throw new Error('Account not found');

        const updated = {
            ...existing,
            ...account,
            updatedAt: new Date(),
        };
        // Ensure id is preserved
        (updated as any).id = id;
        await db.put('accounts', updated);
        this.notify();
    }

    async delete(id: string): Promise<void> {
        const db = await indexedDBService.getDB();
        await db.delete('accounts', id);
        this.notify();
    }

    async toggleStatus(id: string): Promise<void> {
        const db = await indexedDBService.getDB();
        const account = await db.get('accounts', id);
        if (account) {
            account.isActive = !account.isActive;
            account.updatedAt = new Date();
            await db.put('accounts', account);
            this.notify();
        }
    }

    async search(query: string, typeFilter: string | null): Promise<Account[]> {
        const all = await this.getAll();
        return all.filter(a => {
            const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase()) ||
                a.code.includes(query);
            const matchesType = typeFilter ? a.type === typeFilter : true;
            return matchesQuery && matchesType;
        });
    }
}
