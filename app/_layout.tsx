import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Platform, View, Text, ActivityIndicator } from 'react-native';

import { ServiceProvider, useServices } from '@/core/services/ServiceContext';
import { RepositoryFactory } from '@/core/factories/RepositoryFactory';
import { ThemeProvider, useTheme } from '@/core/contexts/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
    const { effectiveColorScheme } = useTheme();

    return (
        <NavigationThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
    );
}

export default function RootLayout() {
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
                <ThemeProvider>
                    <RootLayoutContent />
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
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Starting up...</Text>
            </View>
        );
    }

    return <>{children}</>;
}
