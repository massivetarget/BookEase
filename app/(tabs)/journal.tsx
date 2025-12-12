// Journal Screen with dynamic theming
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useJournalViewModel } from '@/core/viewmodels/useJournalViewModel';
import { JournalEntry, Account } from '@/models';
import { useTheme } from '@/core/contexts/ThemeContext';

interface LineItem {
    id: string;
    accountId: string;
    accountName: string;
    debit: string;
    credit: string;
    description: string;
}

function getTypeColor(type: string, colors: any) {
    switch (type) {
        case 'Asset':
            return colors.success;
        case 'Liability':
            return colors.error;
        case 'Equity':
            return colors.primary;
        case 'Income':
            return colors.success;
        case 'Expense':
            return colors.error;
        default:
            return colors.subText;
    }
}

function JournalList({ journalEntries, onAdd, onView }: any) {
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const renderJournalEntry = ({ item }: any) => (
        <TouchableOpacity style={styles.entryCard} onPress={() => onView(item)}>
            <View style={styles.entryHeader}>
                <View>
                    <Text style={styles.entryDescription}>{item.description}</Text>
                    <Text style={styles.entryDate}>
                        {new Date(item.date).toLocaleDateString()}{item.reference ? ` • Ref: ${item.reference}` : ''}
                    </Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'Posted' ? styles.postedBadge : styles.draftBadge]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.entryFooter}>
                <Text style={styles.entryAmount}>Amount: ${item.getTotalAmount().toFixed(2)}</Text>
                <Text style={styles.entryLines}>{item.lines.length} lines</Text>
            </View>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
            <FlashList
                data={journalEntries}
                renderItem={renderJournalEntry}
                keyExtractor={(item: any) => item._id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={colors.subText} />
                        <Text style={styles.emptyText}>No journal entries yet</Text>
                        <Text style={styles.emptySubtext}>Tap + to create your first entry</Text>
                    </View>
                }
            />
            <TouchableOpacity style={styles.fab} onPress={onAdd}>
                <Ionicons name="add" size={28} color={colors.subText} />
            </TouchableOpacity>
        </View>
    );
}

