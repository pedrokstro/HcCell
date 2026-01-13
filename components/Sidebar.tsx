import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { navItems } from './navItems';
import { LogOut, Moon, Sun } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { APP_VERSION, APP_NAME, DEVELOPER_NAME } from '../constants';

export const Sidebar: React.FC = () => {
    const { user, logout, darkMode, toggleTheme } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <aside className="hidden md:flex w-72 flex-col bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="p-6 flex flex-col h-full">
                {/* Logo Animada */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <AnimatedLogo size="xs" />
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Assistência Técnica</p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mt-2" />
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto flex flex-col gap-2">
                    {/* Theme Toggle Button (Full width for visibility) */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: darkMode ? 'calc(100% - 14px)' : '2px' }} />
                        </div>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <div
                            className="size-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-slate-700"
                            style={{ backgroundImage: `url(${user.avatarUrl})` }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate capitalize">{user.role}</p>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10" title="Sair">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center select-none pb-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {APP_NAME} <span className="text-primary font-black ml-1">v{APP_VERSION}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 font-medium">
                        Dev by <span className="text-slate-700 dark:text-slate-300 font-bold">{DEVELOPER_NAME}</span>
                    </p>
                </div>
            </div>
        </aside>
    );
};
