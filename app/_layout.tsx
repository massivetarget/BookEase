import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Platform, View, Text, useColorScheme } from 'react-native';

import { ServiceProvider, useServices } from '@/core/services/ServiceContext';
import { RepositoryFactory } from '@/core/factories/RepositoryFactory';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        ...Ionicons.font,
    });

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
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
                await RepositoryFactory.initializeDatabase();
                const accountRepo = await RepositoryFactory.createAccountRepository();
                const journalRepo = await RepositoryFactory.createJournalRepository();

                setAccountRepository(accountRepo);
                setJournalRepository(journalRepo);

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
