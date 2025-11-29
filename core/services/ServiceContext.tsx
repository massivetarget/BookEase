import React, { createContext, useContext, ReactNode, useState } from 'react';
import { IAccountRepository } from '../interfaces/IAccountRepository';
import { IJournalRepository } from '../interfaces/IJournalRepository';

interface IServiceContext {
    accountRepository: IAccountRepository;
    journalRepository: IJournalRepository;
    setAccountRepository: (repo: IAccountRepository) => void;
    setJournalRepository: (repo: IJournalRepository) => void;
}

const ServiceContext = createContext<IServiceContext | null>(null);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [accountRepository, setAccountRepository] = useState<IAccountRepository | null>(null);
    const [journalRepository, setJournalRepository] = useState<IJournalRepository | null>(null);

    // We cast to IServiceContext because we know we will initialize them before use
    // or we should handle nulls in consumers. For now, let's assume initialization happens quickly.
    const value = {
        accountRepository: accountRepository!,
        journalRepository: journalRepository!,
        setAccountRepository,
        setJournalRepository
    };

    return (
        <ServiceContext.Provider value={value}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};
