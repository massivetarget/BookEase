import { ThemeProvider } from '@/core/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Platform, View, Text } from 'react-native';

import { ServiceProvider, useServices } from '@/core/services/ServiceContext';
import { WebAccountRepository } from '@/core/repositories/web/WebAccountRepository';
import { WebJournalRepository } from '@/core/repositories/web/WebJournalRepository';
import { SQLiteAccountRepository } from '@/core/repositories/sqlite/SQLiteAccountRepository';
import { SQLiteJournalRepository } from '@/core/repositories/sqlite/SQLiteJournalRepository';
import { getDBConnection, createTables, seedDatabase } from '@/core/database/Database';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    // Fonts are missing, skipping loading for now to unblock build
    const loaded = true;

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <ServiceProvider>
            <ServiceInitializer>
                <ThemeProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </ServiceInitializer>
        </ServiceProvider>
    );
}

function ServiceInitializer({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAccountRepository, setJournalRepository } = useServices();

    useEffect(() => {
        const init = async () => {
            try {
                if (Platform.OS === 'web') {
                    setAccountRepository(new WebAccountRepository());
                    setJournalRepository(new WebJournalRepository());
                } else {
                    const db = await getDBConnection();
                    await createTables(db);
                    await seedDatabase(db);
                    setAccountRepository(new SQLiteAccountRepository(db));
                    setJournalRepository(new SQLiteJournalRepository(db));
                }
                setReady(true);
            } catch (e: any) {
                setError(e.message);
            }
        };
        init();
    }, []);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error initializing database: {error}</Text>
            </View>
        );
    }

    if (!ready) {
        return null;
    }

    return <>{children}</>;
}
