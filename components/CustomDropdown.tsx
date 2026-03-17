
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectionSheet } from './SelectionSheet';

interface Option {
    value: string;
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
}

interface CustomDropdownProps {
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
    label: string;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
    searchable?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    selectedValue,
    onSelect,
    label,
    placeholder = 'Selecione...',
    icon,
    className = '',
    fullWidth = false,
    searchable = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [direction, setDirection] = useState<'down' | 'up'>('down');
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect space to determine direction
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // If less than 300px below, and more space above, open up
            if (spaceBelow < 300 && rect.top > spaceBelow) {
                setDirection('up');
            } else {
                setDirection('down');
            }
        }
    }, [isOpen]);

    const filteredOptions = searchable 
        ? options.filter(opt => 
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt as any).subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;
    const selectedOption = options.find(opt => opt.value === selectedValue);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        onSelect(value);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`} ref={containerRef}>
            {/* Desktop and Mobile Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm transition-all text-sm font-medium hover:border-primary/50 ${isOpen ? 'ring-2 ring-primary/20 border-primary shadow-md' : ''}`}
            >
                <div className="flex items-center gap-2.5 truncate">
                    {icon && <div className="text-primary shrink-0 transition-transform">{icon}</div>}
                    <span className={`truncate ${selectedOption ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {/* Desktop Dropdown */}
            <div className="hidden sm:block">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ 
                                opacity: 0, 
                                scale: 0.95, 
                                y: direction === 'down' ? 5 : -5,
                                bottom: direction === 'up' ? 'calc(100% + 10px)' : 'auto',
                                top: direction === 'down' ? 'calc(100% + 10px)' : 'auto'
                            }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: direction === 'down' ? 5 : -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 left-0 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-1 overflow-hidden min-w-[240px]"
                        >
                            {/* Header exactly like image 3 */}
                            <div className="px-4 py-3 border-b border-slate-50 dark:border-neutral-800/50 mb-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {label}
                                    </span>
                                </div>
                                {searchable && (
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar..."
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800 border-none rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none"
                                            autoFocus
                                        />
                                        {searchTerm && (
                                            <button 
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={`max-h-[260px] overflow-y-auto custom-scrollbar p-1 flex flex-col gap-1`}>
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(option => {
                                    const isSelected = option.value === selectedValue;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`flex items-center justify-between gap-3 w-full px-4 py-2.5 rounded-xl transition-all text-sm ${isSelected 
                                                ? 'bg-primary/5 text-primary font-bold' 
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {option.icon && (
                                                    <div className={`shrink-0 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                                                        {option.icon}
                                                    </div>
                                                )}
                                                <div className="flex flex-col text-left">
                                                    <span>{option.label}</span>
                                                    {option.subLabel && (
                                                        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {option.subLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="shrink-0"
                                                >
                                                    <Check size={16} className="text-primary" strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </button>
                                    );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-400 text-xs italic">
                                        Nenhum resultado encontrado
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Bottom Sheet Fallback */}
            <div className="sm:hidden">
                <SelectionSheet
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title={label}
                    options={options}
                    selectedValue={selectedValue}
                    onSelect={onSelect}
                    searchable={searchable}
                />
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #2563eb;
                }
            `}</style>
        </div>
    );
};
