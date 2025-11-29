import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useServices } from '../services/ServiceContext';
import { JournalEntry, Account } from '../../models';
import { Alert } from 'react-native';

export function useJournalViewModel() {
    const { journalRepository, accountRepository } = useServices();
    const [journalEntries, setJournalEntries] = useState<ReadonlyArray<JournalEntry>>([]);
    const [accounts, setAccounts] = useState<ReadonlyArray<Account>>([]);

    // UI State
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    useFocusEffect(
        useCallback(() => {
            const updateData = async () => {
                const entries = await journalRepository.getAll();
                const accs = await accountRepository.getAll();
                setJournalEntries([...entries]);
                setAccounts([...accs]);
            };

            updateData();
            const unsubJournal = journalRepository.subscribe(updateData);
            const unsubAccounts = accountRepository.subscribe(updateData);

            return () => {
                unsubJournal();
                unsubAccounts();
            };
        }, [journalRepository, accountRepository])
    );

    const processData = (data: any) => ({
        ...data,
        date: new Date(data.date),
        lines: data.lines.map((line: any) => ({
            ...line,
            debit: parseFloat(line.debit) || 0,
            credit: parseFloat(line.credit) || 0,
        })),
    });

    const saveDraft = async (data: any) => {
        await journalRepository.create({ ...processData(data), status: 'Draft' });
        setModalVisible(false);
        Alert.alert('Success', 'Journal entry saved as draft');
    };

    const postEntry = async (data: any) => {
        await journalRepository.create({ ...processData(data), status: 'Posted' });
        setModalVisible(false);
        Alert.alert('Success', 'Journal entry posted');
    };

    const viewEntry = (entry: JournalEntry) => {
        setSelectedEntry(entry);
        setViewModalVisible(true);
    };

    return {
        journalEntries,
        accounts,
        modalVisible,
        setModalVisible,
        viewModalVisible,
        setViewModalVisible,
        selectedEntry,
        actions: { saveDraft, postEntry, viewEntry },
    };
}
