import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../store';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  FileText,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Wrench,
  ArrowUpRight,
  X,
  Package,
  Layers,
  Eye,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  Printer
} from 'lucide-react';
import { ServiceOrder, OrderStatus } from '../../types';
import { CustomDropdown } from '../../components/CustomDropdown';
import { DatePicker } from '../../components/DatePicker';
import { OrderKebabMenu } from '../../components/OrderKebabMenu';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { OrderCard } from '../../components/OrderCard';
import { OrderQuickDrawer } from '../../components/OrderQuickDrawer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const ITEMS_PER_PAGE = 15;

export const OrdersList: React.FC = () => {
  const { orders, clients, updateOrder } = useApp();
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [selectedQuickOrder, setSelectedQuickOrder] = useState<ServiceOrder | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBatchStatusMenuOpen, setIsBatchStatusMenuOpen] = useState(false);

  const getClientName = (id?: string | null) => {
    if (!id) return 'Cliente Geral';
    return clients.find((c) => c.id === id)?.name || 'Cliente Geral';
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500 animate-pulse',
        };
      case OrderStatus.IN_PROGRESS:
        return {
          bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          dot: 'bg-sky-500',
        };
      case OrderStatus.WAITING_WITHDRAWAL:
        return {
          bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          dot: 'bg-cyan-500',
        };
      case OrderStatus.COMPLETED:
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case OrderStatus.CANCELLED:
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          dot: 'bg-slate-500',
        };
    }
  };

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, startDate, endDate]);

  // Show scroll-to-top button after scrolling 400px
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const statusTabs = [
    { value: '', label: 'Todas', count: orders.length },
    {
      value: OrderStatus.PENDING,
      label: 'Pendentes',
      count: orders.filter((o) => o.status === OrderStatus.PENDING).length,
    },
    {
      value: OrderStatus.IN_PROGRESS,
      label: 'Em Andamento',
      count: orders.filter((o) => o.status === OrderStatus.IN_PROGRESS).length,
    },
    {
      value: OrderStatus.WAITING_WITHDRAWAL,
      label: 'Retirada',
      count: orders.filter((o) => o.status === OrderStatus.WAITING_WITHDRAWAL).length,
    },
    {
      value: OrderStatus.COMPLETED,
      label: 'Concluídas',
      count: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
    },
    {
      value: OrderStatus.CANCELLED,
      label: 'Canceladas',
      count: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
    },
  ];

  const dateOptions = [
    { value: '', label: 'Todo o Período', icon: <Filter size={16} /> },
    { value: 'today', label: 'Hoje', icon: <Clock size={16} /> },
    { value: 'week', label: 'Esta Semana', icon: <Calendar size={16} /> },
    { value: 'month', label: 'Este Mês', icon: <Calendar size={16} /> },
    { value: 'custom', label: 'Personalizado', icon: <Search size={16} /> },
  ];

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDateRange = (filter: string): { start: Date | null; end: Date | null } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'custom':
        const customStart = startDate ? parseLocalDate(startDate) : null;
        const customEnd = endDate
          ? new Date(parseLocalDate(endDate).getTime() + 24 * 60 * 60 * 1000)
          : null;
        return { start: customStart, end: customEnd };
      default:
        return { start: null, end: null };
    }
  };

  // Filter + sort newest first
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const client = clients.find((c) => c.id === order.clientId);
        const clientName = (client?.name || 'Cliente').toLowerCase();
        const clientCpf = (client?.cpf || '').toLowerCase();
        const clientPhone = (client?.phone || '').toLowerCase();
        const displayId = (order.displayId || order.id).toLowerCase();
        const device = order.deviceModel.toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch =
          clientName.includes(query) ||
          clientCpf.includes(query) ||
          clientPhone.includes(query) ||
          displayId.includes(query) ||
          device.includes(query);

        const matchesStatus = statusFilter ? order.status === statusFilter : true;

        let matchesDate = true;
        if (dateFilter) {
          const { start, end } = getDateRange(dateFilter);
          const orderDate = new Date(order.createdAt);
          if (start && end) {
            matchesDate = orderDate >= start && orderDate < end;
          } else if (start) {
            matchesDate = orderDate >= start;
          } else if (end) {
            matchesDate = orderDate < end;
          }
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, clients, searchQuery, statusFilter, dateFilter, startDate, endDate]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const rangeStart = filteredOrders.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredOrders.length);

  useGSAP(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from('.gsap-row', {
      opacity: 0,
      y: 10,
      stagger: 0.025,
      duration: 0.28,
      ease: 'power2.out',
      clearProps: 'opacity,transform',
    });

    gsap.from('.gsap-mobile-card', {
      opacity: 0,
      y: 12,
      stagger: 0.035,
      duration: 0.32,
      ease: 'power2.out',
      clearProps: 'opacity,transform',
    });
  }, { dependencies: [safeCurrentPage, statusFilter, dateFilter, searchQuery], scope: containerRef });

  const handleWhatsApp = (e: React.MouseEvent, order: any) => {
    e.preventDefault();
    e.stopPropagation();
    const client = clients.find((c) => c.id === order.clientId);
    if (!client?.phone) return;

    let message = `Olá ${client.name}, aqui é da HcCell Assistência Técnica. Sobre seu aparelho ${order.deviceModel}: `;
    const trackingUrl = `${window.location.origin}/#/tracking?id=${
      order.displayId || order.id.slice(0, 8)
    }`;

    if (order.status === OrderStatus.COMPLETED) {
      message += `está pronto e concluído com sucesso! Valor total: R$ ${order.total.toFixed(2)}.`;
    } else if (order.status === OrderStatus.WAITING_WITHDRAWAL) {
      message += `já está aguardando retirada!`;
    } else {
      message += `gostaria de falar sobre sua Ordem de Serviço #${
        order.displayId || order.id.slice(0, 8)
      }.`;
    }

    message += `\n\nAcompanhe aqui: ${trackingUrl}`;
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Pagination Controls Component
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
          {filteredOrders.length === 0 ? (
            'Nenhuma ordem encontrada'
          ) : (
            <>
              Exibindo{' '}
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {rangeStart}–{rangeEnd}
              </span>{' '}
              de{' '}
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {filteredOrders.length}
              </span>{' '}
              ordens
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

  const isAllSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedOrderIds.includes(o.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds((prev) =>
        prev.filter((id) => !paginatedOrders.some((o) => o.id === id))
      );
    } else {
      const pageIds = paginatedOrders.map((o) => o.id);
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportSelectedToCSV = () => {
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;
    const headers = ['ID', 'Cliente', 'Aparelho', 'Status', 'Data', 'Total'];
    const rows = selected.map((o) => [
      o.displayId || o.id.slice(0, 8),
      `"${getClientName(o.clientId).replace(/"/g, '""')}"`,
      `"${o.deviceModel.replace(/"/g, '""')}"`,
      o.status,
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
      o.total.toFixed(2),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ordens_selecionadas_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      for (const id of selectedOrderIds) {
        const order = orders.find((o) => o.id === id);
        if (order) {
          await updateOrder({ ...order, status: newStatus });
        }
      }
      setSelectedOrderIds([]);
      setIsBatchStatusMenuOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status em lote', error);
    }
  };

  return (
    <>
      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 size-11 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
            title="Voltar ao topo"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="max-w-[1400px] mx-auto flex flex-col gap-3.5 sm:gap-6 pb-36 md:pb-12">
        {/* Header & Quick Action */}
        <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Wrench size={16} />
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Gestão de Bancada
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ordens de Serviço
            </h1>
          </div>

          <Link
            to="/orders/new"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>Nova Ordem de Serviço</span>
          </Link>
        </div>

        {/* Filter Card & Status Tabs */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-3.5 sm:p-5 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
            {statusTabs.map((tab) => {
              const isSelected = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'text-primary dark:text-primary-light shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="orderStatusTab"
                      className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={`relative z-10 text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-neutral-800" />

          {/* Search Bar & Filters Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por cliente, modelo, defeito ou #OS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-900/50 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <CustomDropdown
                label="Período"
                options={[
                  { value: '', label: 'Todo o Histórico' },
                  { value: 'today', label: 'Hoje' },
                  { value: 'yesterday', label: 'Ontem' },
                  { value: '7days', label: 'Últimos 7 dias' },
                  { value: '30days', label: 'Últimos 30 dias' },
                  { value: 'thisMonth', label: 'Este Mês' },
                  { value: 'lastMonth', label: 'Mês Passado' },
                  { value: 'custom', label: 'Personalizado' },
                ]}
                selectedValue={dateFilter}
                onSelect={(val) => setDateFilter(val)}
                searchable={false}
              />

              {dateFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <DatePicker
                    selectedDate={startDate}
                    onSelect={(d) => setStartDate(d)}
                    placeholder="Data Inicial"
                  />
                  <span className="text-slate-400 text-xs font-bold">até</span>
                  <DatePicker
                    selectedDate={endDate}
                    onSelect={(d) => setEndDate(d)}
                    placeholder="Data Final"
                  />
                </div>
              )}

              {(searchQuery || statusFilter || dateFilter || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setDateFilter('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 text-xs font-bold transition-all whitespace-nowrap active:scale-95"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                  <th className="py-3.5 px-4 text-center w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-primary transition-colors"
                      title={isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                    >
                      {isAllSelected ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Cliente
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Aparelho & Diagnóstico
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Data Registro
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    Valor Total
                  </th>
                  <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const clientName = getClientName(order.clientId);
                    const isSelected = selectedOrderIds.includes(order.id);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className={`gsap-row group transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 dark:bg-primary/10'
                            : 'hover:bg-slate-50/80 dark:hover:bg-neutral-900/60'
                        }`}
                      >
                        <td
                          className="py-4 px-4 text-center"
                          onClick={(e) => handleToggleSelectOne(order.id, e)}
                        >
                          <button className="text-slate-400 hover:text-primary transition-colors">
                            {isSelected ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/20">
                              {clientName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                {clientName}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md mt-0.5 w-fit">
                                #{order.displayId || order.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 min-w-[240px]">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {order.serviceType === 'VENDA_DIRETA'
                                ? 'Venda de Produto'
                                : order.deviceModel}
                            </span>
                            <span
                              className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[260px] mt-0.5"
                              title={
                                order.serviceType === 'VENDA_DIRETA'
                                  ? order.selectedProducts
                                      ?.map((p) => `${p.quantity}x ${p.name}`)
                                      .join(', ')
                                  : order.issueDescription
                              }
                            >
                              {order.serviceType === 'VENDA_DIRETA'
                                ? order.selectedProducts
                                    ?.map((p) => `${p.quantity}x ${p.name}`)
                                    .join(', ') || 'Produtos Diversos'
                                : order.issueDescription}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <OrderKebabMenu order={order} mode="badge" />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                timeZone: 'America/Sao_Paulo',
                              })}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                              R$ {order.total.toFixed(2)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedQuickOrder(order);
                              }}
                              className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all border border-slate-200/60 dark:border-neutral-700 shadow-sm"
                              title="Espiar Ordem (Quick Peek)"
                            >
                              <Eye size={14} />
                            </button>
                            {clientName && (
                              <button
                                onClick={(e) => handleWhatsApp(e, order)}
                                className="size-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-sm"
                                title="Enviar WhatsApp"
                              >
                                <WhatsAppIcon size={15} color="#10b981" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Search size={28} className="mb-2 opacity-30" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                          Nenhuma ordem encontrada
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-neutral-800">
            <PaginationControls />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-3">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const client = clients.find((c) => c.id === order.clientId);
              return (
                <div key={order.id} className="gsap-mobile-card">
                  <OrderCard
                    order={order}
                    client={client}
                    onWhatsApp={handleWhatsApp}
                  />
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-8 text-center text-slate-400">
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                Nenhuma ordem recente
              </p>
            </div>
          )}

          {paginatedOrders.length > 0 && (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 shadow-sm">
              <PaginationControls />
            </div>
          )}
        </div>
      </div>

      <OrderQuickDrawer
        order={selectedQuickOrder}
        isOpen={Boolean(selectedQuickOrder)}
        onClose={() => setSelectedQuickOrder(null)}
      />

      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 px-5 py-3 flex items-center gap-4 text-xs font-bold"
          >
            <div className="flex items-center gap-2 pr-2 border-r border-slate-700 dark:border-slate-300">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>
                {selectedOrderIds.length}{' '}
                {selectedOrderIds.length === 1 ? 'ordem selecionada' : 'ordens selecionadas'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportSelectedToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 transition-all active:scale-95 text-slate-200 dark:text-slate-800"
              >
                <Download size={14} />
                <span>Exportar CSV</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsBatchStatusMenuOpen(!isBatchStatusMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>Alterar Status</span>
                </button>

                {isBatchStatusMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-48 rounded-xl bg-white dark:bg-surface-dark shadow-2xl border border-slate-200 dark:border-neutral-800 p-1 flex flex-col gap-1 text-slate-800 dark:text-slate-200 text-xs">
                    {[
                      OrderStatus.PENDING,
                      OrderStatus.IN_PROGRESS,
                      OrderStatus.WAITING_WITHDRAWAL,
                      OrderStatus.COMPLETED,
                      OrderStatus.CANCELLED,
                    ].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleBatchStatusUpdate(st)}
                        className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 font-semibold"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedOrderIds([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors"
                title="Desmarcar todas"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
