import { Account } from '../../models';

export interface IAccountRepository {
    getAll(): Promise<Account[]> | Promise<ReadonlyArray<Account>>;
    getById(id: string): Promise<Account | null>;
    create(account: Partial<Account>): Promise<void>;
    update(id: string, account: Partial<Account>): Promise<void>;
    delete(id: string): Promise<void>;
    toggleStatus(id: string): Promise<void>;
    search(query: string, typeFilter: string | null): Promise<Account[]> | Promise<ReadonlyArray<Account>>;
    subscribe(callback: () => void): () => void;
}
