import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import { ServiceOrder, Product } from '../types';

interface DashboardChartProps {
  orders: ServiceOrder[];
  products: Product[];
  dateFilter: string;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ orders, products, dateFilter }) => {
  const [activeTab, setActiveTab] = React.useState<'revenue' | 'orders'>('revenue');

  // Process data for the last 7 or 30 days based on filter
  const chartData = React.useMemo(() => {
    const daysCount = dateFilter === 'month' ? 30 : 7;
    const days = Array.from({ length: daysCount }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysCount - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    return days.map((day) => {
      const dayLabel = day.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });

      const dayOrders = orders.filter((o) => {
        const oDate = new Date(o.createdAt);
        oDate.setHours(0, 0, 0, 0);
        return oDate.getTime() === day.getTime();
      });

      const completedOrders = dayOrders.filter((o) => o.status === 'Concluído');

      const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

      const cost = completedOrders.reduce((sum, order) => {
        const orderCost = (order.selectedProducts || []).reduce((prodAcc, item) => {
          const product = products.find((p) => p.id === item.productId);
          const itemCost = item.cost !== undefined ? item.cost : (product?.priceCost || 0);
          return prodAcc + itemCost * item.quantity;
        }, 0);
        return sum + orderCost;
      }, 0);

      const profit = Math.max(0, revenue - cost);
      const totalCount = dayOrders.length;
      const completedCount = completedOrders.length;

      return {
        date: dayLabel,
        receita: revenue,
        custo: cost,
        lucro: profit,
        ordens: totalCount,
        concluidas: completedCount,
      };
    });
  }, [orders, products, dateFilter]);

  const totalPeriodRevenue = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.receita, 0),
    [chartData]
  );
  const totalPeriodProfit = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.lucro, 0),
    [chartData]
  );
  const totalPeriodOrders = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.ordens, 0),
    [chartData]
  );

  // Custom Glassmorphism Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-neutral-800 text-xs flex flex-col gap-1.5 min-w-[140px]">
          <span className="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-neutral-800 pb-1 flex items-center justify-between">
            <span>Data</span>
            <span className="text-slate-900 dark:text-white font-mono">{label}</span>
          </span>
          {activeTab === 'revenue' ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Receita:
                </span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  R$ {payload[0]?.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {payload[1] && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Lucro Est.:
                  </span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    R$ {payload[1]?.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-primary font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Total OS:
                </span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {payload[0]?.value}
                </span>
              </div>
              {payload[1] && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Concluídas:
                  </span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {payload[1]?.value}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden flex flex-col gap-5"
    >
      {/* Chart Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <TrendingUp size={16} />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Desempenho da Assistência
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dateFilter === 'month' ? 'Visão dos últimos 30 dias' : 'Visão dos últimos 7 dias'}
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-neutral-900/80 p-1 rounded-xl border border-slate-200/50 dark:border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'revenue'
                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign size={14} className={activeTab === 'revenue' ? 'text-emerald-500' : ''} />
            <span>Faturamento</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity size={14} className={activeTab === 'orders' ? 'text-primary' : ''} />
            <span>Ordens (Volume)</span>
          </button>
        </div>
      </div>

      {/* Sub-KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50/60 dark:bg-neutral-900/40 rounded-xl border border-slate-100 dark:border-neutral-800/80">
        {activeTab === 'revenue' ? (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total do Período</span>
              <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                R$ {totalPeriodRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lucro Bruto Est.</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                R$ {totalPeriodProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Média Diária</span>
              <span className="text-sm sm:text-base font-black font-mono text-slate-700 dark:text-slate-300">
                R$ {(totalPeriodRevenue / (chartData.length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total de Ordens</span>
              <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                {totalPeriodOrders} OS
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Média Diária</span>
              <span className="text-sm sm:text-base font-black font-mono text-primary">
                {(totalPeriodOrders / (chartData.length || 1)).toFixed(1)} OS/dia
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Taxa Conclusão</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalPeriodOrders > 0
                  ? `${Math.round(
                      (chartData.reduce((acc, c) => acc + c.concluidas, 0) / totalPeriodOrders) * 100
                    )}%`
                  : '100%'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Responsive Recharts Area */}
      <div className="h-56 sm:h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00CCFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00CCFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(val) => (activeTab === 'revenue' ? `R$${val}` : `${val}`)}
            />
            <Tooltip content={<CustomTooltip />} />
            {activeTab === 'revenue' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="ordens"
                  stroke="#00CCFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
                <Area
                  type="monotone"
                  dataKey="concluidas"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
