import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Search, Keyboard } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { ShortcutsModal } from './ShortcutsModal';
import { NotificationCenter } from './NotificationCenter';

const routeMap: Record<string, string> = {
  dashboard: 'Painel',
  orders: 'Ordens de Serviço',
  new: 'Novo',
  edit: 'Editar',
  clients: 'Clientes',
  inventory: 'Estoque',
  categories: 'Categorias',
  reports: 'Relatórios',
  sales: 'Ponto de Vendas',
  warranties: 'Garantias',
  settings: 'Configurações',
  'logo-studio': 'Logo Studio'
};

const Breadcrumbs: React.FC<{ onOpenSearch: () => void; onOpenShortcuts: () => void }> = ({
  onOpenSearch,
  onOpenShortcuts,
}) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  return (
    <div className="flex items-center justify-between px-4 md:px-8 pt-4 md:pt-6 shrink-0">
      <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none animate-fade-in">
        <Link to="/dashboard" className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <Home size={12} />
          <span>Início</span>
        </Link>
        {pathnames.map((value, index) => {
          const isId = value.length > 20 || (value.length >= 8 && !isNaN(Number(value))) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
          const displayName = isId 
            ? `OS #${value.slice(0, 8).toUpperCase()}`
            : (routeMap[value] || value);
            
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <React.Fragment key={to}>
              <ChevronRight size={12} className="text-slate-300 dark:text-neutral-800" />
              {isLast ? (
                <span className="text-slate-800 dark:text-slate-200 font-extrabold">{displayName}</span>
              ) : (
                <Link to={to} className="hover:text-primary transition-colors text-slate-400">
                  {displayName}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Desktop Top Right Fast Utilities */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white/80 dark:bg-surface-dark/80 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all text-slate-500 dark:text-slate-400 shadow-2xs group"
          title="Buscar no sistema (Ctrl + K)"
        >
          <Search size={13} className="group-hover:text-primary transition-colors" />
          <span className="text-[11px] font-semibold">Buscar...</span>
          <kbd className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-500">
            Ctrl K
          </kbd>
        </button>

        <NotificationCenter />

        <button
          onClick={onOpenShortcuts}
          className="size-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800 transition-all"
          title="Atalhos de Teclado (?)"
        >
          <Keyboard size={16} />
        </button>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const navigate = useNavigate();

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input / textarea / contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Ctrl + K or Cmd + K -> Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Single-key shortcuts (when not in input)
      if (e.key === '?' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        navigate('/orders/new');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        navigate('/clients/new');
      } else if (e.key === 'v' || e.key === 'V' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        navigate('/sales');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Breadcrumbs
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 pb-32 md:pb-8">
          {children}
        </main>
        <MobileNav />
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};