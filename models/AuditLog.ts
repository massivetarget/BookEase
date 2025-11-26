import Realm, { BSON } from 'realm';

/**
 * AuditLog tracks all changes made to the accounting data.
 * Provides an audit trail for compliance and debugging.
 */
export class AuditLog extends Realm.Object {
    _id: BSON.ObjectId = new BSON.ObjectId();
    targetId!: BSON.ObjectId; // ID of the affected record
    targetType!: string; // 'Account', 'JournalEntry', etc.
    action!: 'create' | 'update' | 'delete' | 'post' | 'unpost';
    changes?: string; // JSON string of what changed
    timestamp: Date = new Date();
    userPin?: string; // User who made the change

    static primaryKey = '_id';
}
