import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useQuery } from '@realm/react';
import { Account, JournalEntry } from '../../models';

// Mock data for Web
const MOCK_ACCOUNTS = [
    { balance: 5000, type: 'Asset', isActive: true },
    { balance: 2000, type: 'Liability', isActive: true },
    { balance: 3000, type: 'Equity', isActive: true },
];
const MOCK_ENTRIES = [{}, {}, {}]; // Just for length count

function DashboardContent({ accounts, journalEntries }) {
    // Calculate total assets, liabilities, equity
    const totalAssets = accounts
        .filter(acc => acc.type === 'Asset' && acc.isActive === true)
        .reduce((sum, acc) => sum + acc.balance, 0);

    const totalLiabilities = accounts
        .filter(acc => acc.type === 'Liability' && acc.isActive === true)
        .reduce((sum, acc) => sum + acc.balance, 0);

    const totalEquity = accounts
        .filter(acc => acc.type === 'Equity' && acc.isActive === true)
        .reduce((sum, acc) => sum + acc.balance, 0);

    const postedEntriesCount = journalEntries.filter(e => e.status === 'Posted').length;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>BookEase Dashboard</Text>
                <Text style={styles.subtitle}>Privacy-First Bookkeeping {Platform.OS === 'web' ? '(Web Demo)' : ''}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Balance Sheet Summary</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Assets:</Text>
                    <Text style={[styles.value, styles.positive]}>
                        ${totalAssets.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Liabilities:</Text>
                    <Text style={[styles.value, styles.negative]}>
                        ${totalLiabilities.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Equity:</Text>
                    <Text style={styles.value}>
                        ${totalEquity.toFixed(2)}
                    </Text>
                </View>
                <View style={[styles.row, styles.divider]}>
                    <Text style={styles.labelBold}>Net Worth:</Text>
                    <Text style={[styles.valueBold, totalAssets - totalLiabilities >= 0 ? styles.positive : styles.negative]}>
                        ${(totalAssets - totalLiabilities).toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Quick Stats</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Accounts:</Text>
                    <Text style={styles.value}>{accounts.length}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Active Accounts:</Text>
                    <Text style={styles.value}>
                        {accounts.filter(a => a.isActive === true).length}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Journal Entries:</Text>
                    <Text style={styles.value}>{journalEntries.length}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Posted Entries:</Text>
                    <Text style={styles.value}>{postedEntriesCount}</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    💡 Tip: Start by reviewing your Chart of Accounts, then create journal entries to record transactions.
                </Text>
            </View>
        </ScrollView>
    );
}

export default function DashboardScreen() {
    if (Platform.OS === 'web') {
        return <DashboardContent accounts={MOCK_ACCOUNTS} journalEntries={MOCK_ENTRIES} />;
    }

    const accounts = useQuery(Account);
    const journalEntries = useQuery(JournalEntry);

    return <DashboardContent accounts={accounts} journalEntries={journalEntries} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        backgroundColor: '#2563eb',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#dbeafe',
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        color: '#6b7280',
    },
    labelBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    value: {
        fontSize: 16,
        color: '#1f2937',
    },
    valueBold: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    positive: {
        color: '#059669',
    },
    negative: {
        color: '#dc2626',
    },
    divider: {
        borderTopWidth: 2,
        borderTopColor: '#e5e7eb',
        marginTop: 8,
        paddingTop: 12,
    },
    infoBox: {
        backgroundColor: '#dbeafe',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
    },
    infoText: {
        fontSize: 14,
        color: '#1e40af',
        lineHeight: 20,
    },
});
