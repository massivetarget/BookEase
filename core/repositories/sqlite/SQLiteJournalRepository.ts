import { IJournalRepository } from '../../interfaces/IJournalRepository';
import { JournalEntry } from '../../../models';

export class SQLiteJournalRepository implements IJournalRepository {
    constructor(db: any) { }

    subscribe(callback: () => void): () => void {
        return () => { };
    }

    async getAll(): Promise<JournalEntry[]> {
        throw new Error("Not implemented on Web");
    }

    async getById(id: string): Promise<JournalEntry | null> {
        throw new Error("Not implemented on Web");
    }

    async create(entry: Partial<JournalEntry>): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async update(id: string, entry: Partial<JournalEntry>): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Not implemented on Web");
    }

    async post(id: string): Promise<void> {
        throw new Error("Not implemented on Web");
    }
}
