import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    FileText,
    Smartphone,
    Users,
    Wrench,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
    Area,
    AreaChart
} from 'recharts';
import { OrderStatus } from '../types';

type DateFilter = 'today' | 'week' | 'month' | 'year' | 'custom';

export const Reports: React.FC = () => {
    const { orders, clients, products } = useApp();
    const [dateFilter, setDateFilter] = useState<DateFilter>('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Calcula o range de datas baseado no filtro
    const getDateRange = (): { start: Date; end: Date } => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
            case 'today':
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 7);
                return { start: weekStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return { start: monthStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return { start: yearStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
            case 'custom':
                return {
                    start: startDate ? new Date(startDate + 'T00:00:00') : new Date(0),
                    end: endDate ? new Date(endDate + 'T23:59:59') : new Date()
                };
            default:
                return { start: new Date(0), end: new Date() };
        }
    };

    // Filtra ordens pelo período
    const filteredOrders = useMemo(() => {
        const { start, end } = getDateRange();
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });
    }, [orders, dateFilter, startDate, endDate]);

    // Ordens concluídas (faturamento real)
    const completedOrders = filteredOrders.filter(o => o.status === OrderStatus.COMPLETED);

    // Métricas principais
    const metrics = useMemo(() => {
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
        const totalServices = completedOrders.reduce((sum, o) => sum + o.priceServices, 0);
        const totalParts = completedOrders.reduce((sum, o) => sum + o.priceParts, 0);
        const totalDiscount = completedOrders.reduce((sum, o) => sum + o.discount, 0);
        const avgTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        // Calcula período anterior para comparação
        const { start, end } = getDateRange();
        const periodLength = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - periodLength);
        const prevEnd = new Date(start.getTime());

        const prevOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= prevStart && orderDate < prevEnd && order.status === OrderStatus.COMPLETED;
        });
        const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);

        const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalServices,
            totalParts,
            totalDiscount,
            avgTicket,
            ordersCount: completedOrders.length,
            pendingCount: filteredOrders.filter(o => o.status === OrderStatus.PENDING).length,
            inProgressCount: filteredOrders.filter(o => o.status === OrderStatus.IN_PROGRESS).length,
            revenueChange
        };
    }, [completedOrders, filteredOrders, orders, dateFilter]);

    // Dados para gráfico de faturamento diário/mensal
    const revenueChartData = useMemo(() => {
        const data: { [key: string]: { name: string; faturamento: number; ordens: number } } = {};

        completedOrders.forEach(order => {
            const date = new Date(order.createdAt);
            let key: string;

            if (dateFilter === 'today') {
                key = date.toLocaleTimeString('pt-BR', { hour: '2-digit' }) + 'h';
            } else if (dateFilter === 'week' || dateFilter === 'month') {
                key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            } else {
                key = date.toLocaleDateString('pt-BR', { month: 'short' });
            }

            if (!data[key]) {
                data[key] = { name: key, faturamento: 0, ordens: 0 };
            }
            data[key].faturamento += order.total;
            data[key].ordens += 1;
        });

        return Object.values(data).sort((a, b) => {
            // Ordena por data
            const dateA = a.name.split('/').reverse().join('');
            const dateB = b.name.split('/').reverse().join('');
            return dateA.localeCompare(dateB);
        });
    }, [completedOrders, dateFilter]);

    // Dados para gráfico de status
    const statusChartData = useMemo(() => {
        const statusCount: { [key: string]: number } = {};

        filteredOrders.forEach(order => {
            statusCount[order.status] = (statusCount[order.status] || 0) + 1;
        });

        const statusColors: { [key: string]: string } = {
            [OrderStatus.PENDING]: '#EAB308',
            [OrderStatus.IN_PROGRESS]: '#3B82F6',
            [OrderStatus.WAITING_PARTS]: '#F97316',
            [OrderStatus.COMPLETED]: '#22C55E',
            [OrderStatus.CANCELLED]: '#EF4444'
        };

        const statusLabels: { [key: string]: string } = {
            [OrderStatus.PENDING]: 'Pendente',
            [OrderStatus.IN_PROGRESS]: 'Em Andamento',
            [OrderStatus.WAITING_PARTS]: 'Aguard. Peças',
            [OrderStatus.COMPLETED]: 'Concluído',
            [OrderStatus.CANCELLED]: 'Cancelado'
        };

        return Object.entries(statusCount).map(([status, count]) => ({
            name: statusLabels[status] || status,
            value: count,
            color: statusColors[status] || '#94A3B8'
        }));
    }, [filteredOrders]);

    // Dados para gráfico de aparelhos mais atendidos
    const deviceChartData = useMemo(() => {
        const deviceCount: { [key: string]: number } = {};

        filteredOrders.forEach(order => {
            const device = order.deviceModel.split(' ')[0]; // Pega só a marca/modelo principal
            deviceCount[device] = (deviceCount[device] || 0) + 1;
        });

        return Object.entries(deviceCount)
            .map(([device, count]) => ({ name: device, quantidade: count }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 8); // Top 8
    }, [filteredOrders]);

    // Dados para gráfico de formas de pagamento
    const paymentChartData = useMemo(() => {
        const paymentCount: { [key: string]: { count: number; total: number } } = {};

        completedOrders.forEach(order => {
            const method = order.paymentMethod || 'Não informado';
            if (!paymentCount[method]) {
                paymentCount[method] = { count: 0, total: 0 };
            }
            paymentCount[method].count += 1;
            paymentCount[method].total += order.total;
        });

        const colors = ['#00CCFF', '#22C55E', '#8B5CF6', '#F97316', '#94A3B8'];

        return Object.entries(paymentCount).map(([method, data], idx) => ({
            name: method,
            quantidade: data.count,
            valor: data.total,
            color: colors[idx % colors.length]
        }));
    }, [completedOrders]);

    // Dados para gráfico de tipos de serviço
    const serviceTypeChartData = useMemo(() => {
        const serviceCount: { [key: string]: { count: number; revenue: number } } = {};

        // Palavras-chave para identificar tipos de serviço
        const serviceKeywords: { [key: string]: string[] } = {
            'Troca de Tela': ['tela', 'display', 'lcd', 'touch', 'vidro'],
            'Bateria': ['bateria', 'battery'],
            'Conector de Carga': ['conector', 'carga', 'usb', 'carregador', 'charging'],
            'Alto-falante': ['alto-falante', 'speaker', 'auricular', 'som'],
            'Câmera': ['camera', 'câmera', 'frontal', 'traseira'],
            'Placa / Chip': ['placa', 'chip', 'ic', 'baseband', 'ci'],
            'Software': ['software', 'formatação', 'reset', 'desbloqueio', 'conta'],
            'Microfone': ['microfone', 'mic'],
            'Botões': ['botão', 'power', 'volume', 'home', 'flex'],
            'Outros': []
        };

        filteredOrders.forEach(order => {
            let matched = false;
            const searchText = `${order.issueDescription} ${order.servicePerformed || ''} ${order.serviceType || ''}`.toLowerCase();

            for (const [type, keywords] of Object.entries(serviceKeywords)) {
                if (type === 'Outros') continue;

                for (const keyword of keywords) {
                    if (searchText.includes(keyword)) {
                        if (!serviceCount[type]) {
                            serviceCount[type] = { count: 0, revenue: 0 };
                        }
                        serviceCount[type].count += 1;
                        serviceCount[type].revenue += order.total;
                        matched = true;
                        break;
                    }
                }
                if (matched) break;
            }

            if (!matched) {
                if (!serviceCount['Outros']) {
                    serviceCount['Outros'] = { count: 0, revenue: 0 };
                }
                serviceCount['Outros'].count += 1;
                serviceCount['Outros'].revenue += order.total;
            }
        });

        const colors = ['#00CCFF', '#22C55E', '#8B5CF6', '#F97316', '#EAB308', '#EF4444', '#EC4899', '#14B8A6', '#6366F1', '#94A3B8'];

        return Object.entries(serviceCount)
            .map(([type, data], idx) => ({
                name: type,
                quantidade: data.count,
                faturamento: data.revenue,
                color: colors[idx % colors.length]
            }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 10);
    }, [filteredOrders]);

    // Exportar para CSV
    const handleExportCSV = () => {
        const headers = ['ID', 'Data', 'Cliente', 'Aparelho', 'Status', 'Serviços', 'Peças', 'Desconto', 'Total', 'Pagamento'];
        const rows = filteredOrders.map(order => {
            const client = clients.find(c => c.id === order.clientId);
            return [
                order.displayId || order.id.slice(0, 8),
                new Date(order.createdAt).toLocaleDateString('pt-BR'),
                client?.name || 'Desconhecido',
                order.deviceModel,
                order.status,
                order.priceServices.toFixed(2),
                order.priceParts.toFixed(2),
                order.discount.toFixed(2),
                order.total.toFixed(2),
                order.paymentMethod || '-'
            ].join(';');
        });

        const csv = [headers.join(';'), ...rows].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const COLORS = ['#00CCFF', '#22C55E', '#EAB308', '#F97316', '#EF4444'];

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="text-primary" size={32} />
                        Relatórios
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Análise de faturamento e desempenho</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filtro de período */}
                    <div className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-xl p-1">
                        {[
                            { value: 'today', label: 'Hoje' },
                            { value: 'week', label: '7 dias' },
                            { value: 'month', label: 'Mês' },
                            { value: 'year', label: 'Ano' },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setDateFilter(option.value as DateFilter)}
                                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${dateFilter === option.value
                                    ? 'bg-primary text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Exportar */}
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all"
                    >
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Filtro customizado */}
            {dateFilter === 'custom' && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800">
                    <Calendar size={20} className="text-slate-400" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm"
                    />
                    <span className="text-slate-400">até</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm"
                    />
                </div>
            )}

            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Faturamento Total */}
                <div className="bg-gradient-to-br from-primary to-cyan-600 rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <DollarSign size={20} />
                        </div>
                        {metrics.revenueChange !== 0 && (
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${metrics.revenueChange > 0 ? 'bg-green-500/30' : 'bg-red-500/30'
                                }`}>
                                {metrics.revenueChange > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(metrics.revenueChange).toFixed(0)}%
                            </div>
                        )}
                    </div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Faturamento</p>
                    <p className="text-2xl md:text-3xl font-black">R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Ticket Médio */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Ticket Médio</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">R$ {metrics.avgTicket.toFixed(2)}</p>
                </div>

                {/* Ordens Concluídas */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                            <FileText size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Concluídas</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{metrics.ordersCount}</p>
                </div>

                {/* Em Andamento */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <Wrench size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Em Andamento</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{metrics.inProgressCount + metrics.pendingCount}</p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Gráfico de Faturamento */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-primary" size={20} />
                        Faturamento por Período
                    </h3>
                    <div className="h-[300px]">
                        {revenueChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueChartData}>
                                    <defs>
                                        <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00CCFF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00CCFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `R$${v}`} />
                                    <Tooltip
                                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="faturamento" stroke="#00CCFF" strokeWidth={3} fill="url(#colorFaturamento)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Nenhum dado para o período selecionado
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico de Status */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <FileText className="text-primary" size={20} />
                        Status das Ordens
                    </h3>
                    <div className="h-[300px]">
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number, name: string) => [value, name]}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Nenhum dado para o período selecionado
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico de Aparelhos */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Smartphone className="text-primary" size={20} />
                        Aparelhos Mais Atendidos
                    </h3>
                    <div className="h-[300px]">
                        {deviceChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deviceChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                                    <Tooltip
                                        formatter={(value: number) => [value, 'Quantidade']}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar dataKey="quantidade" fill="#00CCFF" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Nenhum dado para o período selecionado
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico de Formas de Pagamento */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <DollarSign className="text-primary" size={20} />
                        Formas de Pagamento
                    </h3>
                    <div className="h-[300px]">
                        {paymentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            name === 'valor' ? `R$ ${value.toFixed(2)}` : value,
                                            name === 'valor' ? 'Total' : 'Quantidade'
                                        ]}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="quantidade" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Nenhum dado para o período selecionado
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gráfico de Tipos de Serviço - Full Width */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 mb-8">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Wrench className="text-primary" size={20} />
                    Tipos de Serviço Mais Realizados
                </h3>
                <div className="h-[350px]">
                    {serviceTypeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={serviceTypeChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'faturamento' ? `R$ ${value.toFixed(2)}` : value,
                                        name === 'faturamento' ? 'Faturamento' : 'Quantidade'
                                    ]}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="quantidade" fill="#00CCFF" radius={[0, 4, 4, 0]} name="Quantidade" />
                                <Bar dataKey="faturamento" fill="#22C55E" radius={[0, 4, 4, 0]} name="Faturamento (R$)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            Nenhum dado para o período selecionado
                        </div>
                    )}
                </div>
            </div>

            {/* Detalhamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Serviços */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600">
                            <Wrench size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mão de Obra</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                R$ {metrics.totalServices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${metrics.totalRevenue > 0 ? (metrics.totalServices / metrics.totalRevenue) * 100 : 0}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        {metrics.totalRevenue > 0 ? ((metrics.totalServices / metrics.totalRevenue) * 100).toFixed(1) : 0}% do faturamento
                    </p>
                </div>

                {/* Peças */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Peças</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                R$ {metrics.totalParts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${metrics.totalRevenue > 0 ? (metrics.totalParts / metrics.totalRevenue) * 100 : 0}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        {metrics.totalRevenue > 0 ? ((metrics.totalParts / metrics.totalRevenue) * 100).toFixed(1) : 0}% do faturamento
                    </p>
                </div>

                {/* Descontos */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descontos</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                R$ {metrics.totalDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(metrics.totalRevenue + metrics.totalDiscount) > 0 ? (metrics.totalDiscount / (metrics.totalRevenue + metrics.totalDiscount)) * 100 : 0}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        {filteredOrders.length > 0 ? (completedOrders.filter(o => o.discount > 0).length / completedOrders.length * 100).toFixed(0) : 0}% das ordens
                    </p>
                </div>
            </div>
        </div>
    );
};
