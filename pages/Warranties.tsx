import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  ChevronRight,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ChevronLeft,
  ArrowUpRight,
  LayoutGrid,
  List,
  Wrench,
  User,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';

const ITEMS_PER_PAGE = 12;

export const Warranties: React.FC = () => {
  const { orders, clients, loading } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter completed orders with warranty
  const allWarranties = useMemo(() => {
    return orders
      .filter((o) => o.status === OrderStatus.COMPLETED && !o.noWarranty && o.warrantyEnd)
      .sort((a, b) => new Date(b.warrantyEnd!).getTime() - new Date(a.warrantyEnd!).getTime());
  }, [orders]);

  const stats = useMemo(() => {
    const now = new Date();
    const expiredCount = allWarranties.filter((o) => {
      const end = new Date(o.warrantyEnd!);
      end.setHours(23, 59, 59, 999);
      return end < now;
    }).length;

    const activeCount = allWarranties.length - expiredCount;

    return {
      total: allWarranties.length,
      active: activeCount,
      expired: expiredCount,
    };
  }, [allWarranties]);

  const filteredWarranties = useMemo(() => {
    const now = new Date();
    const query = searchQuery.toLowerCase();

    return allWarranties.filter((o) => {
      const endDate = new Date(o.warrantyEnd!);
      endDate.setHours(23, 59, 59, 999);
      const isExpired = endDate < now;

      const client = clients.find((c) => c.id === o.clientId);
      const clientName = (client?.name || '').toLowerCase();
      const displayId = (o.displayId || o.id).toLowerCase();
      const device = o.deviceModel.toLowerCase();

      const matchesSearch =
        displayId.includes(query) || device.includes(query) || clientName.includes(query);

      if (!matchesSearch) return false;

      if (activeTab === 'active') return !isExpired;
      if (activeTab === 'expired') return isExpired;
      return true;
    });
  }, [allWarranties, activeTab, searchQuery, clients]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredWarranties.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedWarranties = filteredWarranties.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const rangeStart = filteredWarranties.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredWarranties.length);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Pagination Component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const pages: (number | '...')[] = [];
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          '...',
          safeCurrentPage - 1,
          safeCurrentPage,
          safeCurrentPage + 1,
          '...',
          totalPages
        );
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex-wrap text-xs">
        <p className="text-slate-500 dark:text-slate-400">
          {filteredWarranties.length === 0 ? (
            'Nenhuma garantia encontrada'
          ) : (
            <>
              Exibindo{' '}
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {rangeStart}–{rangeEnd}
              </span>{' '}
              de{' '}
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {filteredWarranties.length}
              </span>{' '}
              garantias
            </>
          )}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                scrollToTop();
              }}
              disabled={safeCurrentPage === 1}
              className="size-8 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Página Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center text-slate-400 font-bold select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page as number);
                    scrollToTop();
                  }}
                  className={`size-8 flex items-center justify-center rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                    safeCurrentPage === page
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                scrollToTop();
              }}
              disabled={safeCurrentPage === totalPages}
              className="size-8 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Próxima Página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { key: 'active', label: 'Ativas', count: stats.active, color: 'text-emerald-500' },
    { key: 'expired', label: 'Vencidas', count: stats.expired, color: 'text-rose-500' },
    { key: 'all', label: 'Todas', count: stats.total, color: 'text-primary' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-12">
      {/* SaaS Header (Oculto no Mobile para economizar espaço) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={16} />
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Gestão de Pós-Venda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Garantias e Prazos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitore a validade de garantias dos aparelhos entregues pela assistência.
          </p>
        </div>

        {/* View Toggle Mode */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border border-slate-200/60 dark:border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Visualização em Grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Visualização em Tabela"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Garantias Ativas
            </span>
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Garantias Vencidas
            </span>
            <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
              {stats.expired}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Total com Garantia
            </span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {stats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
        {/* Segmented Control Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-neutral-900/80 p-1 rounded-xl border border-slate-200/50 dark:border-neutral-800">
            {tabs.map((t) => {
              const isSelected = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{t.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-200/60 dark:bg-neutral-800 text-slate-500'
                      }`}
                    >
                      {t.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por aparelho, cliente ou OS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-8 py-2 border border-slate-200/80 dark:border-neutral-800 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : paginatedWarranties.length > 0 ? (
        viewMode === 'grid' ? (
          /* Cards Grid View */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {paginatedWarranties.map((o, idx) => {
                  const client = clients.find((c) => c.id === o.clientId);
                  const endDate = new Date(o.warrantyEnd!);
                  endDate.setHours(23, 59, 59, 999);
                  const isExpired = endDate < new Date();

                  return (
                    <motion.div
                      layout
                      key={o.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.02, duration: 0.25 }}
                      className="group relative bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-neutral-800 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isExpired
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isExpired ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            {isExpired ? 'Vencida' : 'Ativa'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                            #{o.displayId || o.id.slice(0, 8)}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                            {o.deviceModel}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5 truncate">
                            {client?.name || 'Cliente Geral'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              Validade até
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Calendar
                                size={14}
                                className={isExpired ? 'text-rose-500' : 'text-emerald-500'}
                              />
                              <span
                                className={`text-xs font-extrabold font-mono ${
                                  isExpired
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {new Date(o.warrantyEnd!).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          <Link
                            to={`/orders/${o.id}`}
                            className="size-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                            title="Ver Ordem de Serviço"
                          >
                            <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination for Grid */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 shadow-sm">
              <PaginationControls />
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      OS / Aparelho
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Cliente
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Status da Garantia
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                      Validade
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                  {paginatedWarranties.map((o, idx) => {
                    const client = clients.find((c) => c.id === o.clientId);
                    const endDate = new Date(o.warrantyEnd!);
                    endDate.setHours(23, 59, 59, 999);
                    const isExpired = endDate < new Date();

                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-neutral-900/60 transition-colors"
                      >
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {o.deviceModel}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{o.displayId || o.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          {client?.name || 'Cliente Geral'}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isExpired
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isExpired ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            {isExpired ? 'Vencida' : 'Ativa'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap text-xs font-mono font-bold">
                          <span
                            className={
                              isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                            }
                          >
                            {new Date(o.warrantyEnd!).toLocaleDateString('pt-BR')}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <Link
                            to={`/orders/${o.id}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-xs"
                            title="Ver Detalhes da OS"
                          >
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-neutral-800">
              <PaginationControls />
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <Search size={32} className="mb-3 opacity-30" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
            Nenhuma garantia encontrada
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tente ajustar o filtro de status ou a busca por modelo/cliente.
          </p>
        </div>
      )}
    </div>
  );
};
