import React from 'react';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import { Search, Plus, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Printer, ChevronRight, ChevronLeft, TrendingDown, EyeOff, Calendar, Filter, X, Smartphone, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CustomDropdown } from '../components/CustomDropdown';
import { DatePicker } from '../components/DatePicker';


import { Skeleton } from '../components/Skeleton';

export const Dashboard: React.FC = () => {
  const { orders, products, clients, loading, warrantyRecords, dismissWarranty, dismissMultipleWarranties } = useApp();
  const navigate = useNavigate();
  const [selectedStat, setSelectedStat] = React.useState<'sales' | 'awaiting' | 'completed' | 'lowStock' | 'costs' | 'expiredWarranties' | 'expiredHistory' | null>(null);
  const [isDateSheetOpen, setIsDateSheetOpen] = React.useState(false);
  const [showWarrantyPopup, setShowWarrantyPopup] = React.useState(() => !sessionStorage.getItem('dismissed_warranty_popup'));

  const handleDismissWarranty = async (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await dismissWarranty(orderId);
  };

  const handleDismissAllWarranties = async (orderIds: string[]) => {
    await dismissMultipleWarranties(orderIds);
    setSelectedStat(null);
    setShowWarrantyPopup(false);
    sessionStorage.setItem('dismissed_warranty_popup', 'true');
  };
  const [dateFilter, setDateFilter] = React.useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Calculate All Warranties and identify which are expired
  const allOrdersWithWarranty = React.useMemo(() => {
    return orders.filter(o => 
      o.status === OrderStatus.COMPLETED && 
      !o.noWarranty && 
      o.warrantyEnd
    ).sort((a, b) => new Date(b.warrantyEnd!).getTime() - new Date(a.warrantyEnd!).getTime());
  }, [orders]);

  const allExpiredWarranties = React.useMemo(() => {
    const now = new Date().getTime();
    return allOrdersWithWarranty.filter(o => 
      new Date(o.warrantyEnd!).getTime() < now
    );
  }, [allOrdersWithWarranty]);

  const activeExpiredWarranties = React.useMemo(() => {
    return allExpiredWarranties.filter(o => {
      const record = warrantyRecords.find(r => r.orderId === o.id);
      return !record || !record.dismissed;
    });
  }, [allExpiredWarranties, warrantyRecords]);

  const dateFilterOptions = [
    { value: 'today', label: 'Hoje', icon: <Clock size={18} /> },
    { value: 'yesterday', label: 'Ontem', icon: <TrendingDown size={18} /> },
    { value: 'week', label: 'Últimos 7 Dias', icon: <Calendar size={18} /> },
    { value: 'month', label: 'Este Mês', icon: <Calendar size={18} /> },
    { value: 'all', label: 'Todo o Período', icon: <Filter size={18} /> },
    { value: 'custom', label: 'Personalizado', icon: <Search size={18} /> }
  ];

  const currentDateLabel = dateFilterOptions.find(o => o.value === dateFilter)?.label || 'Filtrar Data';

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
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    return days.map(day => {
      const dayOrders = orders.filter(o => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        return oDate.getFullYear() === day.getFullYear() &&
               oDate.getMonth() === day.getMonth() &&
               oDate.getDate() === day.getDate() &&
               o.status === 'Concluído';
      });
      return dayOrders.reduce((sum, o) => sum + o.total, 0);
    });
  }, [orders]);

  const last7DaysCosts = React.useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    return days.map(day => {
      const dayOrders = orders.filter(o => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        return oDate.getFullYear() === day.getFullYear() &&
               oDate.getMonth() === day.getMonth() &&
               oDate.getDate() === day.getDate() &&
               o.status === 'Concluído';
      });
      return dayOrders.reduce((sum, order) => {
        const orderCost = (order.selectedProducts || []).reduce((prodAcc, item) => {
          const product = products.find(p => p.id === item.productId);
          const cost = item.cost !== undefined ? item.cost : (product?.priceCost || 0);
          return prodAcc + (cost * item.quantity);
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
  const ordersInDateData = orders.filter(o => isDateInFilter(o.createdAt));

  // 2. Then filter by SEARCH (for the list)
  const filteredOrders = ordersInDateData.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.issueDescription.toLowerCase().includes(searchQuery.toLowerCase())
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
      expiredHistory: 'Histórico de Garantias'
    };

    const getStatData = () => {
      switch (selectedStat) {
        case 'sales':
          return ordersInDateData.filter(o => o.status === 'Concluído').map(o => ({ 
            id: o.id,
            label: o.deviceModel, 
            value: `R$ ${o.total.toFixed(2)}`, 
            sub: new Date(o.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' -') 
          }));
        case 'awaiting':
          return orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.WAITING_WITHDRAWAL)
            .map(o => {
              const client = clients.find(c => c.id === o.clientId);
              const dateStr = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const timeStr = new Date(o.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              return {
                id: o.id,
                label: o.deviceModel,
                value: o.status,
                sub: `${client?.name || 'Cliente não encontrado'} • ${dateStr} às ${timeStr}`
              };
            });
        case 'completed':
          return ordersInDateData.filter(o => o.status === 'Concluído')
            .map(o => {
              const client = clients.find(c => c.id === o.clientId);
              return {
                id: o.id,
                label: o.deviceModel,
                value: 'Concluído',
                sub: `${client?.name || 'Cliente'} • ${new Date(o.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' -')}`
              };
            });
        case 'costs':
          return ordersInDateData.filter(o => o.status === 'Concluído').map(order => {
            const orderCost = (order.selectedProducts || []).reduce((acc, item) => {
              const p = products.find(prod => prod.id === item.productId);
              const cost = item.cost !== undefined ? item.cost : (p?.priceCost || 0);
              return acc + (cost * item.quantity);
            }, 0);
            return {
              id: order.id,
              label: order.deviceModel,
              value: `R$ ${orderCost.toFixed(2)}`,
              sub: `OS #${order.id.slice(0, 8)}`
            };
          }).filter(item => item.value !== 'R$ 0.00');
        case 'expiredWarranties':
          return activeExpiredWarranties.map(o => {
            const client = clients.find(c => c.id === o.clientId);
            return {
              id: o.id,
              label: o.deviceModel,
              value: new Date(o.warrantyEnd!).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
              sub: `${client?.name || 'Cliente'} • OS #${o.displayId || o.id.slice(0, 8)}`,
              expired: true
            };
          });
        case 'expiredHistory':
          return allOrdersWithWarranty.map(o => {
            const client = clients.find(c => c.id === o.clientId);
            const endDate = new Date(o.warrantyEnd!);
            endDate.setHours(23, 59, 59, 999);
            const isExpired = endDate < new Date();
            return {
              id: o.id,
              label: o.deviceModel,
              value: new Date(o.warrantyEnd!).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
              sub: `${client?.name || 'Cliente'} • OS #${o.displayId || o.id.slice(0, 8)}`,
              expired: isExpired
            };
          });
        case 'lowStock':
          return products.filter(p => p.quantity <= (p.minStockLevel || 5))
            .map(p => ({ label: p.name, value: `${p.quantity} un`, sub: `Mín: ${p.minStockLevel || 5}` }));
        default:
          return [];
      }
    };

    const data = getStatData();
    const isMobile = window.innerWidth < 640;

    return (
      <AnimatePresence>
        {selectedStat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStat(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={isMobile ? { y: "100%" } : { scale: 0.9, opacity: 0, y: 20 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={isMobile ? { y: "100%" } : { scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="relative bg-white dark:bg-surface-dark rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-neutral-800 flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              {/* Drag Handle for Mobile */}
              <div className="sm:hidden flex justify-center pt-4 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-full" />
              </div>

              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-surface-dark relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Estatísticas</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{titles[selectedStat]}</h3>
                </div>
                <button 
                  onClick={() => setSelectedStat(null)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex flex-col gap-4">
                  {data.length > 0 ? data.map((item, idx) => {
                    const MotionLink = motion(Link);
                    
                    // Definir o ícone dinâmico do item
                    let ItemIcon = Smartphone;
                    let iconBg = 'bg-primary/10 text-primary';
                    
                    if (selectedStat === 'sales') {
                      ItemIcon = DollarSign;
                      iconBg = 'bg-emerald-500/10 text-emerald-500';
                    } else if (selectedStat === 'costs') {
                      ItemIcon = DollarSign;
                      iconBg = 'bg-amber-500/10 text-amber-500';
                    } else if (selectedStat === 'lowStock') {
                      ItemIcon = Package;
                      iconBg = 'bg-red-500/10 text-red-500';
                    } else if (selectedStat === 'completed') {
                      ItemIcon = CheckCircle;
                      iconBg = 'bg-emerald-500/10 text-emerald-500';
                    } else if (selectedStat === 'expiredWarranties' || selectedStat === 'expiredHistory') {
                      ItemIcon = Calendar;
                      iconBg = item.expired ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500';
                    }

                    const isAwaitingOrCompleted = selectedStat === 'awaiting' || selectedStat === 'completed';

                    return (
                      <MotionLink 
                        key={idx}
                        to={item.id ? `/orders/${item.id}` : '#'}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={item.id ? { y: -2, scale: 1.005 } : {}}
                        transition={{ duration: 0.22, delay: idx * 0.03 }}
                        className={`flex items-center justify-between p-4 rounded-2xl bg-slate-50/60 dark:bg-neutral-900/30 border border-slate-100 dark:border-neutral-800/80 hover:border-primary/20 transition-all ${item.id ? 'cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:bg-slate-100/90 dark:hover:bg-neutral-900/60' : ''}`}
                        onClick={() => setSelectedStat(null)}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Ícone Estilizado à Esquerda */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                            <ItemIcon size={18} />
                          </div>
                          
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.label}</span>
                              {item.expired ? (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">Vencida</span>
                              ) : (selectedStat === 'expiredHistory' || selectedStat === 'expiredWarranties') ? (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">Ativa</span>
                              ) : null}
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">{item.sub}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isAwaitingOrCompleted ? (
                            (() => {
                              switch (item.value) {
                                case 'Pendente':
                                  return <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap">Pendente</span>;
                                case 'Em Andamento':
                                  return <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 whitespace-nowrap">Em Andamento</span>;
                                case 'Aguardando Retirada':
                                  return <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 whitespace-nowrap">Retirar</span>;
                                case 'Concluído':
                                  return <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">Concluído</span>;
                                case 'Cancelado':
                                  return <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 whitespace-nowrap">Cancelado</span>;
                                default:
                                  return <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-slate-500/10 text-slate-500 border border-slate-500/20 whitespace-nowrap">{item.value}</span>;
                              }
                            })()
                          ) : (
                            <span className={`text-base font-black ${selectedStat === 'lowStock' ? 'text-red-500' : 'text-primary'}`}>
                              {item.value}
                            </span>
                          )}
                          
                          {item.id && <ChevronRight size={14} className="text-slate-300 dark:text-neutral-700" />}
                        </div>
                      </MotionLink>
                    )
                  }) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-neutral-800">
                        <Search size={24} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold text-sm">Nenhum registro encontrado</p>
                      <p className="text-xs text-slate-400 mt-1">Tente ajustar o filtro de período.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 sm:px-8 py-5 sm:py-6 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 relative z-10">
                <button
                  onClick={() => setSelectedStat(null)}
                  className="w-full py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-sm transition-all active:scale-[0.98] hover:scale-[1.01] duration-200 shadow-lg hover:brightness-110 shadow-slate-950/10 dark:shadow-none hover:shadow-primary/10"
                >
                  FECHAR RELATÓRIO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  // Simple stats calculation based on DATE FILTERED data
  const totalSales = ordersInDateData.filter(o => o.status === 'Concluído').reduce((acc, order) => acc + order.total, 0);
  const totalCosts = ordersInDateData.filter(o => o.status === 'Concluído').reduce((acc, order) => {
    const orderCost = (order.selectedProducts || []).reduce((prodAcc, item) => {
      const product = products.find(p => p.id === item.productId);
      const cost = item.cost !== undefined ? item.cost : (product?.priceCost || 0);
      return prodAcc + (cost * item.quantity);
    }, 0);
    return acc + orderCost;
  }, 0);
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.WAITING_WITHDRAWAL).length;
  const completedCount = ordersInDateData.filter(o => o.status === 'Concluído').length;
  const lowStockCount = products.filter(p => p.quantity <= (p.minStockLevel || 5)).length; // Inventory is always global

  const displayOrders = searchQuery ? filteredOrders : ordersInDateData; // Show all filtered orders (removed slice)

  return (
    <>
      <StatsModal />
      {/* Discrete Floating Warranty Alert */}
      <AnimatePresence>
        {showWarrantyPopup && activeExpiredWarranties.length > 0 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-red-100 dark:border-red-950/40 p-4 rounded-2xl shadow-2xl shadow-red-500/5 max-w-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                <AlertTriangle size={18} className="animate-pulse" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-none mb-0.5">Garantias</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {activeExpiredWarranties.length} vencida(s) expirada(s)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedStat('expiredWarranties')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-sm shadow-red-600/10"
              >
                Ver
              </button>
              <button
                onClick={() => {
                  setShowWarrantyPopup(false);
                  sessionStorage.setItem('dismissed_warranty_popup', 'true');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold tracking-tight">Painel de Controle</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              {dateFilter === 'today' ? 'Visão geral das operações de hoje.' :
                dateFilter === 'yesterday' ? 'Visão geral das operações de ontem.' :
                  dateFilter === 'week' ? 'Visão geral dos últimos 7 dias.' :
                    dateFilter === 'month' ? 'Visão geral deste mês.' :
                      dateFilter === 'custom' ? `Visão geral de ${new Date(customDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.` :
                        'Visão geral de todo o período.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 items-stretch sm:items-center">
            {/* Date Filters */}
            {/* Date Filter Dropdown */}
            <CustomDropdown
              label="FILTRAR POR PERÍODO"
              options={dateFilterOptions}
              selectedValue={dateFilter}
              onSelect={(val) => setDateFilter(val as any)}
              icon={<Calendar size={18} />}
              className="w-full sm:w-64"
            />

            {dateFilter === 'custom' && (
              <div className="flex flex-col sm:flex-row items-center gap-2 animate-fade-in w-full sm:w-auto">
                <div className="w-full sm:w-48">
                  <DatePicker 
                    value={customDate} 
                    onChange={setCustomDate} 
                  />
                </div>
                <span className="text-slate-400 text-[10px] uppercase font-bold px-1">até</span>
                <div className="w-full sm:w-48">
                  <DatePicker 
                    value={customEndDate} 
                    onChange={setCustomEndDate} 
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowValues(!showValues)}
                className="p-2.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-500 shadow-sm transition-all hover:border-primary/50"
                title={showValues ? "Ocultar valores" : "Mostrar valores"}
              >
                {showValues ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-sm transition-all"
                  placeholder="Buscar serviço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Link to="/orders/new" className="hidden sm:flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-sm shadow-primary/30 transition-all font-bold text-sm whitespace-nowrap">
              <Plus size={18} />
              <span>Nova OS</span>
            </Link>
          </div>
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-2 md:mb-0"
      >
        {/* Sales */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSelectedStat('sales')}
          className="text-left bg-white dark:bg-surface-dark p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col gap-2 transition-all group relative overflow-hidden hover:border-green-300 dark:hover:border-green-900/50 hover:shadow-lg"
        >
          <div className="absolute right-[0%] top-[5%] p-3 opacity-10 group-hover:rotate-12 transition-all duration-700 dark:opacity-20 pointer-events-none animate-pulse">
            <DollarSign className="w-14 h-14 sm:w-20 sm:h-20 dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 group-hover:bg-green-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <DollarSign size={18} className="animate-pulse" />
            </div>
            {dateFilter === 'today' && <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">Hoje</span>}
          </div>
          <div className="relative z-10 w-full">
            <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Faturamento {dateFilter === 'today' ? 'do Dia' : ''}</p>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <p className="text-slate-900 dark:text-white text-lg sm:text-xl font-black mt-1 tracking-tight">
                {showValues ? `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ----'}
              </p>
            )}
          </div>
          {/* Sparkline */}
          {!loading && showValues && last7DaysSales.some(v => v > 0) && (
            <div className="h-6 mt-1 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-full h-full" viewBox="0 0 120 32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={getSparklinePath(last7DaysSales, 120, 32)}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`${getSparklinePath(last7DaysSales, 120, 32)} L 120,32 L 0,32 Z`}
                  fill="url(#salesGrad)"
                />
              </svg>
            </div>
          )}
        </motion.button>

        {/* Costs */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSelectedStat('costs')}
          className="text-left bg-white dark:bg-surface-dark p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col gap-2 transition-all group relative overflow-hidden hover:border-red-300 dark:hover:border-red-900/50 hover:shadow-lg"
        >
          <div className="absolute right-[0%] top-[5%] p-3 opacity-10 group-hover:rotate-12 transition-all duration-700 dark:opacity-20 pointer-events-none animate-pulse">
            <TrendingDown className="w-14 h-14 sm:w-20 sm:h-20 dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <TrendingDown size={18} className="animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div className="relative z-10 w-full">
            <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Custos (Peças)</p>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <p className="text-slate-900 dark:text-white text-lg sm:text-xl font-black mt-1 tracking-tight">
                {showValues ? `R$ ${totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ----'}
              </p>
            )}
          </div>
          {/* Sparkline */}
          {!loading && showValues && last7DaysCosts.some(v => v > 0) && (
            <div className="h-6 mt-1 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-full h-full" viewBox="0 0 120 32" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="costsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={getSparklinePath(last7DaysCosts, 120, 32)}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`${getSparklinePath(last7DaysCosts, 120, 32)} L 120,32 L 0,32 Z`}
                  fill="url(#costsGrad)"
                />
              </svg>
            </div>
          )}
        </motion.button>

        {/* Awaiting */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSelectedStat('awaiting')}
          className="text-left bg-white dark:bg-surface-dark p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col gap-2 transition-all group relative overflow-hidden"
        >
          <div className="absolute right-[0%] top-[5%] p-3 opacity-10 animate-spin-slow dark:opacity-20 pointer-events-none">
            <Clock className="w-14 h-14 sm:w-20 sm:h-20 dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Clock size={18} className="animate-spin-slow" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Em Aberto</p>
            {loading ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-slate-900 dark:text-white text-lg sm:text-xl font-black mt-1 tracking-tight">{pendingCount}</p>
            )}
          </div>
        </motion.button>

        {/* Completed */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSelectedStat('completed')}
          className="text-left bg-white dark:bg-surface-dark p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col gap-2 transition-all group relative overflow-hidden"
        >
          <div className="absolute right-[0%] top-[5%] p-3 opacity-10 group-hover:rotate-12 transition-all duration-700 dark:opacity-20 pointer-events-none animate-pulse">
            <CheckCircle className="w-14 h-14 sm:w-20 sm:h-20 dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <CheckCircle size={18} className="animate-pulse" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Concluídos</p>
            {loading ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-slate-900 dark:text-white text-lg sm:text-xl font-black mt-1 tracking-tight">{completedCount}</p>
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* Recent Orders Table */}
      <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-slate-900 dark:text-white text-[15px] sm:text-lg font-bold tracking-tight whitespace-nowrap">
            {searchQuery ? 'Resultados da Busca' : 'Histórico de Ordens'}
          </h3>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Data</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Aparelho / Problema</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Valor</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-white/5 animate-pulse">
                    <td className="p-4 sm:p-5"><Skeleton className="h-6 w-16" /></td>
                    <td className="p-4 sm:p-5">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="hidden sm:table-cell p-4 sm:p-5"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4 sm:p-5"><Skeleton className="h-8 w-24 rounded-full" /></td>
                    <td className="p-4 sm:p-5 text-right"><Skeleton className="h-6 w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : displayOrders.length > 0 ? (
                  displayOrders.map((order, idx) => {
                    const client = clients.find(c => c.id === order.clientId);
                    const clientName = client?.name || 'Cliente';
                    
                    const handleWhatsApp = (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!client?.phone) return;
                      let message = `Olá ${clientName}, aqui é da HcCell Assistência Técnica. Sobre seu aparelho ${order.deviceModel}: `;
                      const trackingUrl = `${window.location.origin}/#/tracking?id=${order.displayId || order.id.slice(0, 8)}`;
                      if (order.status === OrderStatus.COMPLETED) {
                        message += `está pronto e concluído com sucesso! Valor total: R$ ${order.total.toFixed(2)}.`;
                      } else if (order.status === OrderStatus.WAITING_WITHDRAWAL) {
                        message += `já está aguardando retirada!`;
                      } else {
                        message += `gostaria de falar sobre sua Ordem de Serviço #${order.displayId || order.id.slice(0, 8)}.`;
                      }
                      message += `\n\nAcompanhe aqui: ${trackingUrl}`;
                      const phone = client.phone.replace(/\D/g, '');
                      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                    };

                    return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3 }}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-600">
                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black shrink-0 shadow-sm border border-blue-200 dark:border-blue-900/30">
                            {clientName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-900 dark:text-white font-bold leading-none">
                                {clientName}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">#{order.displayId || order.id.slice(0, 8)}</span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[250px] mt-1" title={order.serviceType === 'VENDA_DIRETA' ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ')) : order.issueDescription}>
                              <strong className="font-semibold text-slate-700 dark:text-slate-300">{order.serviceType === 'VENDA_DIRETA' ? 'Venda de Produto' : order.deviceModel}</strong> • {order.serviceType === 'VENDA_DIRETA'
                                ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'Produtos Diversos')
                                : order.issueDescription}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-100' :
                          order.status === OrderStatus.PENDING ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            order.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-100' :
                              order.status === OrderStatus.WAITING_WITHDRAWAL ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === OrderStatus.COMPLETED ? 'bg-green-500' :
                            order.status === OrderStatus.PENDING ? 'bg-yellow-500' :
                              order.status === OrderStatus.CANCELLED ? 'bg-red-500' :
                                order.status === OrderStatus.WAITING_WITHDRAWAL ? 'bg-orange-500' : 'bg-blue-500'
                            }`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">R$ {order.total.toFixed(2)}</span>
                          {order.status === OrderStatus.COMPLETED && (order.paymentMethod || (order.payments && order.payments.length > 0)) && (
                            <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-green-100">
                               💰 Pago
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleWhatsApp}
                                className="size-8 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all hover:scale-105 border border-green-100 dark:border-green-900/30 shadow-sm animate-pulse"
                                title="WhatsApp"
                            >
                                <img src="/whatsapp.png" alt="WhatsApp" className="size-4 object-contain" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/orders/${order.id}/edit`);
                                }}
                                className="size-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all hover:scale-105 border border-blue-100 dark:border-blue-900/30 shadow-sm"
                                title="Editar Ordem"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <Link to={`/orders/${order.id}`} onClick={(e) => e.stopPropagation()} className="size-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all hover:scale-105 border border-slate-100 dark:border-neutral-700 shadow-sm" title="Ver Detalhes">
                              <Eye size={16} />
                            </Link>
                        </div>
                      </td>
                    </motion.tr>
                  )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Search size={32} className="mb-3 opacity-20" />
                        <p className="font-medium">Nenhuma ordem encontrada no período.</p>
                        <p className="text-xs mt-1">Tente mudar o filtro de data.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-3">
          {displayOrders.length > 0 ? (
            displayOrders.map((order) => {
              const MotionLink = motion(Link);
              return (
                <MotionLink
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  to={`/orders/${order.id}`}
                  key={order.id}
                  className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm transition-all"
                >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} • {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {order.serviceType === 'VENDA_DIRETA' ? 'Venda de Produto' : order.deviceModel}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${order.status === OrderStatus.COMPLETED ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30' :
                    order.status === OrderStatus.PENDING ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30' :
                      order.status === OrderStatus.CANCELLED ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                        order.status === OrderStatus.WAITING_WITHDRAWAL ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' :
                          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                  {order.serviceType === 'VENDA_DIRETA'
                    ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'Produtos Diversos')
                    : order.issueDescription}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Valor Total</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</span>
                </div>
              </MotionLink>
            )
          })
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 border-dashed p-8 text-center text-slate-400 dark:text-slate-500">
              <p className="font-medium text-sm">Nenhuma ordem recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
   </>
  );
};
