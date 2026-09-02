import React from 'react';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import {
  Search,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  ChevronRight,
  TrendingDown,
  EyeOff,
  Calendar,
  Filter,
  X,
  Smartphone,
  Package,
  ShoppingBag,
  UserPlus,
  Compass,
  ArrowUpRight,
  ArrowRight,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CustomDropdown } from '../components/CustomDropdown';
import { DatePicker } from '../components/DatePicker';
import { Skeleton } from '../components/Skeleton';
import { OrderKebabMenu } from '../components/OrderKebabMenu';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { OrderCard } from '../components/OrderCard';
import { AnimatedNumber } from '../components/AnimatedNumber';

export const Dashboard: React.FC = () => {
  const { orders, products, clients, loading, warrantyRecords, dismissWarranty, dismissMultipleWarranties } = useApp();
  const navigate = useNavigate();

  const [selectedStat, setSelectedStat] = React.useState<
    'sales' | 'awaiting' | 'completed' | 'lowStock' | 'costs' | 'expiredWarranties' | 'expiredHistory' | null
  >(null);
  const [showWarrantyPopup, setShowWarrantyPopup] = React.useState(
    () => !sessionStorage.getItem('dismissed_warranty_popup')
  );

  const [dateFilter, setDateFilter] = React.useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Calculate All Warranties and identify which are expired
  const allOrdersWithWarranty = React.useMemo(() => {
    return orders
      .filter((o) => o.status === OrderStatus.COMPLETED && !o.noWarranty && o.warrantyEnd)
      .sort((a, b) => new Date(b.warrantyEnd!).getTime() - new Date(a.warrantyEnd!).getTime());
  }, [orders]);

  const allExpiredWarranties = React.useMemo(() => {
    const now = new Date().getTime();
    return allOrdersWithWarranty.filter((o) => new Date(o.warrantyEnd!).getTime() < now);
  }, [allOrdersWithWarranty]);

  const activeExpiredWarranties = React.useMemo(() => {
    return allExpiredWarranties.filter((o) => {
      const record = warrantyRecords.find((r) => r.orderId === o.id);
      return !record || !record.dismissed;
    });
  }, [allExpiredWarranties, warrantyRecords]);

  const dateFilterOptions = [
    { value: 'today', label: 'Hoje', icon: <Clock size={18} /> },
    { value: 'yesterday', label: 'Ontem', icon: <TrendingDown size={18} /> },
    { value: 'week', label: 'Últimos 7 Dias', icon: <Calendar size={18} /> },
    { value: 'month', label: 'Este Mês', icon: <Calendar size={18} /> },
    { value: 'all', label: 'Todo o Período', icon: <Filter size={18} /> },
    { value: 'custom', label: 'Personalizado', icon: <Search size={18} /> },
  ];

  // Persist showValues preference
  const [showValues, setShowValues] = React.useState(() => {
    const saved = localStorage.getItem('dashboard_showValues');
    return saved !== null ? JSON.parse(saved) : true;
  });

  React.useEffect(() => {
    localStorage.setItem('dashboard_showValues', JSON.stringify(showValues));
  }, [showValues]);

  // Live Sparkline Data of the last 7 days for completed orders
  const last7DaysSales = React.useMemo(() => {
    const days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      })
      .reverse();

    return days.map((day) => {
      const dayOrders = orders.filter((o) => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        return (
          oDate.getFullYear() === day.getFullYear() &&
          oDate.getMonth() === day.getMonth() &&
          oDate.getDate() === day.getDate() &&
          o.status === OrderStatus.COMPLETED
        );
      });
      return dayOrders.reduce((sum, o) => sum + o.total, 0);
    });
  }, [orders]);

  const last7DaysCosts = React.useMemo(() => {
    const days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      })
      .reverse();

    return days.map((day) => {
      const dayOrders = orders.filter((o) => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        return (
          oDate.getFullYear() === day.getFullYear() &&
          oDate.getMonth() === day.getMonth() &&
          oDate.getDate() === day.getDate() &&
          o.status === OrderStatus.COMPLETED
        );
      });
      return dayOrders.reduce((sum, order) => {
        const orderCost = (order.selectedProducts || []).reduce((prodAcc, item) => {
          const product = products.find((p) => p.id === item.productId);
          const cost = item.cost !== undefined ? item.cost : (product?.priceCost || 0);
          return prodAcc + cost * item.quantity;
        }, 0);
        return sum + orderCost;
      }, 0);
    });
  }, [orders, products]);

  const getSparklinePath = (data: number[], width: number, height: number) => {
    if (data.length === 0) return '';
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Helper to check if a date matches the filter
  const isDateInFilter = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    switch (dateFilter) {
      case 'today':
        return dateDay.getTime() === today.getTime();
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return dateDay.getTime() === yesterday.getTime();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case 'month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'custom':
        if (!customDate) return true;
        const start = new Date(customDate);
        start.setHours(0, 0, 0, 0);
        const end = customEndDate ? new Date(customEndDate) : new Date(customDate);
        end.setHours(23, 59, 59, 999);
        return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
      case 'all':
      default:
        return true;
    }
  };

  // 1. First filter by DATE
  const ordersInDateData = orders.filter((o) => isDateInFilter(o.createdAt));

  // 2. Then filter by SEARCH (for the list)
  const filteredOrders = ordersInDateData.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.displayId && order.displayId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Modal/Bottom Sheet Component
  const StatsModal = () => {
    if (!selectedStat) return null;

    const titles: Record<string, string> = {
      sales: 'Vendas Totais',
      awaiting: 'Aguardando Reparo',
      completed: 'Serviços Concluídos',
      lowStock: 'Estoque Baixo',
      costs: 'Custo Total (Peças)',
      expiredWarranties: 'Garantias Vencidas Recentes',
      expiredHistory: 'Histórico de Garantias',
    };

    const getStatData = () => {
      switch (selectedStat) {
        case 'sales':
          return ordersInDateData
            .filter((o) => o.status === OrderStatus.COMPLETED)
            .map((o) => ({
              id: o.id,
              label: o.deviceModel,
              value: `R$ ${o.total.toFixed(2)}`,
              sub: new Date(o.createdAt)
                .toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                .replace(',', ' -'),
            }));
        case 'awaiting':
          return orders
            .filter(
              (o) =>
                o.status === OrderStatus.PENDING ||
                o.status === OrderStatus.IN_PROGRESS ||
                o.status === OrderStatus.WAITING_WITHDRAWAL
            )
            .map((o) => {
              const client = clients.find((c) => c.id === o.clientId);
              const dateStr = new Date(o.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              });
              const timeStr = new Date(o.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return {
                id: o.id,
                label: o.deviceModel,
                value: o.status,
                sub: `${client?.name || 'Cliente não encontrado'} • ${dateStr} às ${timeStr}`,
              };
            });
        case 'completed':
          return ordersInDateData
            .filter((o) => o.status === OrderStatus.COMPLETED)
            .map((o) => {
              const client = clients.find((c) => c.id === o.clientId);
              return {
                id: o.id,
                label: o.deviceModel,
                value: 'Concluído',
                sub: `${client?.name || 'Cliente'} • ${new Date(o.createdAt)
                  .toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  .replace(',', ' -')}`,
              };
            });
        case 'costs':
          return ordersInDateData
            .filter((o) => o.status === OrderStatus.COMPLETED)
            .map((order) => {
              const orderCost = (order.selectedProducts || []).reduce((acc, item) => {
                const p = products.find((prod) => prod.id === item.productId);
                const cost = item.cost !== undefined ? item.cost : (p?.priceCost || 0);
                return acc + cost * item.quantity;
              }, 0);
              return {
                id: order.id,
                label: order.deviceModel,
                value: `R$ ${orderCost.toFixed(2)}`,
                sub: `OS #${order.displayId || order.id.slice(0, 8)}`,
              };
            })
            .filter((item) => item.value !== 'R$ 0.00');
        case 'expiredWarranties':
          return activeExpiredWarranties.map((o) => {
            const client = clients.find((c) => c.id === o.clientId);
            return {
              id: o.id,
              label: o.deviceModel,
              value: new Date(o.warrantyEnd!).toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
              }),
              sub: `${client?.name || 'Cliente'} • OS #${o.displayId || o.id.slice(0, 8)}`,
              expired: true,
            };
          });
        case 'expiredHistory':
          return allOrdersWithWarranty.map((o) => {
            const client = clients.find((c) => c.id === o.clientId);
            const endDate = new Date(o.warrantyEnd!);
            endDate.setHours(23, 59, 59, 999);
            const isExpired = endDate < new Date();
            return {
              id: o.id,
              label: o.deviceModel,
              value: new Date(o.warrantyEnd!).toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
              }),
              sub: `${client?.name || 'Cliente'} • OS #${o.displayId || o.id.slice(0, 8)}`,
              expired: isExpired,
            };
          });
        case 'lowStock':
          return products
            .filter((p) => p.quantity <= (p.minStockLevel || 5))
            .map((p) => ({
              label: p.name,
              value: `${p.quantity} un`,
              sub: `Estoque mínimo recomendado: ${p.minStockLevel || 5}`,
            }));
        default:
          return [];
      }
    };

    const data = getStatData();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    let HeaderIcon = Smartphone;
    let headerIconBg = 'bg-primary/10 text-primary border-primary/20';

    if (selectedStat === 'sales') {
      HeaderIcon = DollarSign;
      headerIconBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (selectedStat === 'costs') {
      HeaderIcon = DollarSign;
      headerIconBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    } else if (selectedStat === 'lowStock') {
      HeaderIcon = Package;
      headerIconBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    } else if (selectedStat === 'completed') {
      HeaderIcon = CheckCircle;
      headerIconBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (selectedStat === 'expiredWarranties' || selectedStat === 'expiredHistory') {
      HeaderIcon = Calendar;
      headerIconBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    return (
      <AnimatePresence>
        {selectedStat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStat(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 16 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative bg-white dark:bg-surface-dark rounded-t-[32px] sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden border border-slate-200/80 dark:border-neutral-800 flex flex-col max-h-[88vh] sm:max-h-[85vh]"
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-slate-300 dark:bg-neutral-700 rounded-full" />
              </div>

              {/* Professional SaaS Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-surface-dark relative z-10 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${headerIconBg}`}>
                    <HeaderIcon size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                        {titles[selectedStat]}
                      </h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-neutral-700">
                        {data.length} {data.length === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                      Detalhamento consolidado com base no período selecionado
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStat(null)}
                  className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {data.length > 0 ? (
                  <>
                    {/* Desktop View: Clean SaaS Data Table */}
                    <div className="hidden sm:block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="py-3 px-6">Item / Aparelho</th>
                            <th className="py-3 px-6">Identificação & Cliente</th>
                            <th className="py-3 px-6 text-center">Status / Validade</th>
                            <th className="py-3 px-6 text-right">Valor</th>
                            <th className="py-3 px-6 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                          {data.map((item, idx) => {
                            const isAwaitingOrCompleted =
                              selectedStat === 'awaiting' || selectedStat === 'completed';

                            return (
                              <tr
                                key={idx}
                                className="group hover:bg-slate-50/80 dark:hover:bg-neutral-900/60 transition-colors"
                              >
                                <td className="py-3.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                      <Smartphone size={15} />
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[220px]">
                                      {item.label}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-6">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {item.sub}
                                  </span>
                                </td>

                                <td className="py-3.5 px-6 text-center whitespace-nowrap">
                                  {item.expired ? (
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg">
                                      Vencida
                                    </span>
                                  ) : selectedStat === 'expiredHistory' || selectedStat === 'expiredWarranties' ? (
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg">
                                      Ativa
                                    </span>
                                  ) : isAwaitingOrCompleted ? (
                                    (() => {
                                      switch (item.value) {
                                        case OrderStatus.PENDING:
                                          return (
                                            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                                              Pendente
                                            </span>
                                          );
                                        case OrderStatus.IN_PROGRESS:
                                          return (
                                            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap">
                                              Em Andamento
                                            </span>
                                          );
                                        case OrderStatus.WAITING_WITHDRAWAL:
                                          return (
                                            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                                              Retirar
                                            </span>
                                          );
                                        case OrderStatus.COMPLETED:
                                          return (
                                            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                                              Concluído
                                            </span>
                                          );
                                        default:
                                          return (
                                            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400">
                                              {item.value}
                                            </span>
                                          );
                                      }
                                    })()
                                  ) : (
                                    <span className="text-slate-300 dark:text-neutral-700 text-xs">—</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                  <span className={`text-xs font-black font-mono ${selectedStat === 'lowStock' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                    {item.value}
                                  </span>
                                </td>

                                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                  {item.id ? (
                                    <Link
                                      to={`/orders/${item.id}`}
                                      onClick={() => setSelectedStat(null)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-xs border border-primary/20 transition-all active:scale-95"
                                    >
                                      <span>Ver OS</span>
                                      <ArrowUpRight size={13} />
                                    </Link>
                                  ) : (
                                    <span className="text-slate-300 dark:text-neutral-700 text-xs">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View: Compact Cards (Padrão Bancada Mobile Pro) */}
                    <div className="sm:hidden p-4 flex flex-col gap-2.5">
                      {data.map((item, idx) => {
                        const isAwaitingOrCompleted =
                          selectedStat === 'awaiting' || selectedStat === 'completed';

                        return (
                          <Link
                            key={idx}
                            to={item.id ? `/orders/${item.id}` : '#'}
                            onClick={() => setSelectedStat(null)}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 active:scale-[0.98] transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                <Smartphone size={16} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate">
                                  {item.sub}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-black font-mono text-primary">
                                {item.value}
                              </span>
                              {item.id && <ChevronRight size={14} className="text-slate-400" />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Search size={20} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                      Nenhum registro encontrado
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Tente ajustar o filtro de período.</p>
                  </div>
                )}
              </div>

              {/* Desktop Footer (SaaS Profissional) */}
              <div className="hidden sm:flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 shrink-0">
                <span className="text-xs text-slate-400 font-medium">
                  Mostrando <strong className="text-slate-700 dark:text-slate-200">{data.length}</strong> {data.length === 1 ? 'item' : 'itens'} no relatório
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStat(null)}
                  className="px-5 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>

              {/* Mobile Footer (Botão Inferior Touch) */}
              <div className="sm:hidden p-3.5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedStat(null)}
                  className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  // Simple stats calculation based on DATE FILTERED data
  const totalSales = ordersInDateData
    .filter((o) => o.status === OrderStatus.COMPLETED)
    .reduce((acc, order) => acc + order.total, 0);

  const totalCosts = ordersInDateData
    .filter((o) => o.status === OrderStatus.COMPLETED)
    .reduce((acc, order) => {
      const orderCost = (order.selectedProducts || []).reduce((prodAcc, item) => {
        const product = products.find((p) => p.id === item.productId);
        const cost = item.cost !== undefined ? item.cost : (product?.priceCost || 0);
        return prodAcc + cost * item.quantity;
      }, 0);
      return acc + orderCost;
    }, 0);

  const pendingCount = orders.filter(
    (o) =>
      o.status === OrderStatus.PENDING ||
      o.status === OrderStatus.IN_PROGRESS ||
      o.status === OrderStatus.WAITING_WITHDRAWAL
  ).length;

  const completedCount = ordersInDateData.filter((o) => o.status === OrderStatus.COMPLETED).length;

  const displayOrders = searchQuery ? filteredOrders : ordersInDateData;

  return (
    <>
      <StatsModal />

      {/* Discrete Floating Warranty Alert (Desktop Only) */}
      <AnimatePresence>
        {showWarrantyPopup && activeExpiredWarranties.length > 0 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-40 hidden md:flex items-center justify-between gap-3.5 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-slate-200/80 dark:border-neutral-800 p-3.5 pl-4 rounded-2xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)] max-w-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 leading-none mb-1">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Atenção Garantias
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {activeExpiredWarranties.length} garantia(s) vencida(s)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSelectedStat('expiredWarranties')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xs flex items-center gap-1"
              >
                <span>Ver</span>
              </button>
              <button
                onClick={() => {
                  setShowWarrantyPopup(false);
                  sessionStorage.setItem('dismissed_warranty_popup', 'true');
                }}
                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title="Fechar alerta"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3.5 sm:gap-8 pb-2 sm:pb-8">
        {/* Modern Compact SaaS Top Bar (Integrated Single-Line Header) */}
        <div className="bg-white dark:bg-surface-dark p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Discreet Title + Live Count Badge (Oculto no Mobile para economizar espaço) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h1 className="text-slate-900 dark:text-white text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  Painel de Controle
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {pendingCount} em andamento
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                {dateFilter === 'today'
                  ? 'Resumo operacional e financeiro de hoje'
                  : dateFilter === 'yesterday'
                  ? 'Resumo de ontem'
                  : dateFilter === 'week'
                  ? 'Últimos 7 dias'
                  : dateFilter === 'month'
                  ? 'Resumo deste mês'
                  : dateFilter === 'custom'
                  ? 'Período personalizado'
                  : 'Todo o período'}
              </span>
            </div>
          </div>

          {/* Right/Middle: Integrated Search, Toggle Eye, Period Filter, Quick Actions & + Nova OS */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full xl:w-auto">
            {/* Row 1 on mobile: Eye + Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowValues(!showValues)}
                className="p-2 sm:p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary hover:border-primary/50 shrink-0 active:scale-95"
                title={showValues ? 'Ocultar valores financeiros' : 'Mostrar valores financeiros'}
              >
                {showValues ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              <div className="relative flex-1 sm:w-52 lg:w-60 min-w-[150px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-8 pr-7 py-2 border border-slate-200/70 dark:border-neutral-800 rounded-xl bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs transition-all"
                  placeholder="Buscar cliente, aparelho, OS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2 on mobile: Period Filter + Nova OS */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Period Filter Dropdown */}
              <div className="flex-1 sm:w-44 shrink-0">
                <CustomDropdown
                  label="PERÍODO"
                  options={dateFilterOptions}
                  selectedValue={dateFilter}
                  onSelect={(val) => setDateFilter(val as any)}
                  icon={<Calendar size={14} />}
                  className="w-full text-xs"
                />
              </div>

              {/* Custom Date Pickers (only if custom is active) */}
              {dateFilter === 'custom' && (
                <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                  <div className="w-32 sm:w-36">
                    <DatePicker value={customDate} onChange={setCustomDate} />
                  </div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">até</span>
                  <div className="w-32 sm:w-36">
                    <DatePicker value={customEndDate} onChange={setCustomEndDate} />
                  </div>
                </div>
              )}

              {/* Quick Actions Group (Oculto no Mobile para economizar espaço) */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <Link
                  to="/sales"
                  title="Venda Direta / PDV"
                  className="p-2 sm:px-2.5 sm:py-2 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 shrink-0"
                >
                  <ShoppingBag size={15} />
                  <span className="hidden md:inline">PDV</span>
                </Link>
                <Link
                  to="/clients"
                  title="Clientes"
                  className="p-2 sm:px-2.5 sm:py-2 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 shrink-0"
                >
                  <UserPlus size={15} />
                  <span className="hidden lg:inline">Clientes</span>
                </Link>
                <Link
                  to="/tracking"
                  title="Rastreio de Ordens"
                  className="p-2 sm:px-2.5 sm:py-2 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 active:scale-95 shrink-0"
                >
                  <Compass size={15} />
                  <span className="hidden lg:inline">Rastreio</span>
                </Link>
              </div>

              {/* Primary Action Button: + Nova OS (Oculto no mobile pois já existe na tabbar) */}
              <Link
                to="/orders/new"
                className="hidden sm:flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl shadow-xs shadow-primary/20 transition-all font-extrabold text-xs whitespace-nowrap active:scale-95 shrink-0"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Nova OS</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Professional Compact KPI Metric Cards (Oculto no Mobile para economizar espaço) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5"
        >
          {/* Card 1: Faturamento */}
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('sales')}
            className="text-left bg-white dark:bg-surface-dark p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between gap-2.5 transition-all group relative overflow-hidden hover:border-emerald-400/60 dark:hover:border-emerald-800 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <DollarSign size={16} />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
                  Faturamento {dateFilter === 'today' ? 'Hoje' : ''}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                Receita
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              {loading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {showValues ? (
                    <AnimatedNumber value={totalSales} prefix="R$ " format="currency" />
                  ) : (
                    'R$ ••••••'
                  )}
                </p>
              )}
            </div>

            {/* Sparkline Graphic */}
            <div className="h-4 w-full opacity-60 group-hover:opacity-100 transition-opacity">
              {!loading && showValues && last7DaysSales.some((v) => v > 0) ? (
                <svg className="w-full h-full" viewBox="0 0 120 20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getSparklinePath(last7DaysSales, 120, 20)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`${getSparklinePath(last7DaysSales, 120, 20)} L 120,20 L 0,20 Z`}
                    fill="url(#salesGrad)"
                  />
                </svg>
              ) : (
                <div className="w-full h-1 bg-emerald-500/10 rounded-full overflow-hidden mt-1.5">
                  <div className="w-full h-full bg-emerald-500/40 rounded-full" />
                </div>
              )}
            </div>
          </motion.button>

          {/* Card 2: Custos de Peças */}
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('costs')}
            className="text-left bg-white dark:bg-surface-dark p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between gap-2.5 transition-all group relative overflow-hidden hover:border-red-400/60 dark:hover:border-red-800 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <TrendingDown size={16} />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
                  Custos (Peças)
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 shrink-0">
                Insumos
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              {loading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {showValues ? (
                    <AnimatedNumber value={totalCosts} prefix="R$ " format="currency" />
                  ) : (
                    'R$ ••••••'
                  )}
                </p>
              )}
            </div>

            {/* Sparkline Graphic */}
            <div className="h-4 w-full opacity-60 group-hover:opacity-100 transition-opacity">
              {!loading && showValues && last7DaysCosts.some((v) => v > 0) ? (
                <svg className="w-full h-full" viewBox="0 0 120 20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="costsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getSparklinePath(last7DaysCosts, 120, 20)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`${getSparklinePath(last7DaysCosts, 120, 20)} L 120,20 L 0,20 Z`}
                    fill="url(#costsGrad)"
                  />
                </svg>
              ) : (
                <div className="w-full h-1 bg-red-500/10 rounded-full overflow-hidden mt-1.5">
                  <div className="w-full h-full bg-red-500/40 rounded-full" />
                </div>
              )}
            </div>
          </motion.button>

          {/* Card 3: Ordens em Aberto */}
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('awaiting')}
            className="text-left bg-white dark:bg-surface-dark p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between gap-2.5 transition-all group relative overflow-hidden hover:border-amber-400/60 dark:hover:border-amber-800 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Clock size={16} className="animate-spin-slow" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
                  Ordens em Aberto
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                Pendente
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-black tracking-tight">
                    <AnimatedNumber value={pendingCount} format="integer" />
                  </p>
                  <span className="text-xs text-slate-400 font-medium">ordens ativas</span>
                </div>
              )}
            </div>

            {/* Subtle Progress Bar */}
            <div className="h-4 w-full flex items-center">
              <div className="w-full h-1 bg-amber-500/15 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(pendingCount * 10, 100)}%` }}
                />
              </div>
            </div>
          </motion.button>

          {/* Card 4: Serviços Concluídos */}
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('completed')}
            className="text-left bg-white dark:bg-surface-dark p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between gap-2.5 transition-all group relative overflow-hidden hover:border-cyan-400/60 dark:hover:border-cyan-800 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  <CheckCircle size={16} />
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
                  Finalizadas
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0">
                Concluídas
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-black tracking-tight">
                    <AnimatedNumber value={completedCount} format="integer" />
                  </p>
                  <span className="text-xs text-slate-400 font-medium">no período</span>
                </div>
              )}
            </div>

            {/* Subtle Progress Bar */}
            <div className="h-4 w-full flex items-center">
              <div className="w-full h-1 bg-cyan-500/15 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${Math.min(completedCount * 10, 100)}%` }}
                />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Recent Orders Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <Wrench size={16} />
              </span>
              <h3 className="text-slate-900 dark:text-white text-xs sm:text-lg font-bold tracking-tight whitespace-nowrap truncate">
                {searchQuery ? 'Resultados da Busca' : 'Histórico de Ordens de Serviço'}
              </h3>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
              {displayOrders.length} {displayOrders.length === 1 ? 'ordem' : 'ordens'} encontrada(s)
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Data & Hora
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Cliente / Aparelho
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Status
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                      Valor Total
                    </th>
                    <th className="py-3.5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4">
                          <Skeleton className="h-5 w-20" />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-24 rounded-lg" />
                        </td>
                        <td className="p-4 text-right">
                          <Skeleton className="h-5 w-20 ml-auto" />
                        </td>
                        <td className="p-4 text-right">
                          <Skeleton className="h-7 w-20 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : displayOrders.length > 0 ? (
                    displayOrders.map((order, idx) => {
                      const client = clients.find((c) => c.id === order.clientId);
                      const clientName = client?.name || 'Cliente';

                      const handleWhatsApp = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!client?.phone) return;
                        let message = `Olá ${clientName}, aqui é da HcCell Assistência Técnica. Sobre seu aparelho ${order.deviceModel}: `;
                        const trackingUrl = `${window.location.origin}/#/tracking?id=${
                          order.displayId || order.id.slice(0, 8)
                        }`;
                        if (order.status === OrderStatus.COMPLETED) {
                          message += `está pronto e concluído com sucesso! Valor total: R$ ${order.total.toFixed(
                            2
                          )}.`;
                        } else if (order.status === OrderStatus.WAITING_WITHDRAWAL) {
                          message += `já está aguardando retirada!`;
                        } else {
                          message += `gostaria de falar sobre sua Ordem de Serviço #${
                            order.displayId || order.id.slice(0, 8)
                          }.`;
                        }
                        message += `\n\nAcompanhe o status aqui: ${trackingUrl}`;
                        const phone = client.phone.replace(/\D/g, '');
                        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                      };

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.25 }}
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="group hover:bg-slate-50/80 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                  timeZone: 'America/Sao_Paulo',
                                })}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'America/Sao_Paulo',
                                })}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6 min-w-[260px]">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/20">
                                {clientName.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-900 dark:text-white font-extrabold leading-none truncate">
                                    {clientName}
                                  </span>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md shrink-0">
                                    #{order.displayId || order.id.slice(0, 8)}
                                  </span>
                                </div>
                                <span
                                  className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px] mt-1"
                                  title={
                                    order.serviceType === 'VENDA_DIRETA'
                                      ? order.selectedProducts
                                          ?.map((p) => `${p.quantity}x ${p.name}`)
                                          .join(', ')
                                      : order.issueDescription
                                  }
                                >
                                  <strong className="font-semibold text-slate-700 dark:text-slate-300">
                                    {order.serviceType === 'VENDA_DIRETA'
                                      ? 'Venda de Produto'
                                      : order.deviceModel}
                                  </strong>{' '}
                                  •{' '}
                                  {order.serviceType === 'VENDA_DIRETA'
                                    ? order.selectedProducts
                                        ?.map((p) => `${p.quantity}x ${p.name}`)
                                        .join(', ') || 'Produtos Diversos'
                                    : order.issueDescription}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <OrderKebabMenu order={order} mode="badge" />
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                                R$ {order.total.toFixed(2)}
                              </span>
                              {order.status === OrderStatus.COMPLETED && (
                                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                                  Pago
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {client?.phone && (
                                <button
                                  onClick={handleWhatsApp}
                                  className="size-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-sm"
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <WhatsAppIcon size={15} color="#10b981" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/orders/${order.id}/edit`);
                                }}
                                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all border border-slate-200/60 dark:border-neutral-700 shadow-sm"
                                title="Editar Ordem de Serviço"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                              </button>
                              <Link
                                to={`/orders/${order.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all border border-slate-200/60 dark:border-neutral-700 shadow-sm"
                                title="Ver Detalhes da OS"
                              >
                                <ArrowUpRight size={14} />
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Search size={28} className="mb-2 opacity-30" />
                          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                            Nenhuma ordem encontrada
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Tente ajustar o filtro de data ou o termo de busca.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (App Nativo / iOS Fintech Style) */}
          <div className="md:hidden flex flex-col gap-2.5">
            {displayOrders.length > 0 ? (
              displayOrders.map((order) => {
                const client = clients.find((c) => c.id === order.clientId);
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    client={client}
                  />
                );
              })
            ) : (
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-8 text-center text-slate-400">
                <Search size={24} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                  Nenhuma ordem recente
                </p>
              </div>
            )}

            {displayOrders.length > 0 && (
              <Link
                to="/orders"
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-neutral-800 text-primary hover:bg-primary/5 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                <span>Ver todas as ordens de serviço</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
