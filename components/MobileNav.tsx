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
            <div 
                className={`
                    fixed left-4 right-4 z-[60] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                    ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                `}
                style={{ 
                    bottom: isMenuOpen ? 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)' : 'calc(72px + env(safe-area-inset-bottom, 0px) - 10px)'
                }}
            >
                <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-[32px] p-4 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2.5">
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/50 dark:bg-neutral-900/40 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-100 dark:border-neutral-800/60 transition-all active:scale-95 text-center"
                                >
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.bg} ${item.color} mb-1.5 shadow-sm shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-neutral-200 text-[11px] truncate w-full">
                                        {item.label === 'Configurações' ? 'Ajustes' : item.label === 'PDV / Vendas' ? 'Vendas' : item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-slate-100 dark:border-neutral-700/40">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50/50 dark:bg-neutral-900/40 border border-slate-100 dark:border-neutral-800/60 transition-all text-left text-xs font-bold text-slate-800 dark:text-neutral-200 active:scale-95"
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="truncate">{darkMode ? 'Escuro' : 'Claro'}</span>
                                </div>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 p-2.5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all text-left text-xs font-bold active:scale-95"
                            >
                                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
                                    <LogOut size={16} />
                                </div>
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <nav
                className="fixed bottom-0 left-0 right-0 w-full z-[50] md:hidden bg-white/85 dark:bg-[#112224]/85 backdrop-blur-2xl rounded-t-[28px] border-t border-slate-200/50 dark:border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-8 duration-700 fade-in"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="relative flex items-center justify-between h-[72px] px-4 overflow-visible w-full max-w-[420px] mx-auto">
                    
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
                                    className="relative z-20 flex flex-col items-center justify-center min-w-[64px] -translate-y-5"
                                >
                                    <div className="flex items-center justify-center w-[56px] h-[56px] bg-primary text-white rounded-full shadow-[0_8px_20px_rgba(4,157,174,0.4)] dark:shadow-[0_8px_25px_rgba(4,157,174,0.65)] hover:shadow-[0_0_30px_rgba(4,157,174,0.8)] border-[5px] border-white dark:border-[#112224] active:scale-90 transition-all hover:brightness-110">
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
