
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomSheet } from './BottomSheet';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger'
}) => {
    const isDanger = variant === 'danger';

    const Content = () => (
        <div className="text-center md:text-left">
            <div className={`mx-auto md:mx-0 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
            }`}>
                <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {description}
            </p>
            <div className="flex flex-col md:flex-row gap-3">
                <button
                    onClick={onConfirm}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg ${
                        isDanger 
                        ? 'bg-red-600 text-white shadow-red-200 dark:shadow-none hover:bg-red-700' 
                        : 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark'
                    }`}
                >
                    {confirmLabel}
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 py-3 px-6 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all active:scale-95"
                >
                    {cancelLabel}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="hidden md:flex fixed inset-0 z-[1000] items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-surface-dark w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-200 dark:border-neutral-800 p-8 overflow-hidden"
                        >
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <Content />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Sheet */}
            <BottomSheet 
                isOpen={isOpen && typeof window !== 'undefined' && window.innerWidth < 768} 
                onClose={onClose}
                title="AÇÃO NECESSÁRIA"
            >
                <div className="pb-4">
                    <Content />
                </div>
            </BottomSheet>
        </>
    );
};
