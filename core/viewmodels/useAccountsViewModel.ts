import { useState, useEffect } from 'react';
import { useServices } from '../services/ServiceContext';
import { Account } from '../../models';
import { Alert } from 'react-native';

export function useAccountsViewModel() {
    const { accountRepository } = useServices();
    const [accounts, setAccounts] = useState<ReadonlyArray<Account>>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);

    // Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('Asset');
    const [subtype, setSubtype] = useState('');

    useEffect(() => {
        const updateAccounts = async () => {
            const data = await accountRepository.search(searchQuery, filterType);
            setAccounts([...data]);
        };

        updateAccounts();
        const unsubscribe = accountRepository.subscribe(updateAccounts);
        return unsubscribe;
    }, [accountRepository, searchQuery, filterType]);

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

    const saveAccount = async () => {
        if (!code || !name) {
            Alert.alert('Error', 'Code and Name are required');
            return;
        }

        if (editingAccount) {
            await accountRepository.update(editingAccount._id.toString(), {
                name,
                type: type as any,
                subtype: subtype || undefined,
            });
        } else {
            await accountRepository.create({
                code,
                name,
                type: type as any,
                subtype: subtype || undefined,
            });
        }
        setModalVisible(false);
    };

    const toggleStatus = async (account: Account) => {
        await accountRepository.toggleStatus(account._id.toString());
    };

    return {
        accounts,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        modalVisible,
        setModalVisible,
        editingAccount,
        form: { code, setCode, name, setName, type, setType, subtype, setSubtype },
        actions: { openAddModal, openEditModal, saveAccount, toggleStatus },
    };
}
