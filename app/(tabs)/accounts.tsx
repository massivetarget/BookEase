import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { useQuery, useRealm } from '@realm/react';
import { Account } from '../../src/models';
import { Ionicons } from '@expo/vector-icons';
import { BSON } from 'realm';

export default function AccountsScreen() {
    const realm = useRealm();
    const accounts = useQuery(Account, (collection) =>
        collection.sorted('code')
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    // Form state
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'>('Asset');
    const [subtype, setSubtype] = useState('');

    const accountTypes: Array<'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'> = [
        'Asset',
        'Liability',
        'Equity',
        'Income',
        'Expense',
    ];

    const filteredAccounts = accounts.filtered((account) => {
        const matchesSearch =
            searchQuery === '' ||
            account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.code.includes(searchQuery);
        const matchesType = filterType === null || account.type === filterType;
        return matchesSearch && matchesType;
    });

    const openAddModal = () => {
        setEditingAccount(null);
        setCode('');
        setName('');
        setType('Asset');
        setSubtype('');
        setModalVisible(true);
    };

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setCode(account.code);
        setName(account.name);
        setType(account.type);
        setSubtype(account.subtype || '');
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!code || !name) {
            Alert.alert('Error', 'Code and Name are required');
            return;
        }

        realm.write(() => {
            if (editingAccount) {
                // Update existing account
                editingAccount.name = name;
                editingAccount.type = type;
                editingAccount.subtype = subtype || undefined;
                editingAccount.updatedAt = new Date();
            } else {
                // Create new account
                realm.create(Account, {
                    _id: new BSON.ObjectId(),
                    code,
                    name,
                    type,
                    subtype: subtype || undefined,
                    balance: 0,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        });

        setModalVisible(false);
    };

    const toggleAccountStatus = (account: Account) => {
        realm.write(() => {
            account.isActive = !account.isActive;
            account.updatedAt = new Date();
        });
    };

    const getTypeColor = (accountType: string) => {
        switch (accountType) {
            case 'Asset':
                return '#059669';
            case 'Liability':
                return '#dc2626';
            case 'Equity':
                return '#7c3aed';
            case 'Income':
                return '#2563eb';
            case 'Expense':
                return '#ea580c';
            default:
                return '#6b7280';
        }
    };

    const renderAccount = ({ item }: { item: Account }) => (
        <TouchableOpacity
            style={[styles.accountCard, !item.isActive && styles.inactiveCard]}
            onPress={() => openEditModal(item)}
        >
            <View style={styles.accountHeader}>
                <View style={styles.accountInfo}>
                    <Text style={styles.accountCode}>{item.code}</Text>
                    <Text style={[styles.accountName, !item.isActive && styles.inactiveText]}>
                        {item.name}
                    </Text>
                </View>
                <View style={styles.accountRight}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                        <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.accountFooter}>
                <Text style={styles.balance}>
                    Balance: ${item.balance.toFixed(2)}
                </Text>
                <TouchableOpacity
                    onPress={() => toggleAccountStatus(item)}
                    style={styles.statusButton}
                >
                    <Ionicons
                        name={item.isActive ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={item.isActive ? '#059669' : '#6b7280'}
                    />
                    <Text style={[styles.statusText, { color: item.isActive ? '#059669' : '#6b7280' }]}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#6b7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by code or name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Type Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterChip, filterType === null && styles.filterChipActive]}
                    onPress={() => setFilterType(null)}
                >
                    <Text style={[styles.filterChipText, filterType === null && styles.filterChipTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                {accountTypes.map((accountType) => (
                    <TouchableOpacity
                        key={accountType}
                        style={[styles.filterChip, filterType === accountType && styles.filterChipActive]}
                        onPress={() => setFilterType(accountType)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                filterType === accountType && styles.filterChipTextActive,
                            ]}
                        >
                            {accountType}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Accounts List */}
            <FlatList
                data={filteredAccounts}
                renderItem={renderAccount}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>No accounts found</Text>
                    </View>
                }
            />

            {/* Add Button */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingAccount ? 'Edit Account' : 'Add Account'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Account Code *</Text>
                            <TextInput
                                style={styles.input}
                                value={code}
                                onChangeText={setCode}
                                placeholder="e.g., 1101"
                                editable={!editingAccount} // Can't edit code
                            />

                            <Text style={styles.label}>Account Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g., Cash on Hand"
                            />

                            <Text style={styles.label}>Account Type *</Text>
                            <View style={styles.typeSelector}>
                                {accountTypes.map((accountType) => (
                                    <TouchableOpacity
                                        key={accountType}
                                        style={[
                                            styles.typeOption,
                                            type === accountType && styles.typeOptionActive,
                                            { borderColor: getTypeColor(accountType) },
                                        ]}
                                        onPress={() => setType(accountType)}
                                    >
                                        <Text
                                            style={[
                                                styles.typeOptionText,
                                                type === accountType && { color: getTypeColor(accountType) },
                                            ]}
                                        >
                                            {accountType}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Subtype (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={subtype}
                                onChangeText={setSubtype}
                                placeholder="e.g., Current Asset"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSecondary]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonSecondaryText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
                                <Text style={styles.buttonPrimaryText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#1f2937',
    },
    filterContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#2563eb',
    },
    filterChipText: {
        fontSize: 14,
        color: '#6b7280',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    accountCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inactiveCard: {
        opacity: 0.6,
    },
    accountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountCode: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    inactiveText: {
        color: '#9ca3af',
    },
    accountRight: {
        alignItems: 'flex-end',
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    accountFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balance: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalBody: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    typeOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 8,
        marginBottom: 8,
    },
    typeOptionActive: {
        borderWidth: 2,
    },
    typeOptionText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    buttonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    buttonPrimary: {
        backgroundColor: '#2563eb',
        marginLeft: 8,
    },
    buttonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
