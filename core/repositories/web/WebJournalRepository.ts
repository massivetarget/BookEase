import { IJournalRepository } from '../../interfaces/IJournalRepository';
import { JournalEntry, JournalLine } from '../../../models';
import { indexedDBService } from '../../database/IndexedDBService';
import { v4 as uuidv4 } from 'uuid';

export class WebJournalRepository implements IJournalRepository {
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

    async create(entry: Partial<JournalEntry>): Promise<void> {
        const db = await indexedDBService.getDB();
        const tx = db.transaction(['journal_entries', 'journal_lines', 'accounts'], 'readwrite');

        const entryId = entry._id || uuidv4();
        const newEntry = {
            id: entryId, // Store as id
            date: entry.date || new Date(),
            description: entry.description!,
            reference: entry.reference,
            status: entry.status || 'Draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await tx.objectStore('journal_entries').put(newEntry as any);

        if (entry.lines) {
            for (const line of entry.lines) {
                const newLine = {
                    id: line._id || uuidv4(), // Store as id
                    entryId: entryId,
                    accountId: line.accountId,
                    debit: line.debit || 0,
                    credit: line.credit || 0,
                    description: line.description,
                    createdAt: new Date(),
                };
                await tx.objectStore('journal_lines').put(newLine as any);

                // Update account balance if Posted
                if (newEntry.status === 'Posted') {
                    const accountStore = tx.objectStore('accounts');
                    const account = await accountStore.get(newLine.accountId);
                    if (account) {
                        let balanceChange = 0;
                        if (['Asset', 'Expense'].includes(account.type)) {
                            balanceChange = newLine.debit - newLine.credit;
                        } else {
                            balanceChange = newLine.credit - newLine.debit;
                        }
                        account.balance += balanceChange;
                        await accountStore.put(account);
                    }
                }
            }
        }

        await tx.done;
        this.notify();
    }

    async getAll(): Promise<(JournalEntry & { lines: JournalLine[] })[]> {
        const db = await indexedDBService.getDB();
        const entries = await db.getAll('journal_entries');
        const lines = await db.getAll('journal_lines');

        // Sort by date desc
        entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return entries.map(entry => {
            const entryLines = lines.filter(l => (l as any).entryId === (entry as any).id);
            return {
                ...entry,
                _id: (entry as any).id, // Map id to _id
                lines: entryLines.map(l => ({ ...l, _id: (l as any).id })), // Map line id to _id
                getTotalAmount: () => entryLines.reduce((sum, line) => sum + (line.debit || 0), 0)
            };
        });
    }

    async getById(id: string): Promise<(JournalEntry & { lines: JournalLine[] }) | null> {
        const db = await indexedDBService.getDB();
        const entry = await db.get('journal_entries', id);
        if (!entry) return null;

        const allLines = await db.getAll('journal_lines');
        const lines = allLines.filter(l => (l as any).entryId === id);

        return {
            ...entry,
            _id: (entry as any).id,
            lines: lines.map(l => ({ ...l, _id: (l as any).id })),
            getTotalAmount: () => lines.reduce((sum, line) => sum + (line.debit || 0), 0)
        };
    }

    async update(id: string, entry: Partial<JournalEntry>): Promise<void> {
        const db = await indexedDBService.getDB();
        const existing = await db.get('journal_entries', id);
        if (!existing) throw new Error('Entry not found');

        const updated = { ...existing, ...entry, updatedAt: new Date() };
        // Ensure id is preserved
        (updated as any).id = id;
        // Remove getTotalAmount/lines if present (shouldn't be stored in entry object)
        const { getTotalAmount, lines, _id, ...stored } = updated as any;

        await db.put('journal_entries', stored);
        this.notify();
    }

    async post(id: string): Promise<void> {
        const db = await indexedDBService.getDB();
        const tx = db.transaction(['journal_entries', 'journal_lines', 'accounts'], 'readwrite');

        const entry = await tx.objectStore('journal_entries').get(id);
        if (!entry) throw new Error('Entry not found');
        if (entry.status === 'Posted') return; // Already posted

        // Update status
        entry.status = 'Posted';
        entry.updatedAt = new Date();
        await tx.objectStore('journal_entries').put(entry);

        // Update account balances
        const allLines = await tx.objectStore('journal_lines').getAll();
        const lines = allLines.filter(l => (l as any).entryId === id);
        const accountStore = tx.objectStore('accounts');

        for (const line of lines) {
            const account = await accountStore.get(line.accountId);
            if (account) {
                let balanceChange = 0;
                if (['Asset', 'Expense'].includes(account.type)) {
                    balanceChange = line.debit - line.credit;
                } else {
                    balanceChange = line.credit - line.debit;
                }
                account.balance += balanceChange;
                await accountStore.put(account);
            }
        }

        await tx.done;
        this.notify();
    }

    async delete(id: string): Promise<void> {
        const db = await indexedDBService.getDB();
        const tx = db.transaction(['journal_entries', 'journal_lines', 'accounts'], 'readwrite');

        // Get entry to check status
        const entry = await tx.objectStore('journal_entries').get(id);
        if (!entry) return;

        // Get lines to reverse balance if Posted
        const allLines = await tx.objectStore('journal_lines').getAll();
        const lines = allLines.filter(l => (l as any).entryId === id);

        if (entry.status === 'Posted') {
            const accountStore = tx.objectStore('accounts');
            for (const line of lines) {
                const account = await accountStore.get(line.accountId);
                if (account) {
                    let balanceChange = 0;
                    // Reverse the logic
                    if (['Asset', 'Expense'].includes(account.type)) {
                        balanceChange = line.credit - line.debit; // Reverse
                    } else {
                        balanceChange = line.debit - line.credit; // Reverse
                    }
                    account.balance += balanceChange;
                    await accountStore.put(account);
                }
            }
        }

        // Delete lines
        for (const line of lines) {
            await tx.objectStore('journal_lines').delete(line._id);
        }

        // Delete entry
        await tx.objectStore('journal_entries').delete(id);

        await tx.done;
        this.notify();
    }

    async getStats(): Promise<{ totalEntries: number; lastEntryDate: Date | null }> {
        const entries = await this.getAll();
        return {
            totalEntries: entries.length,
            lastEntryDate: entries.length > 0 ? entries[0].date : null,
        };
    }
}
