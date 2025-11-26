import 'react-native-get-random-values';
import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { RealmProvider } from '@realm/react';
import { schemas } from '../models';
import { seedDefaultAccounts } from '../utils/seedAccounts';

export default function RootLayout() {
    const isWeb = Platform.OS === 'web';

    const content = (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2563eb',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );

    if (isWeb) {
        return content;
    }

    return (
        <RealmProvider
            schema={schemas}
            onFirstOpen={(realm) => {
                // Seed default Chart of Accounts on first run
                seedDefaultAccounts(realm);
            }}
        >
            {content}
        </RealmProvider>
    );
}
