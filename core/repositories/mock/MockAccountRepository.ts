import { IAccountRepository } from '../../interfaces/IAccountRepository';
import { Account } from '../../../models';
import { v4 as uuidv4 } from 'uuid';

// Mock Data
const MOCK_ACCOUNTS_DATA: Account[] = [
    { _id: uuidv4(), code: '1001', name: 'Cash on Hand', type: 'Asset', balance: 5000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: uuidv4(), code: '2001', name: 'Accounts Payable', type: 'Liability', balance: 2000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: uuidv4(), code: '3001', name: 'Owner Equity', type: 'Equity', balance: 3000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: uuidv4(), code: '4001', name: 'Sales Revenue', type: 'Income', balance: 15000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: uuidv4(), code: '5001', name: 'Rent Expense', type: 'Expense', balance: 1200, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
];

export class MockAccountRepository implements IAccountRepository {
    private accounts: Account[] = [...MOCK_ACCOUNTS_DATA];
    private listeners: (() => void)[] = [];

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    subscribe(callback: () => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    async getAll(): Promise<ReadonlyArray<Account>> {
        return this.accounts;
    }

    async getById(id: string): Promise<Account | null> {
        return this.accounts.find(a => a._id.toString() === id) || null;
    }

    async create(account: Partial<Account>): Promise<void> {
        const newAccount = {
            ...account,
            _id: uuidv4(),
            balance: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any;
        this.accounts.push(newAccount);
        this.notifyListeners();
    }

    async update(id: string, account: Partial<Account>): Promise<void> {
        const index = this.accounts.findIndex(a => a._id.toString() === id);
        if (index !== -1) {
            this.accounts[index] = { ...this.accounts[index], ...account, updatedAt: new Date() };
            this.notifyListeners();
        }
    }

    async delete(id: string): Promise<void> {
        this.accounts = this.accounts.filter(a => a._id.toString() !== id);
        this.notifyListeners();
    }

    async toggleStatus(id: string): Promise<void> {
        const account = await this.getById(id);
        if (account) {
            account.isActive = !account.isActive;
            account.updatedAt = new Date();
            this.notifyListeners();
        }
    }

    async search(query: string, typeFilter: string | null): Promise<ReadonlyArray<Account>> {
        return this.accounts.filter(account => {
            const matchesSearch =
                query === '' ||
                account.name.toLowerCase().includes(query.toLowerCase()) ||
                account.code.includes(query);
            const matchesType = typeFilter === null || account.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }
}
