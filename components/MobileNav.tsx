import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { navItems } from './navItems';
import { useApp } from '../store';
import { Sun, Moon, LogOut } from 'lucide-react';

export const MobileNav: React.FC = () => {
    const { darkMode, toggleTheme, logout } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav
            className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex items-center justify-center gap-1 px-2 py-2 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 border border-slate-200 dark:border-white/10">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-105'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90'
                            }
                        `}
                        title={item.label}
                    >
                        <item.icon size={20} strokeWidth={2} />
                    </NavLink>
                ))}

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 dark:bg-white/20 mx-1" />

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90"
                    title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
                >
                    {darkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                </button>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90"
                    title="Sair"
                >
                    <LogOut size={20} strokeWidth={2} />
                </button>
            </div>
        </nav>
    );
};
