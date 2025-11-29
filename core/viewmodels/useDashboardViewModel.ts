import { useState, useEffect } from 'react';
import { useServices } from '../services/ServiceContext';
import { Account } from '../../models';

export function useDashboardViewModel() {
    const { accountRepository, journalRepository } = useServices();
    const [accounts, setAccounts] = useState<ReadonlyArray<Account>>([]);
    const [journalEntries, setJournalEntries] = useState<ReadonlyArray<any>>([]);

    useEffect(() => {
        const updateAccounts = async () => {
            const data = await accountRepository.getAll();
            setAccounts([...data]);
        };
        const updateJournal = async () => {
            const data = await journalRepository.getAll();
            setJournalEntries([...data]);
        };

        // Initial Load
        updateAccounts();
        updateJournal();

        // Subscribe
        const unsubAccounts = accountRepository.subscribe(updateAccounts);
        const unsubJournal = journalRepository.subscribe(updateJournal);

        return () => {
            unsubAccounts();
            unsubJournal();
        };
    }, [accountRepository, journalRepository]);

    const totalAssets = accounts
        .filter(acc => acc.type === 'Asset' && acc.isActive)
        .reduce((sum, acc) => sum + acc.balance, 0);

    const totalLiabilities = accounts
        .filter(acc => acc.type === 'Liability' && acc.isActive)
        .reduce((sum, acc) => sum + acc.balance, 0);

    const totalEquity = accounts
        .filter(acc => acc.type === 'Equity' && acc.isActive)
        .reduce((sum, acc) => sum + acc.balance, 0);

    const postedEntriesCount = journalEntries.filter(e => e.status === 'Posted').length;

    return {
        accounts,
        journalEntries,
        totalAssets,
        totalLiabilities,
        totalEquity,
        postedEntriesCount,
    };
}
