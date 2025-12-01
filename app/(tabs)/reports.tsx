import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/contexts/ThemeContext';

export default function ReportsScreen() {
    const { effectiveColorScheme } = useTheme();
    const isDark = effectiveColorScheme === 'dark';

    const theme = {
        bg: isDark ? '#111827' : '#f3f4f6',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#f9fafb' : '#1f2937',
        subtext: isDark ? '#9ca3af' : '#6b7280',
        infoBox: isDark ? '#1e3a8a' : '#dbeafe',
        infoText: isDark ? '#bfdbfe' : '#1e40af',
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Reports & Analytics</Text>
                <Text style={styles.subtitle}>Coming Soon</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Ionicons name="bar-chart-outline" size={48} color="#2563eb" />
                <Text style={[styles.cardTitle, { color: theme.text }]}>General Ledger</Text>
                <Text style={[styles.cardDescription, { color: theme.subtext }]}>
                    View all transactions for a specific account with date range filtering
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Ionicons name="list-outline" size={48} color="#059669" />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Trial Balance</Text>
                <Text style={[styles.cardDescription, { color: theme.subtext }]}>
                    Summary of all account balances to verify debits equal credits
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Ionicons name="trending-up-outline" size={48} color="#7c3aed" />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Income Statement (P&L)</Text>
                <Text style={[styles.cardDescription, { color: theme.subtext }]}>
                    Revenue minus expenses for a given period
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Ionicons name="wallet-outline" size={48} color="#ea580c" />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Balance Sheet</Text>
                <Text style={[styles.cardDescription, { color: theme.subtext }]}>
                    Assets = Liabilities + Equity at a point in time
                </Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.infoBox }]}>
                <Text style={[styles.infoText, { color: theme.infoText }]}>
                    📊 These reports will be implemented in the next phase with interactive charts and PDF export capabilities.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        margin: 16,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    infoBox: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
