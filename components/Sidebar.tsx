import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { navItems } from './navItems';
import { LogOut, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { APP_VERSION, APP_NAME, DEVELOPER_NAME } from '../constants';

export const Sidebar: React.FC = () => {
    const { user, logout, darkMode, toggleTheme, isSidebarCollapsed, toggleSidebar } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <aside className={`hidden md:flex flex-col bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-10 z-50 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-primary"
            >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={`flex flex-col h-full ${isSidebarCollapsed ? 'p-4' : 'p-6'}`}>
                {/* Logo Animada */}
                <div className={`flex flex-col items-center gap-2 ${isSidebarCollapsed ? 'mb-6' : 'mb-8'}`}>
                    <AnimatedLogo size={isSidebarCollapsed ? "xxs" : "xs"} />
                    {!isSidebarCollapsed && (
                        <>
                            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Assistência Técnica</p>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mt-2" />
                        </>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={isSidebarCollapsed ? item.label : ''}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                        >
                            <item.icon size={20} className="shrink-0" />
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className={`pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto flex flex-col gap-2 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        title={isSidebarCollapsed ? (darkMode ? 'Modo Claro' : 'Modo Escuro') : ''}
                        className={`flex items-center rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-2'}`}
                    >
                        <div className="flex items-center gap-3">
                            {darkMode ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
                            {!isSidebarCollapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: darkMode ? 'calc(100% - 14px)' : '2px' }} />
                            </div>
                        )}
                    </button>

                    {/* User Profile */}
                    <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center' : 'items-center'} gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                        <div
                            className="size-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-slate-700 shrink-0"
                            style={{ backgroundImage: `url(${user.avatarUrl})` }}
                            title={isSidebarCollapsed ? user.name : undefined}
                        />
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 truncate capitalize">{user.role}</p>
                            </div>
                        )}
                        <button onClick={() => { logout(); navigate('/'); }} className={`text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 ${isSidebarCollapsed ? '' : ''}`} title="Sair do Sistema">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {!isSidebarCollapsed && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center select-none pb-2 animate-fade-in">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {APP_NAME} <span className="text-primary font-black ml-1">v{APP_VERSION}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 font-medium">
                            Dev by <span className="text-slate-700 dark:text-slate-300 font-bold">{DEVELOPER_NAME}</span>
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
};
