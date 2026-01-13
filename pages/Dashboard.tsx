import React from 'react';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import { Search, Plus, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Printer, ChevronRight, ChevronLeft, TrendingDown, EyeOff, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { orders, products, clients } = useApp();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStat, setSelectedStat] = React.useState<'sales' | 'awaiting' | 'completed' | 'lowStock' | 'costs' | null>(null);

  // Persist showValues preference
  const [showValues, setShowValues] = React.useState(() => {
    const saved = localStorage.getItem('dashboard_showValues');
    return saved !== null ? JSON.parse(saved) : true;
  });

  React.useEffect(() => {
    localStorage.setItem('dashboard_showValues', JSON.stringify(showValues));
  }, [showValues]);

  const [dateFilter, setDateFilter] = React.useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = React.useState<string>(new Date().toISOString().split('T')[0]);

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

  // Modal Component
  const StatsModal = () => {
    if (!selectedStat) return null;

    const titles = {
      sales: 'Vendas Totais',
      awaiting: 'Aguardando Reparo',
      completed: 'Serviços Concluídos',
      lowStock: 'Estoque Baixo',
      costs: 'Custo Total (Peças)'
    };

    const getStatData = () => {
      switch (selectedStat) {
        case 'sales':
          return ordersInDateData.filter(o => o.status === 'Concluído').map(o => ({ label: o.deviceModel, value: `R$ ${o.total.toFixed(2)}`, sub: new Date(o.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' -') }));
        case 'awaiting':
          // Show ALL active orders regardless of date filter
          return orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.WAITING_PAYMENT)
            .map(o => {
              const client = clients.find(c => c.id === o.clientId);
              const dateStr = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const timeStr = new Date(o.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              return {
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
              label: order.deviceModel,
              value: `R$ ${orderCost.toFixed(2)}`,
              sub: `OS #${order.id.slice(0, 8)}`
            };
          }).filter(item => item.value !== 'R$ 0.00');
        case 'lowStock':
          return products.filter(p => p.quantity <= (p.minStockLevel || 5))
            .map(p => ({ label: p.name, value: `${p.quantity} un`, sub: `Mín: ${p.minStockLevel || 5}` }));
        default:
          return [];
      }
    };

    const data = getStatData();

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent dark:border-neutral-800">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{titles[selectedStat]}</h3>
            <button onClick={() => setSelectedStat(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-400">
              <Plus className="rotate-45" size={20} />
            </button>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-3">
              {data.length > 0 ? data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
                    <span className="text-xs text-slate-500">{item.sub}</span>
                  </div>
                  <span className={`text-sm font-bold ${selectedStat === 'lowStock' ? 'text-red-600' : 'text-primary'}`}>{item.value}</span>
                </div>
              )) : (
                <p className="text-center py-8 text-slate-500 italic">Nenhum registro encontrado para o período selecionado.</p>
              )}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex justify-end">
            <button
              onClick={() => setSelectedStat(null)}
              className="px-4 py-2 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
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
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.WAITING_PAYMENT).length;
  const completedCount = ordersInDateData.filter(o => o.status === 'Concluído').length;
  const lowStockCount = products.filter(p => p.quantity <= (p.minStockLevel || 5)).length; // Inventory is always global

  const displayOrders = searchQuery ? filteredOrders : ordersInDateData; // Show all filtered orders (removed slice)

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in">
      <StatsModal />
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

        <div className="flex flex-col sm:flex-row gap-3 items-stretch lg:items-center">
          {/* Date Filters */}
          <div className="flex items-center bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-lg p-1 shadow-sm overflow-x-auto sm:overflow-visible">
            <button
              onClick={() => setShowValues(!showValues)}
              className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-md transition-all mr-1"
              title={showValues ? "Ocultar valores" : "Mostrar valores"}
            >
              {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-neutral-700 mx-1"></div>
            <button onClick={() => setDateFilter('today')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${dateFilter === 'today' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}>Hoje</button>
            <button onClick={() => setDateFilter('yesterday')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${dateFilter === 'yesterday' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}>Ontem</button>
            <button onClick={() => setDateFilter('week')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${dateFilter === 'week' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}>7 Dias</button>
            <button onClick={() => setDateFilter('month')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${dateFilter === 'month' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}>Mês</button>
            <button onClick={() => setDateFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${dateFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}>Todos</button>
            <div className="w-px h-4 bg-slate-200 dark:bg-neutral-700 mx-1"></div>
            {dateFilter === 'custom' ? (
              <div className="flex items-center gap-1 ml-1 animate-in fade-in slide-in-from-left-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-transparent border-none p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer w-[95px]"
                />
                <span className="text-slate-400 text-[10px]">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent border-none p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer w-[95px]"
                />
              </div>
            ) : (
              <button
                onClick={() => setDateFilter('custom')}
                className="ml-1 p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-md transition-colors"
                title="Data Personalizada"
              >
                <Calendar size={16} />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-neutral-800 rounded-lg leading-5 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-sm"
              placeholder="Buscar serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/orders/new" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-sm shadow-primary/30 transition-all font-bold text-sm whitespace-nowrap">
            <Plus size={18} />
            <span className="hidden sm:inline">Nova OS</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 animate-fade-in-up">
        {/* Sales */}
        <button
          onClick={() => setSelectedStat('sales')}
          className="text-left bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20">
            <DollarSign size={80} className="dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <DollarSign size={24} />
            </div>
            {dateFilter === 'today' && <span className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-900/30">Hoje</span>}
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">Faturamento {dateFilter === 'today' ? 'do Dia' : ''}</p>
            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1 tracking-tight">
              {showValues ? `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ----'}
            </p>
          </div>
        </button>

        {/* Costs */}
        <button
          onClick={() => setSelectedStat('costs')}
          className="text-left bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20">
            <TrendingDown size={80} className="dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">Custos (Peças)</p>
            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1 tracking-tight">
              {showValues ? `R$ ${totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ----'}
            </p>
          </div>
        </button>

        {/* Awaiting */}
        <button
          onClick={() => setSelectedStat('awaiting')}
          className="text-left bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20">
            <Clock size={80} className="dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Clock size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">Pendentes</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">Em Aberto</p>
            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1 tracking-tight">{pendingCount}</p>
          </div>
        </button>

        {/* Completed */}
        <button
          onClick={() => setSelectedStat('completed')}
          className="text-left bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20">
            <CheckCircle size={80} className="dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CheckCircle size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">Prontos</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">Concluídos</p>
            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1 tracking-tight">{completedCount}</p>
          </div>
        </button>

        {/* Low Inventory (Global) */}
        <button
          onClick={() => setSelectedStat('lowStock')}
          className="text-left bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-4 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20">
            <AlertTriangle size={80} className="dark:text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-100 dark:border-red-900/30">Alerta</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">Estoque Baixo</p>
            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1 tracking-tight">{lowStockCount}</p>
          </div>
        </button>
      </div>

      {/* Recent Orders Table */}
      <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
            {searchQuery ? 'Resultados da Busca' : 'Histórico de Ordens'}
          </h3>
          <Link to="/orders" className="text-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
            Ver Lista Completa <ChevronRight size={14} />
          </Link>
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
                {displayOrders.length > 0 ? (
                  displayOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
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
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 dark:text-white font-bold">
                            {order.serviceType === 'VENDA_DIRETA' ? 'Venda de Produto' : order.deviceModel}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-500 truncate max-w-[200px]" title={order.serviceType === 'VENDA_DIRETA' ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ')) : order.issueDescription}>
                            {order.serviceType === 'VENDA_DIRETA'
                              ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'Produtos Diversos')
                              : order.issueDescription}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-100' :
                          order.status === OrderStatus.PENDING ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            order.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-100' :
                              order.status === OrderStatus.WAITING_PAYMENT ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === OrderStatus.COMPLETED ? 'bg-green-500' :
                            order.status === OrderStatus.PENDING ? 'bg-yellow-500' :
                              order.status === OrderStatus.CANCELLED ? 'bg-red-500' :
                                order.status === OrderStatus.WAITING_PAYMENT ? 'bg-orange-500' : 'bg-blue-500'
                            }`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                        R$ {order.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link to={`/orders/${order.id}`} className="text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors" title="Ver Detalhes">
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
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
            displayOrders.map((order) => (
              <Link
                to={`/orders/${order.id}`}
                key={order.id}
                className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm active:scale-[0.99] transition-transform"
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
                        order.status === OrderStatus.WAITING_PAYMENT ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' :
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
              </Link>
            ))
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 border-dashed p-8 text-center text-slate-400 dark:text-slate-500">
              <p className="font-medium text-sm">Nenhuma ordem recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};