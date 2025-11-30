import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabsLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = {
        headerBg: isDark ? '#1e40af' : '#2563eb',
        headerText: '#fff',
        tabBarBg: isDark ? '#111827' : '#fff',
        tabBarActive: isDark ? '#60a5fa' : '#2563eb',
        tabBarInactive: isDark ? '#9ca3af' : '#6b7280',
        tabBarBorder: isDark ? '#1f2937' : '#e5e7eb',
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.tabBarActive,
                tabBarInactiveTintColor: theme.tabBarInactive,
                tabBarStyle: {
                    backgroundColor: theme.tabBarBg,
                    borderTopColor: theme.tabBarBorder,
                },
                headerStyle: {
                    backgroundColor: theme.headerBg,
                },
                headerTintColor: theme.headerText,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="accounts"
                options={{
                    title: 'Accounts',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "wallet" : "wallet-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    title: 'Journal',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "document-text" : "document-text-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
