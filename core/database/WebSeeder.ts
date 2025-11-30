import { indexedDBService } from './IndexedDBService';
import { v4 as uuidv4 } from 'uuid';

export const seedWebDatabase = async () => {
    const db = await indexedDBService.getDB();
    const count = await db.count('accounts');

    if (count === 0) {
        const now = new Date();
        const accounts = [
            { id: uuidv4(), code: '1001', name: 'Cash on Hand', type: 'Asset', balance: 0 },
            { id: uuidv4(), code: '1002', name: 'Checking Account', type: 'Asset', balance: 0 },
            { id: uuidv4(), code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 0 },
            { id: uuidv4(), code: '2001', name: 'Accounts Payable', type: 'Liability', balance: 0 },
            { id: uuidv4(), code: '2100', name: 'Credit Card', type: 'Liability', balance: 0 },
            { id: uuidv4(), code: '3001', name: 'Owner\'s Equity', type: 'Equity', balance: 0 },
            { id: uuidv4(), code: '3002', name: 'Retained Earnings', type: 'Equity', balance: 0 },
            { id: uuidv4(), code: '4001', name: 'Sales Revenue', type: 'Income', balance: 0 },
            { id: uuidv4(), code: '4002', name: 'Service Revenue', type: 'Income', balance: 0 },
            { id: uuidv4(), code: '5001', name: 'Rent Expense', type: 'Expense', balance: 0 },
            { id: uuidv4(), code: '5002', name: 'Utilities Expense', type: 'Expense', balance: 0 },
            { id: uuidv4(), code: '5003', name: 'Salaries Expense', type: 'Expense', balance: 0 },
        ];

        const tx = db.transaction('accounts', 'readwrite');
        for (const acc of accounts) {
            await tx.store.put({
                ...acc,
                subtype: '',
                isActive: true,
                createdAt: now,
                updatedAt: now,
            } as any);
        }
        await tx.done;
        console.log('Web Database seeded with default accounts');
    }
};
