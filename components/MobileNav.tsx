import React, { useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    ClipboardList, 
    Plus, 
    BarChart3, 
    MoreHorizontal,
    Sun,
    Moon,
    LogOut,
    PlusCircle,
    Settings as SettingsIcon,
    Users,
    Package,
    Tags,
    ShoppingBag,
    ShieldCheck
} from 'lucide-react';
import { useApp } from '../store';

export const MobileNav: React.FC = () => {
    const { darkMode, toggleTheme, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const navItems = [
        { label: 'PDV / Vendas', icon: <ShoppingBag size={20} />, to: '/sales', color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Ponto de Venda' },
        { label: 'Clientes', icon: <Users size={20} />, to: '/clients', color: 'text-indigo-500', bg: 'bg-indigo-500/10', sub: 'Gerenciar Base' },
        { label: 'Estoque', icon: <Package size={20} />, to: '/inventory', color: 'text-amber-500', bg: 'bg-amber-500/10', sub: 'Produtos' },
        { label: 'Categorias', icon: <Tags size={20} />, to: '/inventory/categories', color: 'text-purple-500', bg: 'bg-purple-500/10', sub: 'Organização' },
        { label: 'Garantias', icon: <ShieldCheck size={20} />, to: '/warranties', color: 'text-primary', bg: 'bg-primary/10', sub: 'Pós-Venda' },
        { label: 'Configurações', icon: <SettingsIcon size={20} />, to: '/settings', color: 'text-slate-500', bg: 'bg-slate-500/10', sub: 'Sistema' },
    ];

    return (
        <>
            {/* Overlay for Menu */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] animate-in fade-in transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Menu Popover */}
            <div className={`
                fixed left-4 right-4 z-[60] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${isMenuOpen ? 'bottom-28 opacity-100 scale-100' : 'bottom-20 opacity-0 scale-95 pointer-events-none'}
            `}>
                <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-[32px] p-2 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="flex flex-col gap-1">
                        <div className="grid grid-cols-1 gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">{item.sub}</span>
                                        </div>
                                    </div>
                                    <PlusCircle size={14} className="text-slate-300 dark:text-neutral-700" />
                                </Link>
                            ))}
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-neutral-700/50 my-1 mx-4"></div>

                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">Tema {darkMode ? 'Escuro' : 'Claro'}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Aparência</span>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}>
                                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-all ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <LogOut size={20} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-sm">Encerrar Sessão</span>
                                <span className="text-[10px] opacity-70 uppercase font-black tracking-widest">Conta</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <nav
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[50] md:hidden animate-in slide-in-from-bottom-8 duration-700 fade-in"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="relative flex items-center justify-between h-[76px] bg-white/70 dark:bg-[#1a2c2e]/60 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 dark:border-white/10 px-2 py-2 overflow-visible">
                    
                    {[
                        { id: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
                        { id: 'orders', to: '/orders', icon: ClipboardList, label: 'Ordens' },
                        { id: 'new', to: '/orders/new', icon: Plus, isFab: true },
                        { id: 'reports', to: '/reports', icon: BarChart3, label: 'Estat.' },
                        { id: 'more', action: () => setIsMenuOpen(!isMenuOpen), icon: MoreHorizontal, label: 'Mais', isButton: true }
                    ].map((item) => {
                        const isActive = item.id === 'more' ? isMenuOpen : 
                                         item.id === 'new' ? false : // FAB does not have normal active state
                                         location.pathname.startsWith(item.to!);

                        const content = (
                            <>
                                {isActive && !item.isFab && (
                                    <motion.div
                                        layoutId="liquidBubble"
                                        className="absolute inset-0 bg-white/80 dark:bg-black/40 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.4)] backdrop-blur-md"
                                        transition={{ type: "spring", bounce: 0.35, duration: 0.7 }}
                                    />
                                )}
                                <div className={`relative z-10 flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${isActive && !item.isFab ? 'text-primary dark:text-primary-light' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive && !item.isFab ? 'drop-shadow-sm' : ''} />
                                    <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                                </div>
                            </>
                        );

                        if (item.isFab) {
                            return (
                                <Link
                                    key={item.id}
                                    to={item.to!}
                                    className="relative z-10 flex flex-col items-center justify-center min-w-[64px]"
                                >
                                    <div className="flex items-center justify-center w-[52px] h-[52px] bg-primary text-white rounded-full shadow-[0_0_20px_rgba(4,157,174,0.4)] hover:shadow-[0_0_25px_rgba(4,157,174,0.6)] active:scale-90 transition-all hover:brightness-110">
                                        <Plus size={28} strokeWidth={3} />
                                    </div>
                                </Link>
                            );
                        }

                        if (item.isButton) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.action}
                                    className="relative flex flex-col items-center justify-center min-w-[64px] h-full rounded-full transition-all"
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                to={item.to!}
                                className="relative flex flex-col items-center justify-center min-w-[64px] h-full rounded-full transition-all"
                            >
                                {content}
                            </Link>
                        );
                    })}
                    
                </div>
            </nav>
        </>
    );
};
