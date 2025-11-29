// Standard TypeScript Interfaces for Models

export interface Account {
    _id: string;
    code: string;
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
    subtype?: string;
    balance: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface JournalLine {
    _id: string;
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
    createdAt: Date;
}

export interface JournalEntry {
    _id: string;
    date: Date;
    description: string;
    reference?: string;
    status: 'Draft' | 'Posted';
    lines: JournalLine[];
    createdAt: Date;
    updatedAt: Date;
    getTotalAmount: () => number;
}

// Helper to calculate total amount for JournalEntry
export const getJournalEntryTotal = (lines: JournalLine[]): number => {
    return lines.reduce((sum, line) => sum + (line.debit || 0), 0);
};
