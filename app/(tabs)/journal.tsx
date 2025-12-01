import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Alert,
    Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useJournalViewModel } from '@/core/viewmodels/useJournalViewModel';
import { JournalEntry, Account } from '@/models';

interface LineItem {
    id: string;
    accountId: string;
    accountName: string;
    debit: string;
    credit: string;
    description: string;
}

function getTypeColor(type: string) {
    switch (type) {
        case 'Asset': return '#059669';
        case 'Liability': return '#dc2626';
        case 'Equity': return '#7c3aed';
        case 'Income': return '#2563eb';
        case 'Expense': return '#ea580c';
        default: return '#6b7280';
    }
}

import { useTheme } from '@/core/contexts/ThemeContext';

// ... imports

function JournalList({ journalEntries, onAdd, onView }) {
    const { effectiveColorScheme } = useTheme();
    const isDark = effectiveColorScheme === 'dark';

    const theme = {
        bg: isDark ? '#111827' : '#f3f4f6',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#f9fafb' : '#1f2937',
        subtext: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
    };

    const renderJournalEntry = ({ item }) => (
        <TouchableOpacity style={[styles.entryCard, { backgroundColor: theme.card }]} onPress={() => onView(item)}>
            <View style={styles.entryHeader}>
                <View>
                    <Text style={[styles.entryDescription, { color: theme.text }]}>{item.description}</Text>
                    <Text style={[styles.entryDate, { color: theme.subtext }]}>
                        {new Date(item.date).toLocaleDateString()}
                        {item.reference ? ` • Ref: ${item.reference}` : ''}
                    </Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'Posted' ? styles.postedBadge : styles.draftBadge]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.entryFooter}>
                <Text style={[styles.entryAmount, { color: theme.text }]}>
                    Amount: ${item.getTotalAmount().toFixed(2)}
                </Text>
                <Text style={[styles.entryLines, { color: theme.subtext }]}>{item.lines.length} lines</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <FlashList<JournalEntry>
                data={journalEntries}
                renderItem={renderJournalEntry}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.listContainer}
                estimatedItemSize={120}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={theme.border} />
                        <Text style={[styles.emptyText, { color: theme.subtext }]}>No journal entries yet</Text>
                        <Text style={[styles.emptySubtext, { color: theme.border }]}>Tap + to create your first entry</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={onAdd}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

