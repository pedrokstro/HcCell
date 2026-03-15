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
    Package,
    ChevronDown
} from 'lucide-react';
import { CustomDropdown } from '../components/CustomDropdown';
import { DatePicker } from '../components/DatePicker';
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

        const totalCosts = completedOrders.reduce((acc, order) => {
            const partsCost = (order.selectedProducts || []).reduce((pAcc, item) => {
                // Tenta usar o custo salvo no item (convertendo para garantias)
                const savedCost = item.cost !== undefined && item.cost !== null ? Number(item.cost) : undefined;

                if (savedCost !== undefined && !isNaN(savedCost)) {
                    return pAcc + (savedCost * item.quantity);
                }
                // Fallback: busca no cadastro do produto (para ordens antigas)
                const product = products.find(p => p.id === item.productId);
                return pAcc + ((product?.priceCost || 0) * item.quantity);
            }, 0);
            return acc + Number(partsCost);
        }, 0);

        const netProfit = totalRevenue - totalCosts;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCosts,
            netProfit,
            profitMargin,
            totalServices,
            totalParts,
            totalDiscount,
            avgTicket,
            ordersCount: completedOrders.length,
            pendingCount: filteredOrders.filter(o => o.status === OrderStatus.PENDING).length,
            inProgressCount: filteredOrders.filter(o => o.status === OrderStatus.IN_PROGRESS).length,
            revenueChange
        };
    }, [completedOrders, filteredOrders, orders, dateFilter, products]);

    // Dados para gráfico de faturamento diário/mensal
    const revenueChartData = useMemo(() => {
        const data: { [key: string]: { name: string; faturamento: number; ordens: number; lucro: number } } = {};

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
                data[key] = { name: key, faturamento: 0, ordens: 0, lucro: 0 };
            }
            data[key].faturamento += order.total;
            data[key].ordens += 1;

            // Calc lucro for chart
            const orderCost = (order.selectedProducts || []).reduce((acc, item) => {
                const savedCost = item.cost !== undefined && item.cost !== null ? Number(item.cost) : undefined;
                if (savedCost !== undefined && !isNaN(savedCost)) {
                    return acc + (savedCost * item.quantity);
                }
                const product = products.find(p => p.id === item.productId);
                return acc + ((product?.priceCost || 0) * item.quantity);
            }, 0);
            data[key].lucro = (data[key].lucro || 0) + (order.total - orderCost);
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
            [OrderStatus.WAITING_WITHDRAWAL]: '#F97316',
            [OrderStatus.COMPLETED]: '#22C55E',
            [OrderStatus.CANCELLED]: '#EF4444'
        };

        const statusLabels: { [key: string]: string } = {
            [OrderStatus.PENDING]: 'Pendente',
            [OrderStatus.IN_PROGRESS]: 'Em Andamento',
            [OrderStatus.WAITING_WITHDRAWAL]: 'Retirada',
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

    // Exportar para PDF
    const handleExportPDF = () => {
        const frame = document.createElement('iframe');
        frame.style.position = 'absolute';
        frame.style.top = '-9999px';
        document.body.appendChild(frame);

        const frameDoc = frame.contentWindow?.document;
        if (!frameDoc) return;

        const title = `Relatório de Vendas - ${dateFilter === 'custom' ? 'Período Personalizado' :
            dateFilter === 'today' ? 'Hoje' :
                dateFilter === 'week' ? 'Últimos 7 dias' :
                    dateFilter === 'month' ? 'Este Mês' : 'Este Ano'}`;

        let rows = '';
        filteredOrders.forEach(order => {
            const client = clients.find(c => c.id === order.clientId);
            rows += `
                <tr>
                    <td>${order.displayId || order.id.slice(0, 8)}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>${client?.name || 'Desconhecido'}</td>
                    <td>${order.deviceModel}</td>
                    <td>
                        <span class="status-badge ${order.status === 'Concluído' ? 'status-green' : order.status === 'Cancelado' ? 'status-red' : 'status-gray'}">
                            ${order.status}
                        </span>
                    </td>
                    <td class="right">R$ ${order.total.toFixed(2)}</td>
                </tr>
            `;
        });

        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}/${y}`;
        };

        const periodText = dateFilter === 'custom' && startDate && endDate
            ? `${formatDate(startDate)} até ${formatDate(endDate)}`
            : new Date().toLocaleDateString('pt-BR');

        frameDoc.write(`
            <html>
                <head>
                    <title>Relatório HCCELL</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        h1 { margin-bottom: 5px; color: #1e293b; }
                        p.subtitle { color: #64748b; margin-bottom: 30px; font-size: 14px; }
                        .metrics { display: flex; gap: 20px; margin-bottom: 40px; }
                        .metric-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; flex: 1; background: #fff; }
                        .metric-title { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 8px; }
                        .metric-value { font-size: 24px; font-weight: 900; color: #0f172a; }
                        
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; text-align: left; }
                        th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                        .right { text-align: right; }
                        
                        .status-badge { padding: 4px 8px; border-radius: 99px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
                        .status-green { background: #dcfce7; color: #166534; }
                        .status-red { background: #fee2e2; color: #991b1b; }
                        .status-gray { background: #f1f5f9; color: #475569; }

                        .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <p class="subtitle">Gerado em ${new Date().toLocaleString('pt-BR')} • Período: ${periodText}</p>
                    
                    <div class="metrics">
                        <div class="metric-card">
                            <div class="metric-title">Faturamento</div>
                            <div class="metric-value">R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Custos (Peças)</div>
                            <div class="metric-value" style="color: #ef4444;">- R$ ${metrics.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Lucro Líquido</div>
                            <div class="metric-value" style="color: #22c55e;">R$ ${metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">Concluídas</div>
                            <div class="metric-value">${metrics.ordersCount}</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>OS</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Aparelho</th>
                                <th>Status</th>
                                <th class="right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                        <tfoot>
                             <tr>
                                <td colspan="5" class="right" style="padding-top: 10px;"><strong>FATURAMENTO TOTAL</strong></td>
                                <td class="right" style="padding-top: 10px;"><strong>R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                             </tr>
                             <tr>
                                <td colspan="5" class="right"><strong>CUSTOS TOTAIS (PEÇAS)</strong></td>
                                <td class="right" style="color: #ef4444;"><strong>- R$ ${metrics.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                             </tr>
                             <tr>
                                <td colspan="5" class="right" style="padding-top: 10px; font-size: 14px; border-top: 2px solid #e2e8f0;"><strong>LUCRO LÍQUIDO</strong></td>
                                <td class="right" style="padding-top: 10px; font-size: 16px; color: #22c55e; border-top: 2px solid #e2e8f0;"><strong>R$ ${metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                             </tr>
                        </tfoot>
                    </table>
                    
                    <div class="footer">
                        HCCELL Assistência Técnica • Sistema de Gestão
                    </div>
                </body>
            </html>
        `);
        frameDoc.close();
        setTimeout(() => {
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
            setTimeout(() => document.body.removeChild(frame), 1000);
        }, 500);
    };

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
                    {/* Period Filter Dropdown */}
                    <CustomDropdown
                        label="FILTRAR POR PERÍODO"
                        options={[
                            { value: 'today', label: 'Hoje' },
                            { value: 'week', label: 'Últimos 7 dias' },
                            { value: 'month', label: 'Este Mês' },
                            { value: 'year', label: 'Este Ano' },
                            { value: 'custom', label: 'Personalizado' },
                        ]}
                        selectedValue={dateFilter}
                        onSelect={(val) => setDateFilter(val as DateFilter)}
                        icon={<Calendar size={18} />}
                        className="w-full sm:w-64"
                    />

                    {/* Exportar */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
                            title="Exportar PDF"
                        >
                            <FileText size={16} />
                            PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all"
                            title="Exportar CSV"
                        >
                            <Download size={16} />
                            CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtro customizado */}
            {dateFilter === 'custom' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-6 bg-white dark:bg-surface-dark rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
                    <DatePicker 
                        label="Data Inicial" 
                        value={startDate} 
                        onChange={setStartDate} 
                    />
                    <div className="hidden sm:block text-slate-300 dark:text-neutral-700 font-bold mt-4">até</div>
                    <DatePicker 
                        label="Data Final" 
                        value={endDate} 
                        onChange={setEndDate} 
                    />
                </div>
            )}

            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
                    <p className="text-xl lg:text-2xl font-black">R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                {/* Lucro Líquido */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                            <TrendingUp size={20} />
                        </div>
                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-lg text-[10px] font-bold text-green-700 dark:text-green-400">
                            {metrics.profitMargin.toFixed(0)}% Margem
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Lucro Líquido</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">R$ {metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                {/* Custos */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Custos (Peças)</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">R$ {metrics.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                {/* Ticket Médio */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Ticket Médio</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">R$ {metrics.avgTicket.toFixed(0)}</p>
                </div>

                {/* Ordens Concluídas */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <FileText size={20} />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Concluídas</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{metrics.ordersCount}</p>
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
                                    <Area type="monotone" dataKey="faturamento" stroke="#00CCFF" strokeWidth={3} fill="url(#colorFaturamento)" name="Faturamento" />
                                    <Area type="monotone" dataKey="lucro" stroke="#22C55E" strokeWidth={3} fillOpacity={0} name="Lucro" />
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
