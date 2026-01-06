import React from 'react';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
    return (
        <header className="md:hidden flex items-center justify-center p-4 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-40 transition-colors">
            <Logo size="sm" />
        </header>
    );
};
