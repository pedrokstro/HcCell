import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { APP_VERSION } from '../constants';
import { ChangeLogModal } from './ChangeLogModal';

export const UpdateNotification: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user } = useApp();

    const storageKey = `app_last_seen_version_${user.id}`;

    useEffect(() => {
        if (!isAuthenticated || !user.id) return;

        const lastVersion = localStorage.getItem(storageKey);
        if (lastVersion !== APP_VERSION) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user.id, storageKey]);

    const handleDismiss = () => {
        setIsOpen(false);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        // Salva versão específica para este usuário
        localStorage.setItem(storageKey, APP_VERSION);
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
