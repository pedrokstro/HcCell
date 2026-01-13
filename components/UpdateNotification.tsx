import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { APP_VERSION } from '../constants';
import { ChangeLogModal } from './ChangeLogModal';

export const UpdateNotification: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useApp();

    useEffect(() => {
        if (!isAuthenticated) return;

        const lastVersion = localStorage.getItem('app_last_seen_version');
        if (lastVersion !== APP_VERSION) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    const handleDismiss = () => {
        setIsOpen(false);
        // Não salva versao, então aparecerá de novo no reload (F5) ou novo login
    };

    const handleConfirm = () => {
        setIsOpen(false);
        // Salva versão, não aparecerá mais até que APP_VERSION mude
        localStorage.setItem('app_last_seen_version', APP_VERSION);
    };

    if (!isOpen) return null;

    return (
        <ChangeLogModal
            isOpen={isOpen}
            onClose={handleDismiss}
            onConfirm={handleConfirm}
        />
    );
};
