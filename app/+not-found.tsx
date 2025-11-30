import { Redirect, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
    // Automatically redirect to the main tabs if a route is not found.
    // This handles the case where Electron/Web starts at a URL that doesn't match the router's expectations.
    return <Redirect href="/(tabs)" />;
}
