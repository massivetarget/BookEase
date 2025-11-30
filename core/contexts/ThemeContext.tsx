import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveColorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [theme, setThemeState] = useState<Theme>('system');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme) {
                setThemeState(savedTheme as Theme);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        } finally {
            setLoaded(true);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const effectiveColorScheme =
        theme === 'system' ? (systemColorScheme ?? 'light') : theme;

    if (!loaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
