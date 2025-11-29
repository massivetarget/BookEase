import { IJournalRepository } from '../../interfaces/IJournalRepository';
import { JournalEntry, JournalLine } from '../../../models';
import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

export class SQLiteJournalRepository implements IJournalRepository {
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

    async getAll(): Promise<JournalEntry[]> {
        const entries = await this.db.getAllAsync<any>('SELECT * FROM journal_entries ORDER BY date DESC');

        // Fetch lines for each entry (N+1 problem, but okay for local DB for now)
        // Optimization: Fetch all lines and map in memory if performance is an issue.
        const results: JournalEntry[] = [];

        for (const entry of entries) {
            const lines = await this.db.getAllAsync<JournalLine>('SELECT * FROM journal_lines WHERE entryId = ?', [entry.id]);
            results.push({
                _id: entry.id,
                date: new Date(entry.date),
                description: entry.description,
                reference: entry.reference,
                status: entry.status,
                createdAt: new Date(entry.createdAt),
                updatedAt: new Date(entry.updatedAt),
                lines: lines.map(l => ({
                    ...l,
                    _id: (l as any).id,
                    createdAt: new Date(l.createdAt)
                })), // Map id to _id and string to Date
                getTotalAmount: () => lines.reduce((sum, l) => sum + (l.debit || 0), 0)
            });
        }

        return results;
    }

    async getById(id: string): Promise<JournalEntry | null> {
        const entry = await this.db.getFirstAsync<any>('SELECT * FROM journal_entries WHERE id = ?', [id]);
        if (!entry) return null;

        const lines = await this.db.getAllAsync<JournalLine>('SELECT * FROM journal_lines WHERE entryId = ?', [id]);

        return {
            _id: entry.id,
            date: new Date(entry.date),
            description: entry.description,
            reference: entry.reference,
            status: entry.status,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt),
            lines: lines.map(l => ({
                ...l,
                _id: (l as any).id,
                createdAt: new Date(l.createdAt)
            })),
            getTotalAmount: () => lines.reduce((sum, l) => sum + (l.debit || 0), 0)
        };
    }

    async create(entry: Partial<JournalEntry>): Promise<void> {
        const id = uuidv4();
        const now = new Date().toISOString();

        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `INSERT INTO journal_entries (id, date, description, reference, status, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    entry.date ? entry.date.toISOString() : now,
                    entry.description!,
                    entry.reference || null,
                    entry.status || 'Draft',
                    now,
                    now
                ]
            );

            if (entry.lines) {
                for (const line of entry.lines) {
                    await this.db.runAsync(
                        `INSERT INTO journal_lines (id, entryId, accountId, debit, credit, description, createdAt)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            uuidv4(),
                            id,
                            line.accountId,
                            line.debit,
                            line.credit,
                            line.description || null,
                            now
                        ]
                    );
                }
            }

            // If status is Posted, update balances
            if (entry.status === 'Posted' && entry.lines) {
                for (const line of entry.lines) {
                    // Update Account Balance
                    // Asset/Expense: Debit increases, Credit decreases
                    // Liability/Equity/Income: Credit increases, Debit decreases
                    // We need to know account type.

                    const account = await this.db.getFirstAsync<any>('SELECT type, balance FROM accounts WHERE id = ?', [line.accountId]);
                    if (account) {
                        let change = 0;
                        if (['Asset', 'Expense'].includes(account.type)) {
                            change = line.debit - line.credit;
                        } else {
                            change = line.credit - line.debit;
                        }

                        await this.db.runAsync(
                            'UPDATE accounts SET balance = balance + ?, updatedAt = ? WHERE id = ?',
                            [change, now, line.accountId]
                        );
                    }
                }
            }
        });

        this.notifyListeners();
    }

    async update(id: string, entry: Partial<JournalEntry>): Promise<void> {
        // Complex update logic (lines etc) omitted for brevity, assuming simple header updates for now
        // or full replacement.
        // For MVP, let's just update header fields.
        const updates: string[] = [];
        const values: any[] = [];

        if (entry.description) { updates.push('description = ?'); values.push(entry.description); }
        if (entry.reference) { updates.push('reference = ?'); values.push(entry.reference); }
        if (entry.status) { updates.push('status = ?'); values.push(entry.status); }

        updates.push('updatedAt = ?');
        values.push(new Date().toISOString());
        values.push(id);

        await this.db.runAsync(
            `UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        this.notifyListeners();
    }

    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
        this.notifyListeners();
    }

    async post(id: string): Promise<void> {
        const entry = await this.getById(id);
        if (entry && entry.status !== 'Posted') {
            // Update status and balances
            // Reuse create logic or duplicate it?
            // Let's duplicate balance update logic for now or extract it.
            const now = new Date().toISOString();

            await this.db.withTransactionAsync(async () => {
                await this.db.runAsync('UPDATE journal_entries SET status = ?, updatedAt = ? WHERE id = ?', ['Posted', now, id]);

                for (const line of entry.lines) {
                    const account = await this.db.getFirstAsync<any>('SELECT type, balance FROM accounts WHERE id = ?', [line.accountId]);
                    if (account) {
                        let change = 0;
                        if (['Asset', 'Expense'].includes(account.type)) {
                            change = line.debit - line.credit;
                        } else {
                            change = line.credit - line.debit;
                        }

                        await this.db.runAsync(
                            'UPDATE accounts SET balance = balance + ?, updatedAt = ? WHERE id = ?',
                            [change, now, line.accountId]
                        );
                    }
                }
            });
            this.notifyListeners();
        }
    }
}
