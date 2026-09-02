import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  Settings as SettingsIcon,
  Users,
  Package,
  Tags,
  ShoppingBag,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../store';
import { BottomSheet } from './BottomSheet';

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
    {
      label: 'Vendas',
      icon: <ShoppingBag size={20} />,
      to: '/sales',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Clientes',
      icon: <Users size={20} />,
      to: '/clients',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Estoque',
      icon: <Package size={20} />,
      to: '/inventory',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Categorias',
      icon: <Tags size={20} />,
      to: '/inventory/categories',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Garantias',
      icon: <ShieldCheck size={20} />,
      to: '/warranties',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Ajustes',
      icon: <SettingsIcon size={20} />,
      to: '/settings',
      color: 'text-slate-500',
      bg: 'bg-slate-500/10',
    },
  ];

  const mainTabs = [
    { id: 'dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'orders', to: '/orders', icon: ClipboardList, label: 'Ordens' },
    { id: 'reports', to: '/reports', icon: BarChart3, label: 'Estat.' },
    {
      id: 'more',
      action: () => setIsMenuOpen(!isMenuOpen),
      icon: MoreHorizontal,
      label: 'Mais',
      isButton: true,
    },
  ];

  return (
    <>
      {/* Menu Popover BottomSheet (Estilo iOS Pro) */}
      <BottomSheet
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Navegação Rápida & Atalhos"
      >
        <div className="flex flex-col gap-4 pt-1">
          {/* 3-Column Clean SaaS Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                label: 'Vendas',
                sub: 'PDV',
                icon: <ShoppingBag size={20} />,
                to: '/sales',
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
              {
                label: 'Clientes',
                sub: 'Cadastros',
                icon: <Users size={20} />,
                to: '/clients',
                color: 'text-primary',
                bg: 'bg-primary/10 border-primary/20',
              },
              {
                label: 'Estoque',
                sub: 'Produtos',
                icon: <Package size={20} />,
                to: '/inventory',
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
              },
              {
                label: 'Categorias',
                sub: 'Organização',
                icon: <Tags size={20} />,
                to: '/inventory/categories',
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20',
              },
              {
                label: 'Garantias',
                sub: 'Pós-Venda',
                icon: <ShieldCheck size={20} />,
                to: '/warranties',
                color: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-sky-500/10 border-sky-500/20',
              },
              {
                label: 'Ajustes',
                sub: 'Sistema',
                icon: <SettingsIcon size={20} />,
                to: '/settings',
                color: 'text-slate-600 dark:text-slate-400',
                bg: 'bg-slate-500/10 border-slate-500/20',
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/70 dark:bg-neutral-900/60 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200/70 dark:border-neutral-800 transition-all active:scale-95 text-center group shadow-2xs"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.bg} ${item.color} border mb-1.5 shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
                >
                  {item.icon}
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate w-full">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate w-full">
                  {item.sub}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom Actions Row (Tema & Sair) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100/80 dark:bg-neutral-800/80 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all active:scale-95 border border-slate-200/60 dark:border-neutral-700/60 shadow-xs"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  darkMode
                    ? 'bg-indigo-500 text-white'
                    : 'bg-amber-400 text-slate-900'
                }`}
              >
                {darkMode ? <Moon size={13} /> : <Sun size={13} />}
              </div>
              <span>{darkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-extrabold text-xs transition-all active:scale-95 border border-rose-200/70 dark:border-rose-900/40 shadow-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <LogOut size={13} />
              </div>
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Floating Dynamic Island Navigation Bar */}
      <nav
        className="fixed left-0 right-0 z-[50] md:hidden px-4 pointer-events-none select-none"
        style={{ bottom: 'calc(26px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-center gap-2.5 max-w-[390px] mx-auto pointer-events-auto">
          {/* Main Floating Capsule Pill */}
          <div className="flex items-center bg-white/95 dark:bg-[#112224]/95 backdrop-blur-2xl p-1.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.55)] border border-slate-200/80 dark:border-white/10 gap-1">
            {mainTabs.map((tab) => {
              const isActive =
                tab.id === 'more'
                  ? isMenuOpen
                  : location.pathname.startsWith(tab.to!);

              const buttonContent = (
                <>
                  <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  {isActive && (
                    <motion.span
                      layout
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="whitespace-nowrap overflow-hidden text-xs tracking-tight"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </>
              );

              if (tab.isButton) {
                return (
                  <button
                    key={tab.id}
                    onClick={tab.action}
                    className={`relative flex items-center justify-center transition-all duration-200 rounded-full ${
                      isActive
                        ? 'bg-primary text-white font-black px-3.5 py-2 shadow-md shadow-primary/30 gap-1.5'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-2.5'
                    }`}
                  >
                    {buttonContent}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  to={tab.to!}
                  className={`relative flex items-center justify-center transition-all duration-200 rounded-full ${
                    isActive
                      ? 'bg-primary text-white font-black px-3.5 py-2 shadow-md shadow-primary/30 gap-1.5'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-2.5'
                  }`}
                >
                  {buttonContent}
                </Link>
              );
            })}
          </div>

          {/* Right Floating FAB Action Button (+) */}
          <Link
            to="/orders/new"
            className="size-[48px] rounded-full bg-primary text-white shadow-[0_10px_25px_rgba(4,157,174,0.45)] dark:shadow-[0_10px_25px_rgba(4,157,174,0.7)] flex items-center justify-center shrink-0 active:scale-90 hover:scale-105 transition-all hover:brightness-110 border-2 border-white dark:border-[#112224]"
            title="Nova Ordem / Venda"
          >
            <Plus size={24} strokeWidth={2.8} />
          </Link>
        </div>
      </nav>
    </>
  );
};
