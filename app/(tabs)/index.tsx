import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useDashboardViewModel } from '@/core/viewmodels/useDashboardViewModel';

function DashboardContent() {
    const {
        accounts,
        journalEntries,
        totalAssets,
        totalLiabilities,
        totalEquity,
        postedEntriesCount
    } = useDashboardViewModel();

    return (
        <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className="bg-blue-600 p-5 pt-10">
                <Text className="text-3xl font-bold text-white mb-1">BookEase Dashboard</Text>
                <Text className="text-sm text-blue-100">Privacy-First Bookkeeping {Platform.OS === 'web' ? '(Web Demo)' : ''}</Text>
            </View>

            <View className="bg-white dark:bg-gray-800 m-4 p-4 rounded-xl shadow-sm">
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Balance Sheet Summary</Text>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Total Assets:</Text>
                    <Text className="text-base font-medium text-green-600">
                        ${totalAssets.toFixed(2)}
                    </Text>
                </View>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Total Liabilities:</Text>
                    <Text className="text-base font-medium text-red-600">
                        ${totalLiabilities.toFixed(2)}
                    </Text>
                </View>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Total Equity:</Text>
                    <Text className="text-base text-gray-800 dark:text-gray-100">
                        ${totalEquity.toFixed(2)}
                    </Text>
                </View>

                <View className="flex-row justify-between py-2 mt-2 border-t-2 border-gray-200 dark:border-gray-700">
                    <Text className="text-base font-bold text-gray-800 dark:text-gray-100">Net Worth:</Text>
                    <Text className={`text-base font-bold ${totalAssets - totalLiabilities >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(totalAssets - totalLiabilities).toFixed(2)}
                    </Text>
                </View>
            </View>

            <View className="bg-white dark:bg-gray-800 m-4 p-4 rounded-xl shadow-sm">
                <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Quick Stats</Text>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Total Accounts:</Text>
                    <Text className="text-base text-gray-800 dark:text-gray-100">{accounts.length}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Active Accounts:</Text>
                    <Text className="text-base text-gray-800 dark:text-gray-100">
                        {accounts.filter(a => a.isActive === true).length}
                    </Text>
                </View>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Journal Entries:</Text>
                    <Text className="text-base text-gray-800 dark:text-gray-100">{journalEntries.length}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                    <Text className="text-base text-gray-500 dark:text-gray-400">Posted Entries:</Text>
                    <Text className="text-base text-gray-800 dark:text-gray-100">{postedEntriesCount}</Text>
                </View>
            </View>

            <View className="bg-blue-100 dark:bg-blue-900/30 m-4 p-4 rounded-lg border-l-4 border-blue-600">
                <Text className="text-sm text-blue-800 dark:text-blue-200 leading-5">
                    💡 Tip: Start by reviewing your Chart of Accounts, then create journal entries to record transactions.
                </Text>
            </View>
        </ScrollView>
    );
}

export default function DashboardScreen() {
    return <DashboardContent />;
}

