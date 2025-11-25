import Realm, { BSON } from 'realm';

/**
 * JournalLine represents a single line in a journal entry.
 * Each line has either a debit OR a credit (not both).
 */
export class JournalLine extends Realm.Object {
    _id: BSON.ObjectId = new BSON.ObjectId();
    accountId!: BSON.ObjectId; // Reference to Account
    debit: number = 0; // Debit amount (0 if credit)
    credit: number = 0; // Credit amount (0 if debit)
    description?: string; // Line-specific description
    createdAt: Date = new Date();

    static primaryKey = '_id';

    /**
     * Returns the account code for display purposes
     */
    get isDebit(): boolean {
        return this.debit > 0;
    }

    get isCredit(): boolean {
        return this.credit > 0;
    }

    get amount(): number {
        return this.debit > 0 ? this.debit : this.credit;
    }
}
