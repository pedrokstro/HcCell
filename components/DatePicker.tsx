import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { CustomCalendar } from './CustomCalendar';
import { BottomSheet } from './BottomSheet';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, placeholder = 'Selecionar data' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Format date for display: DD/MM/YYYY
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSelect = (date: string) => {
        onChange(date);
        setIsOpen(false);
    };

    // Handle click outside for desktop popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block tracking-widest">
                    {label}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full h-12 px-4 bg-white dark:bg-surface-dark border-2 rounded-2xl transition-all active:scale-[0.98] ${
                    isOpen 
                        ? 'border-primary shadow-sm shadow-primary/10' 
                        : 'border-slate-100 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800'
                }`}
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon size={18} className={value ? 'text-primary' : 'text-slate-400'} />
                    <span className={`text-sm font-bold ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {value ? formatDate(value) : placeholder}
                    </span>
                </div>
            </button>

            {/* Desktop Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="hidden md:block absolute left-0 z-[100] mt-2 origin-top-left"
                    >
                        <CustomCalendar value={value} onChange={handleSelect} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Sheet */}
            <BottomSheet 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
                title={label || placeholder}
            >
                <div className="flex justify-center pb-4">
                    <CustomCalendar value={value} onChange={handleSelect} />
                </div>
            </BottomSheet>
        </div>
    );
};