function JournalEntryModal({ visible, onClose, onSaveDraft, onPost, accounts }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [reference, setReference] = useState('');
    const [lines, setLines] = useState<LineItem[]>([
        { id: '1', accountId: '', accountName: '', debit: '', credit: '', description: '' },
        { id: '2', accountId: '', accountName: '', debit: '', credit: '', description: '' },
    ]);
    const [accountPickerVisible, setAccountPickerVisible] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);

    const { effectiveColorScheme } = useTheme();
    const isDark = effectiveColorScheme === 'dark';

    const theme = {
        bg: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#f9fafb' : '#1f2937',
        subtext: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
        inputBg: isDark ? '#374151' : '#fff',
        inputBorder: isDark ? '#4b5563' : '#d1d5db',
        lineItemBg: isDark ? '#111827' : '#f9fafb',
        buttonSecondary: isDark ? '#374151' : '#f3f4f6',
    };

    const getTotalDebits = () => lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const getTotalCredits = () => lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    const isBalanced = () => {
        const debits = getTotalDebits();
        const credits = getTotalCredits();
        return Math.abs(debits - credits) < 0.01 && debits > 0;
    };

    const addLine = () => {
        setLines([...lines, { id: Date.now().toString(), accountId: '', accountName: '', debit: '', credit: '', description: '' }]);
    };

    const removeLine = (id: string) => {
        if (lines.length > 2) {
            setLines(lines.filter((line) => line.id !== id));
        } else {
            Alert.alert('Error', 'You must have at least 2 lines');
        }
    };

    const updateLine = (id: string, field: keyof LineItem, value: string) => {
        setLines(lines.map((line) => {
            if (line.id === id) {
                const updated = { ...line, [field]: value };
                if (field === 'debit' && value) updated.credit = '';
                else if (field === 'credit' && value) updated.debit = '';
                return updated;
            }
            return line;
        }));
    };

    const selectAccount = (account) => {
        if (currentLineIndex !== null) {
            setLines(lines.map((line, index) => {
                if (index === currentLineIndex) {
                    return {
                        ...line,
                        accountId: account._id.toString(),
                        accountName: `${account.code} - ${account.name}`
                    };
                }
                return line;
            }));
        }
        setAccountPickerVisible(false);
        setCurrentLineIndex(null);
    };

    const openAccountPicker = (index: number) => {
        setCurrentLineIndex(index);
        setAccountPickerVisible(true);
    };

    const handleSaveDraft = () => {
        if (!description) { Alert.alert('Error', 'Description is required'); return; }
        const validLines = lines.filter((line) => line.accountId && (line.debit || line.credit));
        if (validLines.length < 2) { Alert.alert('Error', 'You must have at least 2 valid lines'); return; }
        onSaveDraft({ date, description, reference, lines: validLines });
    };

    const handlePost = () => {
        if (!description) { Alert.alert('Error', 'Description is required'); return; }
        const validLines = lines.filter((line) => line.accountId && (line.debit || line.credit));
        if (validLines.length < 2) { Alert.alert('Error', 'You must have at least 2 valid lines'); return; }
        if (!isBalanced()) { Alert.alert('Error', 'Entry is not balanced.'); return; }
        onPost({ date, description, reference, lines: validLines });
    };

    const renderLine = ({ item, index }: { item: LineItem; index: number }) => (
        <View style={[styles.lineItem, { backgroundColor: theme.lineItemBg, borderColor: theme.border }]}>
            <View style={styles.lineHeader}>
                <Text style={[styles.lineNumber, { color: theme.subtext }]}>Line {index + 1}</Text>
                {lines.length > 2 && (
                    <TouchableOpacity onPress={() => removeLine(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#dc2626" />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity
                style={[styles.accountSelector, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                onPress={() => openAccountPicker(index)}
            >
                <Text style={item.accountName ? [styles.accountSelected, { color: theme.text }] : [styles.accountPlaceholder, { color: theme.subtext }]}>
                    {item.accountName || 'Select Account'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.subtext} />
            </TouchableOpacity>
            <View style={styles.amountRow}>
                <View style={styles.amountInput}>
                    <Text style={[styles.amountLabel, { color: theme.subtext }]}>Debit</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                        value={item.debit}
                        onChangeText={(v) => updateLine(item.id, 'debit', v)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={theme.subtext}
                    />
                </View>
                <View style={styles.amountInput}>
                    <Text style={[styles.amountLabel, { color: theme.subtext }]}>Credit</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                        value={item.credit}
                        onChangeText={(v) => updateLine(item.id, 'credit', v)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={theme.subtext}
                    />
                </View>
            </View>
            <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                value={item.description}
                onChangeText={(v) => updateLine(item.id, 'description', v)}
                placeholder="Line description (optional)"
                placeholderTextColor={theme.subtext}
            />
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide">
            <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
                <View style={[styles.modalHeader, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>New Journal Entry</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color={theme.subtext} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                    <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.subtext}
                    />
                    <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g., Purchase of office supplies"
                        placeholderTextColor={theme.subtext}
                    />
                    <Text style={[styles.label, { color: theme.text }]}>Reference</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                        value={reference}
                        onChangeText={setReference}
                        placeholder="Invoice #, Receipt #, etc."
                        placeholderTextColor={theme.subtext}
                    />
                    <View style={styles.linesHeader}>
                        <Text style={[styles.linesTitle, { color: theme.text }]}>Journal Lines</Text>
                        <TouchableOpacity onPress={addLine} style={styles.addLineButton}>
                            <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
                            <Text style={styles.addLineText}>Add Line</Text>
                        </TouchableOpacity>
                    </View>
                    <FlashList<LineItem> data={lines} renderItem={renderLine} keyExtractor={(item) => item.id} scrollEnabled={false}
                        estimatedItemSize={200} />
                    <View style={[styles.balanceCard, isBalanced() ? styles.balanceCardGood : styles.balanceCardBad]}>
                        <View style={styles.balanceRow}>
                            <Text style={[styles.balanceLabel, { color: '#374151' }]}>Total Debits:</Text>
                            <Text style={[styles.balanceValue, { color: '#374151' }]}>${getTotalDebits().toFixed(2)}</Text>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={[styles.balanceLabel, { color: '#374151' }]}>Total Credits:</Text>
                            <Text style={[styles.balanceValue, { color: '#374151' }]}>${getTotalCredits().toFixed(2)}</Text>
                        </View>
                        <View style={[styles.balanceRow, styles.balanceDivider]}>
                            <Text style={[styles.balanceLabelBold, { color: '#1f2937' }]}>Difference:</Text>
                            <Text style={[styles.balanceValueBold, isBalanced() ? styles.balanced : styles.unbalanced]}>
                                ${Math.abs(getTotalDebits() - getTotalCredits()).toFixed(2)}
                            </Text>
                        </View>
                        {isBalanced() ? (
                            <View style={styles.balanceStatus}>
                                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                                <Text style={styles.balanceStatusTextGood}>Entry is balanced ✓</Text>
                            </View>
                        ) : (
                            <View style={styles.balanceStatus}>
                                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                                <Text style={styles.balanceStatusTextBad}>Entry is not balanced</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
                <View style={[styles.modalFooter, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
                    <TouchableOpacity style={[styles.button, styles.buttonSecondary, { backgroundColor: theme.buttonSecondary }]} onPress={handleSaveDraft}>
                        <Text style={[styles.buttonSecondaryText, { color: theme.subtext }]}>Save Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonPrimary, !isBalanced() && styles.buttonDisabled]} onPress={handlePost} disabled={!isBalanced()}>
                        <Text style={styles.buttonPrimaryText}>Post Entry</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal visible={accountPickerVisible} animationType="slide" transparent>
                <View style={styles.pickerOverlay}>
                    <View style={[styles.pickerContent, { backgroundColor: theme.bg }]}>
                        <View style={[styles.pickerHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Account ({accounts.length})</Text>
                            <TouchableOpacity onPress={() => setAccountPickerVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.subtext} />
                            </TouchableOpacity>
                        </View>
                        <FlashList<Account>
                            data={accounts}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.accountOption, { borderBottomColor: theme.border }]} onPress={() => selectAccount(item)}>
                                    <Text style={[styles.accountCode, { color: theme.subtext }]}>{item.code}</Text>
                                    <Text style={[styles.accountName, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={[styles.accountType, { color: getTypeColor(item.type) }]}>
                                        {item.type}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item._id.toString()}
                            estimatedItemSize={70}
                        />
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

export default function JournalScreen() {
    const {
        journalEntries,
        accounts,
        modalVisible,
        setModalVisible,
        viewModalVisible,
        setViewModalVisible,
        selectedEntry,
        actions
    } = useJournalViewModel();

    const { effectiveColorScheme } = useTheme();
    const isDark = effectiveColorScheme === 'dark';

    const theme = {
        bg: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#f9fafb' : '#1f2937',
        subtext: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
        card: isDark ? '#111827' : '#f9fafb',
    };

    return (
        <>
            <JournalList journalEntries={journalEntries} onAdd={() => setModalVisible(true)} onView={actions.viewEntry} />
            <JournalEntryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSaveDraft={actions.saveDraft}
                onPost={actions.postEntry}
                accounts={accounts}
            />
            {/* View Modal Logic Here */}
            <Modal visible={viewModalVisible} animationType="slide" transparent>
                <View style={styles.pickerOverlay}>
                    <View style={[styles.pickerContent, { backgroundColor: theme.bg }]}>
                        <View style={[styles.pickerHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.pickerTitle, { color: theme.text }]}>Journal Entry Details</Text>
                            <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.subtext} />
                            </TouchableOpacity>
                        </View>
                        {selectedEntry && (
                            <ScrollView style={styles.viewBody}>
                                <View style={[styles.viewRow, { borderBottomColor: theme.border }]}>
                                    <Text style={[styles.viewLabel, { color: theme.subtext }]}>Date:</Text>
                                    <Text style={[styles.viewValue, { color: theme.text }]}>
                                        {new Date(selectedEntry.date).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[styles.viewRow, { borderBottomColor: theme.border }]}>
                                    <Text style={[styles.viewLabel, { color: theme.subtext }]}>Description:</Text>
                                    <Text style={[styles.viewValue, { color: theme.text }]}>{selectedEntry.description}</Text>
                                </View>
                                {selectedEntry.reference && (
                                    <View style={[styles.viewRow, { borderBottomColor: theme.border }]}>
                                        <Text style={[styles.viewLabel, { color: theme.subtext }]}>Reference:</Text>
                                        <Text style={[styles.viewValue, { color: theme.text }]}>{selectedEntry.reference}</Text>
                                    </View>
                                )}
                                <View style={[styles.viewRow, { borderBottomColor: theme.border }]}>
                                    <Text style={[styles.viewLabel, { color: theme.subtext }]}>Status:</Text>
                                    <View style={[styles.statusBadge, selectedEntry.status === 'Posted' ? styles.postedBadge : styles.draftBadge]}>
                                        <Text style={styles.statusText}>{selectedEntry.status}</Text>
                                    </View>
                                </View>

                                <Text style={[styles.viewSectionTitle, { color: theme.text }]}>Lines:</Text>
                                {selectedEntry.lines.map((line, index) => {
                                    const account = accounts.find(a => a._id.toString() === line.accountId.toString());
                                    return (
                                        <View key={line._id.toString()} style={[styles.viewLineCard, { backgroundColor: theme.card }]}>
                                            <Text style={[styles.viewLineNumber, { color: theme.subtext }]}>Line {index + 1}</Text>
                                            <Text style={[styles.viewLineAccount, { color: theme.text }]}>
                                                {account ? `${account.code} - ${account.name}` : 'Unknown Account'}
                                            </Text>
                                            <View style={styles.viewLineAmounts}>
                                                <Text style={[styles.viewLineAmount, { color: theme.text }]}>
                                                    Debit: ${line.debit.toFixed(2)}
                                                </Text>
                                                <Text style={[styles.viewLineAmount, { color: theme.text }]}>
                                                    Credit: ${line.credit.toFixed(2)}
                                                </Text>
                                            </View>
                                            {line.description && (
                                                <Text style={[styles.viewLineDesc, { color: theme.subtext }]}>{line.description}</Text>
                                            )}
                                        </View>
                                    );
                                })}

                                <View style={styles.viewTotals}>
                                    <View style={[styles.viewRow, { borderBottomColor: 'transparent' }]}>
                                        <Text style={[styles.viewLabelBold, { color: theme.text }]}>Total:</Text>
                                        <Text style={[styles.viewValueBold, { color: theme.text }]}>
                                            ${selectedEntry.getTotalAmount().toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    listContainer: {
        padding: 16,
    },
    entryCard: {
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
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    entryDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    entryDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    postedBadge: {
        backgroundColor: '#d1fae5',
    },
    draftBadge: {
        backgroundColor: '#fef3c7',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    entryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    entryAmount: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    entryLines: {
        fontSize: 12,
        color: '#6b7280',
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
    emptySubtext: {
        fontSize: 14,
        color: '#d1d5db',
        marginTop: 4,
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
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalBody: {
        flex: 1,
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
    linesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    linesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    addLineButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addLineText: {
        fontSize: 14,
        color: '#2563eb',
        marginLeft: 4,
        fontWeight: '600',
    },
    lineItem: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    lineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    lineNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    accountSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    accountPlaceholder: {
        fontSize: 16,
        color: '#9ca3af',
    },
    accountSelected: {
        fontSize: 16,
        color: '#1f2937',
    },
    amountRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    amountInput: {
        flex: 1,
        marginRight: 8,
    },
    amountLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 4,
    },
    balanceCard: {
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    balanceCardGood: {
        backgroundColor: '#d1fae5',
        borderWidth: 2,
        borderColor: '#059669',
    },
    balanceCardBad: {
        backgroundColor: '#fee2e2',
        borderWidth: 2,
        borderColor: '#dc2626',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#374151',
    },
    balanceLabelBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    balanceValue: {
        fontSize: 14,
        color: '#374151',
    },
    balanceValueBold: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    balanceDivider: {
        borderTopWidth: 2,
        borderTopColor: '#9ca3af',
        marginTop: 8,
        paddingTop: 8,
    },
    balanced: {
        color: '#059669',
    },
    unbalanced: {
        color: '#dc2626',
    },
    balanceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    balanceStatusTextGood: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 8,
    },
    balanceStatusTextBad: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
        marginLeft: 8,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#fff',
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
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        minHeight: 400, // Ensure height for FlashList
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    accountOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
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
        marginBottom: 4,
    },
    accountType: {
        fontSize: 12,
        fontWeight: '600',
    },
    viewBody: {
        padding: 20,
    },
    viewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    viewLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    viewLabelBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    viewValue: {
        fontSize: 14,
        color: '#1f2937',
    },
    viewValueBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    viewSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 24,
        marginBottom: 12,
    },
    viewLineCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    viewLineNumber: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    viewLineAccount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    viewLineAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    viewLineAmount: {
        fontSize: 14,
        color: '#374151',
    },
    viewLineDesc: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        fontStyle: 'italic',
    },
    viewTotals: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#e5e7eb',
    },
});
