import Realm, { BSON } from 'realm';

/**
 * Account represents a single account in the Chart of Accounts.
 * Follows Double-Entry accounting principles.
 */
export class Account extends Realm.Object {
    _id: BSON.ObjectId = new BSON.ObjectId();
    code!: string; // e.g., "1001", "2001"
    name!: string; // e.g., "Cash on Hand", "Accounts Payable"
    type!: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
    subtype?: string; // e.g., "Current Asset", "Fixed Asset"
    parentAccountId?: BSON.ObjectId; // For account hierarchy
    balance: number = 0; // Cached balance (updated via triggers)
    isActive: boolean = true;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    static primaryKey = '_id';
}
