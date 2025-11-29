import { IAccountRepository } from '../../interfaces/IAccountRepository';
import { Account } from '../../../models';
import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

export class SQLiteAccountRepository implements IAccountRepository {
    private db: SQLite.SQLiteDatabase;
    private listeners: (() => void)[] = [];

    constructor(db: SQLite.SQLiteDatabase) {
        this.db = db;
    }

    subscribe(callback: () => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    async getAll(): Promise<Account[]> {
        const result = await this.db.getAllAsync<Account>('SELECT * FROM accounts ORDER BY code');
        return result.map(row => ({
            ...row,
            _id: (row as any).id,
            isActive: Boolean(row.isActive),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        }));
    }

    async getById(id: string): Promise<Account | null> {
        const result = await this.db.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', [id]);
        if (!result) return null;
        return {
            ...result,
            _id: (result as any).id,
            isActive: Boolean(result.isActive),
            createdAt: new Date(result.createdAt),
            updatedAt: new Date(result.updatedAt)
        };
    }

    async create(account: Partial<Account>): Promise<void> {
        const id = uuidv4();
        const now = new Date().toISOString();
        await this.db.runAsync(
            `INSERT INTO accounts (id, code, name, type, subtype, balance, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                account.code!,
                account.name!,
                account.type!,
                account.subtype || null,
                0,
                1, // isActive true
                now,
                now
            ]
        );
        this.notifyListeners();
    }

    async update(id: string, account: Partial<Account>): Promise<void> {
        const updates: string[] = [];
        const values: any[] = [];

        if (account.name) { updates.push('name = ?'); values.push(account.name); }
        if (account.type) { updates.push('type = ?'); values.push(account.type); }
        if (account.subtype !== undefined) { updates.push('subtype = ?'); values.push(account.subtype); }

        updates.push('updatedAt = ?');
        values.push(new Date().toISOString());

        values.push(id);

        await this.db.runAsync(
            `UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        this.notifyListeners();
    }

    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
        this.notifyListeners();
    }

    async toggleStatus(id: string): Promise<void> {
        const account = await this.getById(id);
        if (account) {
            const newStatus = !account.isActive ? 1 : 0;
            await this.db.runAsync(
                'UPDATE accounts SET isActive = ?, updatedAt = ? WHERE id = ?',
                [newStatus, new Date().toISOString(), id]
            );
            this.notifyListeners();
        }
    }

    async search(query: string, typeFilter: string | null): Promise<Account[]> {
        let sql = 'SELECT * FROM accounts WHERE 1=1';
        const params: any[] = [];

        if (typeFilter) {
            sql += ' AND type = ?';
            params.push(typeFilter);
        }

        if (query) {
            sql += ' AND (name LIKE ? OR code LIKE ?)';
            params.push(`%${query}%`, `%${query}%`);
        }

        sql += ' ORDER BY code';

        const result = await this.db.getAllAsync<Account>(sql, params);
        return result.map(row => ({
            ...row,
            _id: (row as any).id,
            isActive: Boolean(row.isActive),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
        }));
    }
}
