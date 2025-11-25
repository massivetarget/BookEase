import { Account } from '../models/Account';
import Realm, { BSON } from 'realm';

/**
 * Default Chart of Accounts for a small business.
 * Based on standard accounting practices.
 */
export interface DefaultAccountTemplate {
    code: string;
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
    subtype?: string;
}

export const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccountTemplate[] = [
    // ASSETS (1000-1999)
    { code: '1000', name: 'Assets', type: 'Asset' },
    { code: '1100', name: 'Current Assets', type: 'Asset', subtype: 'Current Asset' },
    { code: '1101', name: 'Cash on Hand', type: 'Asset', subtype: 'Current Asset' },
    { code: '1102', name: 'Cash in Bank', type: 'Asset', subtype: 'Current Asset' },
    { code: '1103', name: 'Petty Cash', type: 'Asset', subtype: 'Current Asset' },
    { code: '1200', name: 'Accounts Receivable', type: 'Asset', subtype: 'Current Asset' },
    { code: '1300', name: 'Inventory', type: 'Asset', subtype: 'Current Asset' },
    { code: '1500', name: 'Fixed Assets', type: 'Asset', subtype: 'Fixed Asset' },
    { code: '1501', name: 'Equipment', type: 'Asset', subtype: 'Fixed Asset' },
    { code: '1502', name: 'Furniture & Fixtures', type: 'Asset', subtype: 'Fixed Asset' },
    { code: '1503', name: 'Vehicles', type: 'Asset', subtype: 'Fixed Asset' },

    // LIABILITIES (2000-2999)
    { code: '2000', name: 'Liabilities', type: 'Liability' },
    { code: '2100', name: 'Current Liabilities', type: 'Liability', subtype: 'Current Liability' },
    { code: '2101', name: 'Accounts Payable', type: 'Liability', subtype: 'Current Liability' },
    { code: '2102', name: 'Credit Card Payable', type: 'Liability', subtype: 'Current Liability' },
    { code: '2103', name: 'Sales Tax Payable', type: 'Liability', subtype: 'Current Liability' },
    { code: '2200', name: 'Long-term Liabilities', type: 'Liability', subtype: 'Long-term Liability' },
    { code: '2201', name: 'Loans Payable', type: 'Liability', subtype: 'Long-term Liability' },

    // EQUITY (3000-3999)
    { code: '3000', name: 'Equity', type: 'Equity' },
    { code: '3100', name: 'Owner\'s Equity', type: 'Equity' },
    { code: '3200', name: 'Retained Earnings', type: 'Equity' },

    // INCOME (4000-4999)
    { code: '4000', name: 'Income', type: 'Income' },
    { code: '4100', name: 'Sales Revenue', type: 'Income' },
    { code: '4200', name: 'Service Revenue', type: 'Income' },
    { code: '4300', name: 'Other Income', type: 'Income' },

    // EXPENSES (5000-5999)
    { code: '5000', name: 'Expenses', type: 'Expense' },
    { code: '5100', name: 'Cost of Goods Sold', type: 'Expense' },
    { code: '5200', name: 'Operating Expenses', type: 'Expense' },
    { code: '5201', name: 'Rent Expense', type: 'Expense' },
    { code: '5202', name: 'Utilities Expense', type: 'Expense' },
    { code: '5203', name: 'Salaries & Wages', type: 'Expense' },
    { code: '5204', name: 'Office Supplies', type: 'Expense' },
    { code: '5205', name: 'Marketing & Advertising', type: 'Expense' },
    { code: '5206', name: 'Insurance Expense', type: 'Expense' },
    { code: '5207', name: 'Depreciation Expense', type: 'Expense' },
    { code: '5300', name: 'Other Expenses', type: 'Expense' },
];

/**
 * Seeds the database with the default Chart of Accounts.
 * Only runs if no accounts exist.
 */
export function seedDefaultAccounts(realm: Realm): void {
    const existingAccounts = realm.objects(Account);

    if (existingAccounts.length > 0) {
        console.log('Accounts already exist, skipping seed.');
        return;
    }

    realm.write(() => {
        DEFAULT_CHART_OF_ACCOUNTS.forEach(template => {
            realm.create(Account, {
                _id: new BSON.ObjectId(),
                code: template.code,
                name: template.name,
                type: template.type,
                subtype: template.subtype,
                balance: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });
    });

    console.log(`Seeded ${DEFAULT_CHART_OF_ACCOUNTS.length} default accounts.`);
}
