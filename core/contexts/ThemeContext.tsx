import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
    ThemeProvider as NavigationThemeProvider,
    Theme as NavigationTheme,
} from '@react-navigation/native';

type ThemeMode = 'light' | 'dark' | 'system';

interface Colors {
    background: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    primary: string;
    danger: string;
    success: string;
    warning: string;
    infoBox: string;
    infoText: string;
    header: string;
    inputBackground: string;
}

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
    colors: Colors;
    navigationTheme: NavigationTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LightColors: Colors = {
    background: '#f3f4f6',
    card: '#ffffff',
    text: '#1f2937',
    subText: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    danger: '#dc2626',
    success: '#059669',
    warning: '#ea580c',
    infoBox: '#dbeafe',
    infoText: '#1e40af',
    header: '#2563eb',
    inputBackground: '#ffffff',
};

const DarkColors: Colors = {
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    subText: '#9ca3af',
    border: '#374151',
    primary: '#3b82f6',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f97316',
    infoBox: 'rgba(37, 99, 235, 0.2)',
    infoText: '#93c5fd',
    header: '#1e40af',
    inputBackground: '#374151',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme_preference');
            if (savedTheme) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference', error);
        } finally {
            setIsReady(true);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            setThemeModeState(mode);
            await AsyncStorage.setItem('theme_preference', mode);
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    if (!isReady) {
        return null; // Or a loading spinner
    }

    const isDark =
        themeMode === 'system'
            ? systemColorScheme === 'dark'
            : themeMode === 'dark';

    const colors = isDark ? DarkColors : LightColors;
    const navigationTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                setThemeMode,
                isDark,
                colors,
                navigationTheme,
            }}
        >
            <NavigationThemeProvider value={navigationTheme}>
                {children}
            </NavigationThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
