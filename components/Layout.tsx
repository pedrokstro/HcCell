import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

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

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || location.pathname === '/') return null;

  return (
    <nav className="flex items-center gap-1.5 px-4 md:px-8 pt-4 md:pt-6 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none animate-fade-in shrink-0">
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
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
};