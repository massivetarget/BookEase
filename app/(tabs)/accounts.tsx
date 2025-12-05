import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useAccountsViewModel } from '@/core/viewmodels/useAccountsViewModel';
import { Account } from '@/models';
import { useTheme } from '@/core/contexts/ThemeContext';

// Shared types and constants
const ACCOUNT_TYPES: Array<'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'> = [
    'Asset',
    'Liability',
    'Equity',
    'Income',
    'Expense',
];

const getTypeColor = (accountType: string) => {
    switch (accountType) {
        case 'Asset': return '#059669';
        case 'Liability': return '#dc2626';
        case 'Equity': return '#7c3aed';
        case 'Income': return '#2563eb';
        case 'Expense': return '#ea580c';
        default: return '#6b7280';
    }
};

function AccountsList({ accounts, onEdit, onToggleStatus, searchQuery, setSearchQuery, filterType, setFilterType, openAddModal }) {
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const renderAccount = ({ item }) => (
        <TouchableOpacity
            style={[styles.accountCard, !item.isActive && styles.inactiveCard]}
            onPress={() => onEdit(item)}
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
                    onPress={() => onToggleStatus(item)}
                    style={styles.statusButton}
                >
                    <Ionicons
                        name={item.isActive ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={item.isActive ? colors.success : colors.subText}
                    />
                    <Text style={[styles.statusText, { color: item.isActive ? colors.success : colors.subText }]}>
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
                    <Ionicons name="search" size={20} color={colors.subText} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by code or name..."
                        placeholderTextColor={colors.subText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Type Filter */}
            <View style={{ flexGrow: 0 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, filterType === null && styles.filterChipActive]}
                        onPress={() => setFilterType(null)}
                    >
                        <Text style={[styles.filterChipText, filterType === null && styles.filterChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {ACCOUNT_TYPES.map((accountType) => {
                        const isActive = filterType === accountType;
                        const activeColor = getTypeColor(accountType);
                        const pluralName = {
                            'Asset': 'Assets',
                            'Liability': 'Liabilities',
                            'Equity': 'Equity',
                            'Income': 'Income',
                            'Expense': 'Expenses'
                        }[accountType] || accountType;

                        return (
                            <TouchableOpacity
                                key={accountType}
                                style={[
                                    styles.filterChip,
                                    isActive && { backgroundColor: activeColor }
                                ]}
                                onPress={() => setFilterType(accountType)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        isActive && styles.filterChipTextActive,
                                    ]}
                                >
                                    {pluralName}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Accounts List */}
            <View style={{ flex: 1 }}>
                <FlashList<Account>
                    data={accounts}
                    renderItem={renderAccount}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={styles.listContainer}
                    estimatedItemSize={100}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={64} color={colors.border} />
                            <Text style={styles.emptyText}>No accounts found</Text>
                        </View>
                    }
                />
            </View>

            {/* Add Button */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

function AccountModal({ visible, onClose, onSave, editingAccount, code, setCode, name, setName, type, setType, subtype, setSubtype }) {
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingAccount ? 'Edit Account' : 'Add Account'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={colors.subText} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.label}>Account Code *</Text>
                        <TextInput
                            style={styles.input}
                            value={code}
                            onChangeText={setCode}
                            placeholder="e.g., 1101"
                            placeholderTextColor={colors.subText}
                            editable={!editingAccount}
                        />

                        <Text style={styles.label}>Account Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Cash on Hand"
                            placeholderTextColor={colors.subText}
                        />

                        <Text style={styles.label}>Account Type *</Text>
                        <View style={styles.typeSelector}>
                            {ACCOUNT_TYPES.map((accountType) => (
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
                            placeholderTextColor={colors.subText}
                        />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonSecondaryText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={onSave}>
                            <Text style={styles.buttonPrimaryText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function AccountsScreen() {
    const {
        accounts,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        modalVisible,
        setModalVisible,
        editingAccount,
        form,
        actions
    } = useAccountsViewModel();

    return (
        <>
            <AccountsList
                accounts={accounts}
                onEdit={actions.openEditModal}
                onToggleStatus={actions.toggleStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterType={filterType}
                setFilterType={setFilterType}
                openAddModal={actions.openAddModal}
            />
            <AccountModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={actions.saveAccount}
                editingAccount={editingAccount}
                code={form.code}
                setCode={form.setCode}
                name={form.name}
                setName={form.setName}
                type={form.type}
                setType={form.setType}
                subtype={form.subtype}
                setSubtype={form.setSubtype}
            />
        </>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.text,
    },
    filterContainer: {
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexGrow: 0,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.background,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterChipText: {
        fontSize: 13,
        color: colors.subText,
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    accountCard: {
        backgroundColor: colors.card,
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
        color: colors.subText,
        marginBottom: 4,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    inactiveText: {
        color: colors.subText,
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
        color: colors.subText,
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
        color: colors.subText,
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
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
        backgroundColor: colors.card,
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
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalBody: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.inputBackground,
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
        borderColor: colors.border,
        marginRight: 8,
        marginBottom: 8,
    },
    typeOptionActive: {
        borderWidth: 2,
    },
    typeOptionText: {
        fontSize: 14,
        color: colors.subText,
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: colors.background,
        marginRight: 8,
    },
    buttonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.subText,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
        marginLeft: 8,
    },
    buttonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
