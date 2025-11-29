import { JournalEntry } from '../../models';

export interface IJournalRepository {
    getAll(): Promise<JournalEntry[]> | Promise<ReadonlyArray<JournalEntry>>;
    getById(id: string): Promise<JournalEntry | null>;
    create(entry: Partial<JournalEntry>): Promise<void>;
    update(id: string, entry: Partial<JournalEntry>): Promise<void>;
    delete(id: string): Promise<void>;
    post(id: string): Promise<void>;
    subscribe(callback: () => void): () => void;
}
