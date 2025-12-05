import { IJournalRepository } from '../../interfaces/IJournalRepository';
import { JournalEntry } from '../../../models';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'bookease_journal_entries';

export class WebJournalRepository implements IJournalRepository {
    private listeners: (() => void)[] = [];

    constructor() {
        // No default seeds needed for Journal, start empty
    }

    private getEntries(): JournalEntry[] {
        if (typeof localStorage === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        return JSON.parse(data, (key, value) => {
            if (key === 'date' || key === 'createdAt' || key === 'updatedAt') {
                return new Date(value);
            }
            return value;
        });
    }

    private saveEntries(entries: JournalEntry[]) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

    async getAll(): Promise<ReadonlyArray<JournalEntry>> {
        return this.getEntries();
    }

    async getById(id: string): Promise<JournalEntry | null> {
        const entries = this.getEntries();
        return entries.find(e => e._id.toString() === id) || null;
    }

    async create(entry: Partial<JournalEntry>): Promise<void> {
        const entries = this.getEntries();
        const newEntry = {
            ...entry,
            _id: uuidv4(),
            status: entry.status || 'Draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any;

        entries.push(newEntry);
        this.saveEntries(entries);
    }

    async update(id: string, entryUpdates: Partial<JournalEntry>): Promise<void> {
        const entries = this.getEntries();
        const index = entries.findIndex(e => e._id.toString() === id);

        if (index !== -1) {
            entries[index] = {
                ...entries[index],
                ...entryUpdates,
                updatedAt: new Date()
            };
            this.saveEntries(entries);
        }
    }

    async delete(id: string): Promise<void> {
        let entries = this.getEntries();
        entries = entries.filter(e => e._id.toString() !== id);
        this.saveEntries(entries);
    }

    async post(id: string): Promise<void> {
        const entries = this.getEntries();
        const index = entries.findIndex(e => e._id.toString() === id);

        if (index !== -1) {
            entries[index] = {
                ...entries[index],
                status: 'Posted',
                updatedAt: new Date()
            };
            this.saveEntries(entries);
        }
    }
}