function JournalEntryModal({ visible, onClose, onSaveDraft, onPost, accounts }: any) {
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [reference, setReference] = useState('');
    const [lines, setLines] = useState<LineItem[]>([
        { id: '1', accountId: '', accountName: '', debit: '', credit: '', description: '' },
        { id: '2', accountId: '', accountName: '', debit: '', credit: '', description: '' },
    ]);
    const [isSimpleMode, setIsSimpleMode] = useState(false);
    const [transactionType, setTransactionType] = useState<'Income' | 'Expense'>('Expense');
    const [simpleAmount, setSimpleAmount] = useState('');
    const [categoryAccount, setCategoryAccount] = useState<Account | null>(null);
    const [paymentAccount, setPaymentAccount] = useState<Account | null>(null);
    const [accountPickerVisible, setAccountPickerVisible] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
    const [pickerTarget, setPickerTarget] = useState<'line' | 'category' | 'payment'>('line');

    const getTotalDebits = () => lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const getTotalCredits = () => lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    const isBalanced = () => Math.abs(getTotalDebits() - getTotalCredits()) < 0.01 && getTotalDebits() > 0;

    const addLine = () => setLines([...lines, { id: Date.now().toString(), accountId: '', accountName: '', debit: '', credit: '', description: '' }]);
    const removeLine = (id: string) => {
        if (lines.length > 2) setLines(lines.filter(l => l.id !== id));
        else Alert.alert('Error', 'You must have at least 2 lines');
    };
    const updateLine = (id: string, field: keyof LineItem, value: string) => {
        setLines(lines.map(line => {
            if (line.id === id) {
                const updated = { ...line, [field]: value } as LineItem;
                if (field === 'debit' && value) updated.credit = '';
                else if (field === 'credit' && value) updated.debit = '';
                return updated;
            }
            return line;
        }));
    };
    const selectAccount = (account: Account) => {
        if (pickerTarget === 'line' && currentLineIndex !== null) {
            setLines(lines.map((line, idx) => idx === currentLineIndex ? { ...line, accountId: account._id.toString(), accountName: `${account.code} - ${account.name}` } : line));
            setCurrentLineIndex(null);
        } else if (pickerTarget === 'category') {
            setCategoryAccount(account);
        } else if (pickerTarget === 'payment') {
            setPaymentAccount(account);
        }
        setAccountPickerVisible(false);
    };
    const openAccountPicker = (target: 'line' | 'category' | 'payment', index: number | null = null) => {
        setPickerTarget(target);
        if (index !== null) setCurrentLineIndex(index);
        setAccountPickerVisible(true);
    };
    const handleSaveDraft = () => {
        if (!description) { Alert.alert('Error', 'Description is required'); return; }
        const validLines = lines.filter(l => l.accountId && (l.debit || l.credit));
        if (validLines.length < 2) { Alert.alert('Error', 'You must have at least 2 valid lines'); return; }
        onSaveDraft({ date, description, reference, lines: validLines });
    };
    const handlePost = () => {
        let finalDescription = description;
        let validLines: LineItem[] = [];

        if (isSimpleMode) {
            if (!simpleAmount || parseFloat(simpleAmount) <= 0) { Alert.alert('Error', 'Amount must be valid'); return; }
            if (!categoryAccount) { Alert.alert('Error', 'Category account is required'); return; }
            if (!paymentAccount) { Alert.alert('Error', 'Payment account is required'); return; }

            finalDescription = `${transactionType}: ${categoryAccount.name}`;
            const amount = parseFloat(simpleAmount).toFixed(2);

            if (transactionType === 'Expense') {
                validLines = [
                    { id: '1', accountId: categoryAccount._id.toString(), accountName: categoryAccount.name, debit: amount, credit: '', description: '' },
                    { id: '2', accountId: paymentAccount._id.toString(), accountName: paymentAccount.name, debit: '', credit: amount, description: '' },
                ];
            } else {
                validLines = [
                    { id: '1', accountId: paymentAccount._id.toString(), accountName: paymentAccount.name, debit: amount, credit: '', description: '' },
                    { id: '2', accountId: categoryAccount._id.toString(), accountName: categoryAccount.name, debit: '', credit: amount, description: '' },
                ];
            }
        } else {
            if (!description) { Alert.alert('Error', 'Description is required'); return; }
            validLines = lines.filter(l => l.accountId && (l.debit || l.credit));
            if (validLines.length < 2) { Alert.alert('Error', 'You must have at least 2 valid lines'); return; }
            if (!isBalanced()) { Alert.alert('Error', 'Entry is not balanced.'); return; }
        }

        onPost({ date, description: finalDescription, reference, lines: validLines });
    };
    const renderLine = ({ item, index }: any) => (
        <View style={styles.lineItem}>
            <View style={styles.lineHeader}>
                <Text style={styles.lineNumber}>Line {index + 1}</Text>
                {lines.length > 2 && (
                    <TouchableOpacity onPress={() => removeLine(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.accountSelector} onPress={() => openAccountPicker('line', index)}>
                <Text style={item.accountName ? styles.accountSelected : styles.accountPlaceholder}>
                    {item.accountName || 'Select Account'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.subText} />
            </TouchableOpacity>
            <View style={styles.amountRow}>
                <View style={styles.amountInput}>
                    <Text style={styles.amountLabel}>Debit</Text>
                    <TextInput
                        style={styles.input}
                        value={item.debit}
                        onChangeText={v => updateLine(item.id, 'debit', v)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                    />
                </View>
                <View style={styles.amountInput}>
                    <Text style={styles.amountLabel}>Credit</Text>
                    <TextInput
                        style={styles.input}
                        value={item.credit}
                        onChangeText={v => updateLine(item.id, 'credit', v)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                    />
                </View>
            </View>
            <TextInput
                style={styles.input}
                value={item.description}
                onChangeText={v => updateLine(item.id, 'description', v)}
                placeholder="Line description (optional)"
            />
        </View>
    );
    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{isSimpleMode ? 'Simple Entry' : 'New Journal Entry'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setIsSimpleMode(!isSimpleMode)} style={{ marginRight: 16 }}>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>
                                {isSimpleMode ? 'Advanced Mode' : 'Simple Mode'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={colors.subText} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView style={styles.modalBody}>
                    <Text style={styles.label}>Date *</Text>
                    <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
                    {isSimpleMode ? (
                        <>
                            <Text style={styles.label}>Transaction Type</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                                <TouchableOpacity
                                    style={[styles.typeOption, transactionType === 'Expense' && styles.typeOptionActive, { borderColor: colors.error }]}
                                    onPress={() => setTransactionType('Expense')}
                                >
                                    <Text style={[styles.typeOptionText, { color: transactionType === 'Expense' ? colors.error : colors.subText }]}>Money Out (Expense)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeOption, transactionType === 'Income' && styles.typeOptionActive, { borderColor: colors.success }]}
                                    onPress={() => setTransactionType('Income')}
                                >
                                    <Text style={[styles.typeOptionText, { color: transactionType === 'Income' ? colors.success : colors.subText }]}>Money In (Income)</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.label}>Amount *</Text>
                            <TextInput
                                style={[styles.input, { fontSize: 24, fontWeight: 'bold' }]}
                                value={simpleAmount}
                                onChangeText={setSimpleAmount}
                                keyboardType="decimal-pad"
                                placeholder="$0.00"
                            />
                            <Text style={styles.label}>{transactionType === 'Expense' ? 'Category (What did you buy?)' : 'Category (Source of Funds)'} *</Text>
                            <TouchableOpacity style={styles.accountSelector} onPress={() => openAccountPicker('category')}>
                                <Text style={categoryAccount ? styles.accountSelected : styles.accountPlaceholder}>
                                    {categoryAccount ? `${categoryAccount.code} - ${categoryAccount.name}` : 'Select Category'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.subText} />
                            </TouchableOpacity>
                            <Text style={styles.label}>{transactionType === 'Expense' ? 'Paid From' : 'Deposited To'} *</Text>
                            <TouchableOpacity style={styles.accountSelector} onPress={() => openAccountPicker('payment')}>
                                <Text style={paymentAccount ? styles.accountSelected : styles.accountPlaceholder}>
                                    {paymentAccount ? `${paymentAccount.code} - ${paymentAccount.name}` : 'Select Account'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.subText} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Reference</Text>
                            <TextInput style={styles.input} value={reference} onChangeText={setReference} placeholder="Invoice #, Receipt #, etc." />
                            <View style={styles.linesHeader}>
                                <Text style={styles.linesTitle}>Journal Lines</Text>
                                <TouchableOpacity onPress={addLine} style={styles.addLineButton}>
                                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                    <Text style={styles.addLineText}>Add Line</Text>
                                </TouchableOpacity>
                            </View>
                            <FlashList
                                data={lines}
                                renderItem={renderLine}
                                keyExtractor={(item: any) => item.id}
                            />
                        </>
                    )}
                </ScrollView>
                <View style={styles.modalFooter}>
                    {!isSimpleMode && (
                        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleSaveDraft}>
                            <Text style={styles.buttonSecondaryText}>Save Draft</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary, (!isSimpleMode && !isBalanced()) && styles.buttonDisabled]}
                        onPress={handlePost}
                        disabled={!isSimpleMode && !isBalanced()}
                    >
                        <Text style={styles.buttonPrimaryText}>Post Entry</Text>
                    </TouchableOpacity>
                </View>
                <Modal visible={accountPickerVisible} animationType="slide" transparent={true}>
                    <View style={styles.pickerOverlay}>
                        <View style={styles.pickerContent}>
                            <View style={styles.pickerHeader}>
                                <Text style={styles.pickerTitle}>Select Account ({accounts.length})</Text>
                                <TouchableOpacity onPress={() => setAccountPickerVisible(false)}>
                                    <Ionicons name="close" size={28} color={colors.subText} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <FlashList
                                    data={accounts}
                                    renderItem={({ item }: { item: any }) => (
                                        <TouchableOpacity style={styles.accountOption} onPress={() => selectAccount(item)}>
                                            <Text style={styles.accountCode}>{item.code}</Text>
                                            <Text style={styles.accountName}>{item.name}</Text>
                                            <Text style={[styles.accountType, { color: getTypeColor(item.type, colors) }]}>{item.type}</Text>
                                        </TouchableOpacity>
                                    )}
                                    // @ts-ignore
                                    estimatedItemSize={70}
                                    keyExtractor={(item: any) => item._id.toString()}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}

export default function JournalScreen() {
    const { journalEntries, accounts, modalVisible, setModalVisible, viewModalVisible, setViewModalVisible, selectedEntry, actions } = useJournalViewModel();
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
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
            <Modal visible={viewModalVisible} animationType="slide" transparent={false}>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContent}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Journal Entry Details</Text>
                            <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.subText} />
                            </TouchableOpacity>
                        </View>
                        {selectedEntry && (
                            <ScrollView style={styles.viewBody}>
                                <View style={styles.viewRow}>
                                    <Text style={styles.viewLabel}>Date:</Text>
                                    <Text style={styles.viewValue}>{new Date(selectedEntry.date).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.viewRow}>
                                    <Text style={styles.viewLabel}>Description:</Text>
                                    <Text style={styles.viewValue}>{selectedEntry.description}</Text>
                                </View>
                                {selectedEntry.reference && (
                                    <View style={styles.viewRow}>
                                        <Text style={styles.viewLabel}>Reference:</Text>
                                        <Text style={styles.viewValue}>{selectedEntry.reference}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

function getStyles(colors: any) {
    // Placeholder for style generation; actual implementation should return a StyleSheet object.
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        entryCard: { margin: 8, padding: 12, backgroundColor: colors.card, borderRadius: 8 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
        entryDescription: { fontSize: 16, color: colors.text },
        entryDate: { fontSize: 12, color: colors.subText },
        statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
        postedBadge: { backgroundColor: colors.success },
        draftBadge: { backgroundColor: colors.warning },
        statusText: { color: colors.subText },
        entryFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
        entryAmount: { fontWeight: 'bold', color: colors.text },
        entryLines: { color: colors.subText },
        listContainer: { paddingBottom: 80 },
        emptyContainer: { alignItems: 'center', marginTop: 50 },
        emptyText: { marginTop: 16, fontSize: 18, color: colors.subText },
        emptySubtext: { marginTop: 4, fontSize: 14, color: colors.subText },
        fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.primary, borderRadius: 28, width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
        modalContainer: { flex: 1, backgroundColor: colors.background },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.header },
        modalTitle: { fontSize: 20, color: colors.text },
        modalBody: { padding: 16 },
        label: { fontSize: 14, color: colors.subText, marginBottom: 4 },
        input: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 8, color: colors.text },
        button: { padding: 12, borderRadius: 4, alignItems: 'center', marginTop: 12 },
        buttonPrimary: { backgroundColor: colors.primary },
        buttonPrimaryText: { color: colors.subText, fontWeight: '600' },
        buttonSecondary: { backgroundColor: colors.card },
        buttonSecondaryText: { color: colors.text },
        buttonDisabled: { opacity: 0.5 },
        linesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
        linesTitle: { fontSize: 16, color: colors.text },
        addLineButton: { flexDirection: 'row', alignItems: 'center' },
        addLineText: { marginLeft: 4, color: colors.primary },
        lineItem: { marginVertical: 8, padding: 8, backgroundColor: colors.card, borderRadius: 4 },
        lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        lineNumber: { fontWeight: '600', color: colors.text },
        accountSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
        accountSelected: { color: colors.text },
        accountPlaceholder: { color: colors.subText },
        amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
        amountInput: { flex: 0.48 },
        amountLabel: { fontSize: 12, color: colors.subText },
        pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
        pickerContent: { margin: 20, backgroundColor: colors.card, borderRadius: 8, padding: 16, maxHeight: '80%', flex: 1 },
        pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        pickerTitle: { fontSize: 18, color: colors.text },
        accountOption: { paddingVertical: 8 },
        accountCode: { fontWeight: '600', color: colors.text },
        accountName: { color: colors.subText },
        accountType: { marginTop: 4 },
        viewBody: { padding: 16 },
        viewRow: { flexDirection: 'row', marginBottom: 8 },
        viewLabel: { width: 100, color: colors.subText },
        viewValue: { color: colors.text },
        typeOption: { flex: 0.48, borderWidth: 1, borderRadius: 4, padding: 8, marginRight: 8 },
        typeOptionActive: { backgroundColor: colors.card },
        typeOptionText: { textAlign: 'center' },
        modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
    });
}
