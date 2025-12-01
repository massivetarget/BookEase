import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useDashboardViewModel } from '@/core/viewmodels/useDashboardViewModel';
import { useTheme } from '@/core/contexts/ThemeContext';

function DashboardContent() {
    const {
        accounts,
        journalEntries,
        totalAssets,
        totalLiabilities,
        totalEquity,
        postedEntriesCount
    } = useDashboardViewModel();

    const { effectiveColorScheme } = useTheme();
    const isDark = effectiveColorScheme === 'dark';

    const theme = {
        bg: isDark ? '#111827' : '#f3f4f6',
        headerBg: '#2563eb',
        headerText: '#fff',
        headerSubtext: '#dbeafe',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#f9fafb' : '#1f2937',
        subtext: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
        success: '#16a34a',
        danger: '#dc2626',
        infoBox: isDark ? 'rgba(30, 58, 138, 0.5)' : '#dbeafe',
        infoText: isDark ? '#bfdbfe' : '#1e40af',
        infoBorder: '#2563eb',
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={[styles.title, { color: theme.headerText }]}>BookEase Dashboard</Text>
                <Text style={[styles.subtitle, { color: theme.headerSubtext }]}>
                    Privacy-First Bookkeeping {Platform.OS === 'web' ? '(Web Demo)' : ''}
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Balance Sheet Summary</Text>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Total Assets:</Text>
                    <Text style={[styles.value, { color: theme.success }]}>
                        ${totalAssets.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Total Liabilities:</Text>
                    <Text style={[styles.value, { color: theme.danger }]}>
                        ${totalLiabilities.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Total Equity:</Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        ${totalEquity.toFixed(2)}
                    </Text>
                </View>

                <View style={[styles.row, styles.divider, { borderTopColor: theme.border }]}>
                    <Text style={[styles.labelBold, { color: theme.text }]}>Net Worth:</Text>
                    <Text style={[styles.valueBold, { color: totalAssets - totalLiabilities >= 0 ? theme.success : theme.danger }]}>
                        ${(totalAssets - totalLiabilities).toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Quick Stats</Text>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Total Accounts:</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{accounts.length}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Active Accounts:</Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        {accounts.filter(a => a.isActive === true).length}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Journal Entries:</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{journalEntries.length}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.subtext }]}>Posted Entries:</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{postedEntriesCount}</Text>
                </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.infoBox, borderLeftColor: theme.infoBorder }]}>
                <Text style={[styles.infoText, { color: theme.infoText }]}>
                    💡 Tip: Start by reviewing your Chart of Accounts, then create journal entries to record transactions.
                </Text>
            </View>
        </ScrollView>
    );
}

export default function DashboardScreen() {
    return <DashboardContent />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    card: {
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
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
    },
    labelBold: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    valueBold: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        borderTopWidth: 2,
        marginTop: 8,
        paddingTop: 12,
    },
    infoBox: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
