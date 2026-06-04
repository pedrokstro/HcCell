import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className="text-emerald-500 shrink-0" />;
            case 'error':
                return <XCircle size={20} className="text-rose-500 shrink-0" />;
            case 'info':
                return <AlertCircle size={20} className="text-primary shrink-0" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/20 dark:border-emerald-500/10 shadow-emerald-500/10 text-slate-800 dark:text-slate-200';
            case 'error':
                return 'border-rose-500/20 dark:border-rose-500/10 shadow-rose-500/10 text-slate-800 dark:text-slate-200';
            case 'info':
                return 'border-primary/20 dark:border-primary/10 shadow-primary/10 text-slate-800 dark:text-slate-200';
        }
    };

    const getBarColor = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500';
            case 'error':
                return 'bg-rose-500';
            case 'info':
                return 'bg-primary';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-auto max-w-[calc(100vw-32px)] sm:w-[380px]">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className={`pointer-events-auto relative flex items-center gap-3.5 w-full px-4.5 py-3.5 rounded-2xl border bg-white/95 dark:bg-[#0c1315]/95 backdrop-blur-xl shadow-2xl overflow-hidden ${getStyles(toast.type)}`}
                        >
                            {getIcon(toast.type)}
                            <p className="flex-1 text-xs sm:text-sm font-black tracking-tight leading-relaxed">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                            >
                                <X size={16} />
                            </button>
                            
                            {/* Barra de progresso */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-neutral-800/40 pointer-events-none">
                                <div 
                                    className={`h-full rounded-r-full ${getBarColor(toast.type)} animate-toast-progress`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
