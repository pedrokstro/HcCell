import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomCalendarProps {
    value: string; // ISO format YYYY-MM-DD
    onChange: (date: string) => void;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ value, onChange }) => {
    const today = new Date();
    const initialDate = value ? new Date(value + 'T00:00:00') : today;
    
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleGoToToday = () => {
        const d = new Date();
        const dateStr = d.toISOString().split('T')[0];
        onChange(dateStr);
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    };

    const handleSelectDay = (day: number, isOtherMonth: boolean, monthOffset: number = 0) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
        const dateStr = selected.toISOString().split('T')[0];
        onChange(dateStr);
    };

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    // Days from previous month to fill the first row
    const prevMonthLastDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
    const prevMonthDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        prevMonthDays.push(prevMonthLastDay - i);
    }

    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
        currentMonthDays.push(i);
    }

    // Days from next month to fill the last row
    const totalSlots = 42; // 6 rows * 7 days
    const nextMonthDays = [];
    const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays.length);
    for (let i = 1; i <= remainingSlots; i++) {
        nextMonthDays.push(i);
    }

    const isSelected = (day: number) => {
        if (!value) return false;
        const d = new Date(value + 'T00:00:00');
        return d.getDate() === day && 
               d.getMonth() === viewDate.getMonth() && 
               d.getFullYear() === viewDate.getFullYear();
    };

    const isToday = (day: number) => {
        return today.getDate() === day && 
               today.getMonth() === viewDate.getMonth() && 
               today.getFullYear() === viewDate.getFullYear();
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-white/5 w-[320px] sm:w-[340px] select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-400"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h3>
                <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-400"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="h-10 flex items-center justify-center text-[11px] font-black text-slate-300 dark:text-neutral-600 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {prevMonthDays.map(day => (
                    <button 
                        key={`prev-${day}`}
                        onClick={() => handleSelectDay(day, true, -1)}
                        className="h-10 flex items-center justify-center text-sm font-medium text-slate-200 dark:text-neutral-800"
                    >
                        {day}
                    </button>
                ))}

                {currentMonthDays.map(day => {
                    const selected = isSelected(day);
                    const todayFlag = isToday(day);
                    
                    return (
                        <button 
                            key={`curr-${day}`}
                            onClick={() => handleSelectDay(day, false)}
                            className="relative h-10 flex items-center justify-center group"
                        >
                            {selected && (
                                <motion.div 
                                    layoutId="selectedDay"
                                    className="absolute inset-1 bg-primary rounded-full shadow-lg shadow-primary/30"
                                    initial={false}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                />
                            )}
                            <span className={`relative z-10 text-sm font-bold transition-colors ${
                                selected 
                                    ? 'text-white' 
                                    : todayFlag 
                                        ? 'text-primary' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}>
                                {day}
                            </span>
                            {!selected && todayFlag && (
                                <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </button>
                    );
                })}

                {nextMonthDays.map(day => (
                    <button 
                        key={`next-${day}`}
                        onClick={() => handleSelectDay(day, true, 1)}
                        className="h-10 flex items-center justify-center text-sm font-medium text-slate-200 dark:text-neutral-800"
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-white/5">
                <button 
                    onClick={handleGoToToday}
                    className="text-primary text-sm font-black uppercase tracking-widest hover:underline"
                >
                    Ir para Hoje
                </button>
            </div>
        </div>
    );
};
