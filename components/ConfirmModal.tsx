
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
            {/* Desktop Modal (SaaS Profissional) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="hidden md:flex fixed inset-0 z-[1000] items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-neutral-800 p-6 overflow-hidden flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        isDanger ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    }`}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                            {title}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Confirmação do Sistema
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-13">
                                {description}
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all active:scale-95"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className={`px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                                        isDanger 
                                        ? 'bg-red-600 text-white hover:bg-red-700' 
                                        : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
                                    }`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Sheet (Padrão Bancada Mobile Pro) */}
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
