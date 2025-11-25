import 'react-native-get-random-values';
import React from 'react';
import { Stack } from 'expo-router';
import { RealmProvider } from '@realm/react';
import { schemas } from '../src/models';
import { seedDefaultAccounts } from '../src/utils/seedAccounts';

export default function RootLayout() {
    return (
        <RealmProvider
            schema={schemas}
            onFirstOpen={(realm) => {
                // Seed default Chart of Accounts on first run
                seedDefaultAccounts(realm);
            }}
        >
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
        </RealmProvider>
    );
}
