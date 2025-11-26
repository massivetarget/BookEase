import Realm, { BSON } from 'realm';
import { JournalLine } from './JournalLine';

/**
 * JournalEntry represents a complete journal entry in the accounting system.
 * Each entry must have balanced debits and credits.
 */
export class JournalEntry extends Realm.Object {
    _id: BSON.ObjectId = new BSON.ObjectId();
    date!: Date;
    description!: string; // Description of the transaction
    reference?: string; // Invoice #, Receipt #, etc.
    status!: 'Draft' | 'Posted'; // Only Posted entries affect the ledger
    lines!: Realm.List<JournalLine>; // Journal lines (debits and credits)
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
    createdBy?: string; // User PIN or ID

    static primaryKey = '_id';

    /**
     * Validates that the entry is balanced (total debits = total credits)
     */
    isBalanced(): boolean {
        let totalDebits = 0;
        let totalCredits = 0;

        this.lines.forEach(line => {
            totalDebits += line.debit;
            totalCredits += line.credit;
        });

        return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for floating point errors
    }

    /**
     * Gets the total amount of the entry (sum of debits or credits)
     */
    getTotalAmount(): number {
        return this.lines.reduce((sum, line) => sum + line.debit, 0);
    }
}
