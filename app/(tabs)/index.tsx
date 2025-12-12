import React, { useMemo } from 'react';
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
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const netWorth = totalAssets - totalLiabilities;

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
                    <Text style={[styles.valueBold, netWorth >= 0 ? styles.positive : styles.negative]}>
                        ${netWorth.toFixed(2)}
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
    return <DashboardContent />;
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff', // Always white on primary
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#e0e7ff', // Lighter shade for subtitle on primary
    },
    card: {
        backgroundColor: colors.card,
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
        color: colors.text,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        color: colors.subText,
    },
    labelBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    value: {
        fontSize: 16,
        color: colors.text,
    },
    valueBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    positive: {
        color: colors.success,
    },
    negative: {
        color: colors.error,
    },
    divider: {
        borderTopWidth: 2,
        borderTopColor: colors.border,
        marginTop: 8,
        paddingTop: 12,
    },
    infoBox: {
        backgroundColor: colors.infoBox,
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    infoText: {
        fontSize: 14,
        color: colors.infoText,
        lineHeight: 20,
    },
});
