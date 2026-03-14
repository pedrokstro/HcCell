import React, { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Check, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Option {
    value: string;
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
}

interface SelectionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
    searchable?: boolean;
}

export const SelectionSheet: React.FC<SelectionSheetProps> = ({
    isOpen,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
    searchable = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = searchable 
        ? options.filter(opt => 
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt as any).subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-2 mt-2">
                {searchable && (
                    <div className="relative mb-2 px-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar na lista..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-neutral-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => {
                                onSelect(option.value);
                                onClose();
                            }}
                            className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all active:scale-[0.98] ${isSelected
                                ? 'bg-primary/10 border-2 border-primary shadow-sm shadow-primary/10'
                                : 'bg-slate-50 dark:bg-neutral-800/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-neutral-800'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {option.icon && (
                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white dark:bg-neutral-700 text-slate-500 dark:text-slate-300'}`}>
                                        {option.icon}
                                    </div>
                                )}
                                <div className="flex flex-col text-left">
                                    <span className={`font-bold text-base leading-tight ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {option.label}
                                    </span>
                                    {option.subLabel && (
                                        <span className={`text-xs mt-0.5 ${isSelected ? 'text-primary/70' : 'text-slate-500'}`}>
                                            {option.subLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                >
                                    <Check size={14} className="text-white" strokeWidth={3} />
                                </motion.div>
                            )}
                        </button>
                    );
                })
                ) : (
                    <div className="py-12 text-center text-slate-400 text-sm italic">
                        Nenhum resultado encontrado
                    </div>
                )}
                </div>
            </div>
        </BottomSheet>
    );
};

