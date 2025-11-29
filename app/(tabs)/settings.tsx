import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Appearance, useColorScheme, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackupService } from '@/core/services/BackupService';
import { User } from '@react-native-google-signin/google-signin';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isDark = colorScheme === 'dark';
    const themeColors = {
        background: isDark ? '#111827' : '#f3f4f6',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#f9fafb' : '#1f2937',
        subText: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#f3f4f6',
        header: isDark ? '#1e40af' : '#2563eb',
        infoBox: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
        infoText: isDark ? '#93c5fd' : '#1e40af',
    };

    const styles = getStyles(themeColors);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const currentUser = await BackupService.getCurrentUser();
        setUser(currentUser);
    };

    const handleThemeChange = (mode: 'light' | 'dark' | null) => {
        Appearance.setColorScheme(mode);
        setThemeModalVisible(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const userInfo = await BackupService.signIn();
        setUser(userInfo);
        setIsLoading(false);
    };

    const handleGoogleSignOut = async () => {
        setIsLoading(true);
        await BackupService.signOut();
        setUser(null);
        setIsLoading(false);
    };

    const handleBackup = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in with Google to backup your data.');
            return;
        }
        setIsLoading(true);
        const success = await BackupService.backupDatabase();
        setIsLoading(false);
        if (success) {
            Alert.alert('Success', 'Backup completed successfully!');
        } else {
            Alert.alert('Error', 'Backup failed. Please try again.');
        }
    };

    const handleRestore = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in with Google to restore your data.');
            return;
        }
        Alert.alert(
            'Confirm Restore',
            'This will overwrite your current data with the backup from Google Drive. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        const success = await BackupService.restoreDatabase();
                        setIsLoading(false);
                        if (success) {
                            Alert.alert('Success', 'Data restored successfully! Please restart the app.');
                        } else {
                            Alert.alert('Error', 'Restore failed. No backup found or network error.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <TouchableOpacity style={styles.settingItem} onPress={() => setThemeModalVisible(true)}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="moon-outline" size={24} color={themeColors.subText} />
                        <Text style={styles.settingText}>Theme</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.settingValue}>
                            {colorScheme === 'dark' ? 'Dark' : 'Light'}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Google Drive Backup</Text>

                {!user ? (
                    <TouchableOpacity style={styles.settingItem} onPress={handleGoogleSignIn} disabled={isLoading}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="logo-google" size={24} color={themeColors.subText} />
                            <Text style={styles.settingText}>Sign in with Google</Text>
                        </View>
                        {isLoading ? <ActivityIndicator size="small" color={themeColors.subText} /> : <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />}
                    </TouchableOpacity>
                ) : (
                    <>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="person-circle-outline" size={24} color={themeColors.subText} />
                                <Text style={styles.settingText}>{user.user.email}</Text>
                            </View>
                            <TouchableOpacity onPress={handleGoogleSignOut}>
                                <Text style={{ color: 'red', marginRight: 8 }}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.settingItem} onPress={handleBackup} disabled={isLoading}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="cloud-upload-outline" size={24} color={themeColors.subText} />
                                <Text style={styles.settingText}>Backup Now</Text>
                            </View>
                            {isLoading ? <ActivityIndicator size="small" color={themeColors.subText} /> : <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem} onPress={handleRestore} disabled={isLoading}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="cloud-download-outline" size={24} color={themeColors.subText} />
                                <Text style={styles.settingText}>Restore from Backup</Text>
                            </View>
                            {isLoading ? <ActivityIndicator size="small" color={themeColors.subText} /> : <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />}
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="download-outline" size={24} color={themeColors.subText} />
                        <Text style={styles.settingText}>Export Data (JSON)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sync</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="phone-portrait-outline" size={24} color={themeColors.subText} />
                        <Text style={styles.settingText}>Pair Device (P2P)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="qr-code-outline" size={24} color={themeColors.subText} />
                        <Text style={styles.settingText}>Show QR Code</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="lock-closed-outline" size={24} color={themeColors.subText} />
                        <Text style={styles.settingText}>Change PIN</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="finger-print-outline" size={24} color={themeColors.subText} />
                        <Text style={styles.settingText}>Biometric Authentication</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Version</Text>
                    <Text style={styles.settingValue}>1.0.0</Text>
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Database</Text>
                    <Text style={styles.settingValue}>Expo SQLite</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    🔒 All data is stored locally on your device. Backups are encrypted before upload.
                </Text>
            </View>

            <Modal visible={themeModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setThemeModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Theme</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleThemeChange('light')}>
                            <Text style={styles.modalOptionText}>Light</Text>
                            {colorScheme === 'light' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleThemeChange('dark')}>
                            <Text style={styles.modalOptionText}>Dark</Text>
                            {colorScheme === 'dark' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleThemeChange(null)}>
                            <Text style={styles.modalOptionText}>System Default</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.header,
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.subText,
        marginLeft: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    settingItem: {
        backgroundColor: colors.card,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 12,
    },
    settingValue: {
        fontSize: 14,
        color: colors.subText,
        marginRight: 8,
    },
    infoBox: {
        backgroundColor: colors.infoBox,
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.header,
        marginTop: 24,
        marginBottom: 32,
    },
    infoText: {
        fontSize: 14,
        color: colors.infoText,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalOptionText: {
        fontSize: 16,
        color: colors.text,
    },
});
