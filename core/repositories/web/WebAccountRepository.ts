import { IAccountRepository } from '../../interfaces/IAccountRepository';
import { Account } from '../../../models';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'bookease_accounts';

// Default data to seed if storage is empty (Matches previous Mock data)
const DEFAULT_ACCOUNTS: Account[] = [
    { _id: '1', code: '1001', name: 'Cash on Hand', type: 'Asset', balance: 5000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: '2', code: '2001', name: 'Accounts Payable', type: 'Liability', balance: 2000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: '3', code: '3001', name: 'Owner Equity', type: 'Equity', balance: 3000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: '4', code: '4001', name: 'Sales Revenue', type: 'Income', balance: 15000, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
    { _id: '5', code: '5001', name: 'Rent Expense', type: 'Expense', balance: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() } as any,
];

export class WebAccountRepository implements IAccountRepository {
    private listeners: (() => void)[] = [];

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (typeof localStorage !== 'undefined') {
            const existing = localStorage.getItem(STORAGE_KEY);
            if (!existing) {
                this.saveAccounts(DEFAULT_ACCOUNTS);
            }
        }
    }

    private getAccounts(): Account[] {
        if (typeof localStorage === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        // Parse dates back from JSON strings
        return JSON.parse(data, (key, value) => {
            if (key === 'createdAt' || key === 'updatedAt') {
                return new Date(value);
            }
            return value;
        });
    }

    private saveAccounts(accounts: Account[]) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        }
        this.notifyListeners();
    }

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
        return this.getAccounts();
    }

    async getById(id: string): Promise<Account | null> {
        const accounts = this.getAccounts();
        return accounts.find(a => a._id.toString() === id) || null;
    }

    async create(account: Partial<Account>): Promise<void> {
        const accounts = this.getAccounts();
        const newAccount = {
            ...account,
            _id: uuidv4(),
            balance: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any;

        accounts.push(newAccount);
        this.saveAccounts(accounts);
    }

    async update(id: string, accountUpdates: Partial<Account>): Promise<void> {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(a => a._id.toString() === id);

        if (index !== -1) {
            accounts[index] = {
                ...accounts[index],
                ...accountUpdates,
                updatedAt: new Date()
            };
            this.saveAccounts(accounts);
        }
    }

    async delete(id: string): Promise<void> {
        let accounts = this.getAccounts();
        accounts = accounts.filter(a => a._id.toString() !== id);
        this.saveAccounts(accounts);
    }

    async toggleStatus(id: string): Promise<void> {
        const accounts = this.getAccounts();
        const account = accounts.find(a => a._id.toString() === id);

        if (account) {
            account.isActive = !account.isActive;
            account.updatedAt = new Date();
            this.saveAccounts(accounts);
        }
    }

    async search(query: string, typeFilter: string | null): Promise<ReadonlyArray<Account>> {
        const accounts = this.getAccounts();
        return accounts.filter(account => {
            const matchesSearch =
                query === '' ||
                account.name.toLowerCase().includes(query.toLowerCase()) ||
                account.code.includes(query);
            const matchesType = typeFilter === null || account.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }
}
