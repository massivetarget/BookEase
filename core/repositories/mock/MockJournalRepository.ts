import { IJournalRepository } from '../../interfaces/IJournalRepository';
import { JournalEntry, JournalLine } from '../../../models';
import { v4 as uuidv4 } from 'uuid';

// Mock Data
const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
    {
        _id: uuidv4(),
        date: new Date(),
        description: 'Opening Balance',
        reference: 'REF-001',
        status: 'Posted',
        lines: [
            { _id: uuidv4(), accountId: uuidv4(), debit: 5000, credit: 0, description: 'Cash' } as any,
            { _id: uuidv4(), accountId: uuidv4(), debit: 0, credit: 5000, description: 'Equity' } as any,
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        getTotalAmount: () => 5000,
    } as unknown as JournalEntry,
];

export class MockJournalRepository implements IJournalRepository {
    private entries: JournalEntry[] = [...MOCK_JOURNAL_ENTRIES];
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

    async getAll(): Promise<ReadonlyArray<JournalEntry>> {
        return this.entries;
    }

    async getById(id: string): Promise<JournalEntry | null> {
        return this.entries.find(e => e._id.toString() === id) || null;
    }

    async create(entry: Partial<JournalEntry>): Promise<void> {
        const newEntry = {
            ...entry,
            _id: uuidv4(),
            status: 'Draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            getTotalAmount: () => {
                return (entry.lines || []).reduce((sum, line) => sum + (line.debit || 0), 0);
            }
        } as JournalEntry;
        this.entries.push(newEntry);
        this.notifyListeners();
    }

    async update(id: string, entry: Partial<JournalEntry>): Promise<void> {
        const index = this.entries.findIndex(e => e._id.toString() === id);
        if (index !== -1) {
            this.entries[index] = { ...this.entries[index], ...entry, updatedAt: new Date() };
            this.notifyListeners();
        }
    }

    async delete(id: string): Promise<void> {
        this.entries = this.entries.filter(e => e._id.toString() !== id);
        this.notifyListeners();
    }

    async post(id: string): Promise<void> {
        const entry = await this.getById(id);
        if (entry) {
            entry.status = 'Posted';
            entry.updatedAt = new Date();
            this.notifyListeners();
        }
    }
}
