import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { navItems } from './navItems';
import { LogOut, Moon, Sun, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import { APP_VERSION, APP_NAME, DEVELOPER_NAME } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { user, logout, darkMode, toggleTheme, isSidebarCollapsed, toggleSidebar } = useApp();
  const location = useLocation();
  const navigate = useNavigate();


  const [shouldAnimateLayout, setShouldAnimateLayout] = useState(() => {
    return !(window as any).isLoginTransitionActive;
  });

  useEffect(() => {
    const handleFinished = () => {
      setShouldAnimateLayout(true);
    };
    window.addEventListener('login-transition-finished', handleFinished);
    return () => {
      window.removeEventListener('login-transition-finished', handleFinished);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Nav Groups for SaaS organization
  const mainNav = navItems.filter((i) => ['/dashboard', '/sales', '/orders'].includes(i.path));
  const managementNav = navItems.filter((i) =>
    ['/clients', '/inventory', '/inventory/categories', '/warranties'].includes(i.path)
  );
  const analyticsNav = navItems.filter((i) => ['/reports', '/settings'].includes(i.path));

  const renderNavGroup = (title: string, items: typeof navItems) => (
    <div className="flex flex-col gap-1 mb-4">
      {!isSidebarCollapsed && (
        <span className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em] mb-1 select-none">
          {title}
        </span>
      )}
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            title={isSidebarCollapsed ? item.label : undefined}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              active
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            } ${isSidebarCollapsed ? 'justify-center px-0 py-3' : ''}`}
          >
            {active && (
              <motion.span
                layoutId="sidebarActivePill"
                className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full shadow-[0_0_8px_#00ccff]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <item.icon
              size={18}
              className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                active
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
              }`}
            />
            {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`hidden md:flex flex-col bg-white dark:bg-surface-dark border-r border-slate-200/80 dark:border-neutral-800 transition-all duration-300 relative select-none z-30 ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Toggle Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-8 z-50 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-full p-1.5 shadow-md hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all text-slate-400 hover:text-primary active:scale-90"
        title={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`flex flex-col h-full ${isSidebarCollapsed ? 'p-3' : 'p-6'}`}>
        {/* Brand / Logo Header */}
        <div className={`flex flex-col items-center gap-2 ${isSidebarCollapsed ? 'mb-6' : 'mb-8'}`}>
          <div className={`${isSidebarCollapsed ? 'w-12 h-12' : 'w-24 min-h-[72px]'} flex items-center justify-center relative shrink-0`}>
            {shouldAnimateLayout && (
              <AnimatedLogo size={isSidebarCollapsed ? 'xxs' : 'xs'} layoutId="app-logo" />
            )}
          </div>

          {!isSidebarCollapsed && (
            <>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-1">
                Assistência Técnica
              </p>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-neutral-800 to-transparent mt-2" />
            </>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
          {renderNavGroup('Principal', mainNav)}
          {renderNavGroup('Gestão Operacional', managementNav)}
          {renderNavGroup('Análise & Ajustes', analyticsNav)}
        </nav>

        {/* Bottom Actions & User Area */}
        <div
          className={`pt-3 border-t border-slate-100 dark:border-neutral-800 mt-auto flex flex-col gap-2 ${
            isSidebarCollapsed ? 'items-center' : ''
          }`}
        >
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isSidebarCollapsed ? (darkMode ? 'Modo Claro' : 'Modo Escuro') : undefined}
            className={`flex items-center rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {darkMode ? (
                <Sun size={16} className="shrink-0 text-amber-500" />
              ) : (
                <Moon size={16} className="shrink-0 text-slate-400" />
              )}
              {!isSidebarCollapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </div>
            {!isSidebarCollapsed && (
              <div
                className={`w-7 h-4 rounded-full relative transition-colors ${
                  darkMode ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-xs"
                  style={{ left: darkMode ? 'calc(100% - 14px)' : '2px' }}
                />
              </div>
            )}
          </button>

          {/* User Profile Card */}
          <div
            className={`flex ${
              isSidebarCollapsed ? 'flex-col items-center p-1' : 'items-center p-2'
            } gap-2.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80 hover:border-slate-200 dark:hover:border-neutral-700 transition-all`}
          >
            <div
              className="size-8 rounded-lg bg-cover bg-center ring-2 ring-primary/30 shrink-0 shadow-xs"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
              title={isSidebarCollapsed ? user.name : undefined}
            />
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <span className="inline-block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
              title="Sair da Conta"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Footer info */}
        {!isSidebarCollapsed && (
          <div className="mt-3 pt-2 text-center select-none">
            <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
              {APP_NAME} <span className="text-primary font-black ml-0.5">v{APP_VERSION}</span>
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
              by <span className="text-slate-600 dark:text-slate-400 font-bold">{DEVELOPER_NAME}</span>
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
