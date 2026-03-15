import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
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
    ShoppingBag
} from 'lucide-react';
import { useApp } from '../store';

export const MobileNav: React.FC = () => {
    const { darkMode, toggleTheme, logout } = useApp();
    const navigate = useNavigate();
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
                className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-5 duration-500"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="flex items-stretch justify-around h-[72px] bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-black/10 dark:shadow-black/30 border border-slate-200 dark:border-white/10 px-2 overflow-hidden">
                    
                    {/* Item: Início */}
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all
                            ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-bold">Início</span>
                            </>
                        )}
                    </NavLink>

                    {/* Item: Transações (Ordens) */}
                    <NavLink
                        to="/orders"
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all
                            ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <ClipboardList size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-bold">Ordens</span>
                            </>
                        )}
                    </NavLink>

                    {/* FAB: Novo (Center) */}
                    <div className="flex items-center justify-center mx-1">
                        <Link
                            to="/orders/new"
                            className="flex items-center justify-center w-[54px] h-[54px] bg-primary text-white rounded-[22px] shadow-lg shadow-primary/30 active:scale-90 transition-all hover:brightness-110"
                            title="Nova OS"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </Link>
                    </div>


                    {/* Item: Relatórios */}
                    <NavLink
                        to="/reports"
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all
                            ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <BarChart3 size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-bold">Relatórios</span>
                            </>
                        )}
                    </NavLink>

                    {/* Item: Mais */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`
                            flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all
                            ${isMenuOpen ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}
                        `}
                    >
                        <MoreHorizontal size={24} strokeWidth={isMenuOpen ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Mais</span>
                    </button>
                    
                </div>
            </nav>
        </>
    );
};
