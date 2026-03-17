import React from 'react';
import { useApp } from '../../store';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileText, Filter, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, TrendingUp, MessageCircle, Edit2 } from 'lucide-react';
import { OrderStatus } from '../../types';
import { CustomDropdown } from '../../components/CustomDropdown';
import { DatePicker } from '../../components/DatePicker';


export const OrdersList: React.FC = () => {
    const { orders, clients } = useApp();
    const navigate = useNavigate();

    const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
            case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            case OrderStatus.WAITING_WITHDRAWAL: return 'bg-orange-100 text-orange-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = React.useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = React.useState<string>('');
    const [dateFilter, setDateFilter] = React.useState<string>('');
    const [startDate, setStartDate] = React.useState<string>('');
    const [endDate, setEndDate] = React.useState<string>('');
    const [isStatusSheetOpen, setIsStatusSheetOpen] = React.useState(false);
    const [isDateSheetOpen, setIsDateSheetOpen] = React.useState(false);

    const statusOptions = [
        { value: '', label: 'Todos os Status', icon: <Filter size={18} /> },
        { value: OrderStatus.PENDING, label: 'Pendente', icon: <Clock size={18} className="text-yellow-500" /> },
        { value: OrderStatus.IN_PROGRESS, label: 'Em Andamento', icon: <TrendingUp size={18} className="text-blue-500" /> },
        { value: OrderStatus.WAITING_WITHDRAWAL, label: 'Retirada', icon: <Clock size={18} className="text-orange-500" /> },
        { value: OrderStatus.COMPLETED, label: 'Concluído', icon: <CheckCircle size={18} className="text-green-500" /> },
        { value: OrderStatus.CANCELLED, label: 'Cancelado', icon: <XCircle size={18} className="text-red-500" /> }
    ];

    const dateOptions = [
        { value: '', label: 'Todo o Período', icon: <Filter size={18} /> },
        { value: 'today', label: 'Hoje', icon: <Clock size={18} /> },
        { value: 'week', label: 'Esta Semana', icon: <Calendar size={18} /> },
        { value: 'month', label: 'Este Mês', icon: <Calendar size={18} /> },
        { value: 'custom', label: 'Personalizado', icon: <Search size={18} /> }
    ];

    const currentStatusLabel = statusOptions.find(o => o.value === statusFilter)?.label || 'Status';
    const currentDateLabel = dateOptions.find(o => o.value === dateFilter)?.label || 'Data';


    // Função auxiliar para criar data no horário local a partir de string YYYY-MM-DD
    const parseLocalDate = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // Função para calcular datas baseado no filtro selecionado
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
                const customEnd = endDate ? new Date(parseLocalDate(endDate).getTime() + 24 * 60 * 60 * 1000) : null;
                return { start: customStart, end: customEnd };
            default:
                return { start: null, end: null };
        }
    };

    const filteredOrders = orders.filter(order => {
        const client = clients.find(c => c.id === order.clientId);
        const clientName = (client?.name || 'Unknown').toLowerCase();
        const clientCpf = (client?.cpf || '').toLowerCase();
        const clientPhone = (client?.phone || '').toLowerCase();
        const displayId = (order.displayId || order.id).toLowerCase();
        const device = order.deviceModel.toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch = clientName.includes(query) ||
            clientCpf.includes(query) ||
            clientPhone.includes(query) ||
            displayId.includes(query) ||
            device.includes(query);

        const matchesStatus = statusFilter ? order.status === statusFilter : true;

        // Filtro por data
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
    });

    const handleWhatsApp = (e: React.MouseEvent, order: any) => {
        e.preventDefault();
        e.stopPropagation();
        const client = clients.find(c => c.id === order.clientId);
        if (!client?.phone) return;

        let message = `Olá ${client.name}, aqui é da HcCell Assistência Técnica. Sobre seu aparelho ${order.deviceModel}: `;
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
        <>
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ordens de Serviço</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie e acompanhe todos os reparos e serviços.</p>
                    </div>
                    <Link to="/orders/new" className="hidden sm:flex w-full sm:w-auto justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all whitespace-nowrap">
                        <Plus size={20} />
                        Nova Ordem
                    </Link>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm flex flex-col gap-4">
                    {/* Linha 1: Busca */}
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-neutral-800 rounded-lg bg-slate-50 dark:bg-neutral-900 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Buscar por OS, Cliente ou Aparelho..."
                        />
                    </div>

                    {/* Filtros de Status e Data */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <CustomDropdown
                            label="FILTRAR POR STATUS"
                            options={statusOptions}
                            selectedValue={statusFilter}
                            onSelect={setStatusFilter}
                            icon={<Filter size={18} />}
                            className="w-full sm:w-64"
                        />

                        <CustomDropdown
                            label="FILTRAR POR PERÍODO"
                            options={dateOptions}
                            selectedValue={dateFilter}
                            onSelect={(val) => {
                                setDateFilter(val);
                                if (val !== 'custom') {
                                    setStartDate('');
                                    setEndDate('');
                                }
                            }}
                            icon={<Calendar size={18} />}
                            className="w-full sm:w-64"
                        />
                    </div>

                        {dateFilter === 'custom' && (
                            <div className="flex flex-col sm:flex-row items-center gap-2 animate-fade-in w-full sm:w-auto">
                                <div className="w-full sm:w-48">
                                    <DatePicker 
                                        value={startDate} 
                                        onChange={setStartDate} 
                                        placeholder="De"
                                    />
                                </div>
                                <span className="text-slate-400 text-[10px] uppercase font-bold px-1">até</span>
                                <div className="w-full sm:w-48">
                                    <DatePicker 
                                        value={endDate} 
                                        onChange={setEndDate} 
                                        placeholder="Até"
                                    />
                                </div>
                            </div>
                        )}

                        {(statusFilter || dateFilter || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('');
                                    setDateFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors whitespace-nowrap self-start sm:self-center px-1"
                            >
                                Limpar filtros
                            </button>
                        )}

                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-1">
                            Exibindo <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredOrders.length}</span> de <span className="font-semibold text-slate-700 dark:text-slate-300">{orders.length}</span> ordens
                        </div>
                    </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden animate-fade-in-up">
                    <div className="">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-neutral-800">
                            <thead className="bg-slate-50 dark:bg-neutral-900/50">
                                <tr>
                                    <th className="px-3 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Cliente</th>
                                    <th className="px-3 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Aparelho & Problema</th>
                                    <th className="px-3 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-3 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Data</th>
                                    <th className="px-3 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Valor</th>
                                    <th className="px-3 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-surface-dark divide-y divide-slate-200 dark:divide-neutral-800">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mr-3 shrink-0">
                                                        {getClientName(order.clientId).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{getClientName(order.clientId)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                                                        {order.serviceType === 'VENDA_DIRETA' ? 'Venda de Produto' : order.deviceModel}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1" title={order.serviceType === 'VENDA_DIRETA' ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ')) : order.issueDescription}>
                                                        {order.serviceType === 'VENDA_DIRETA'
                                                            ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'Produtos Diversos')
                                                            : order.issueDescription}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col">
                                                    <span>{new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                                                    <span className="opacity-60 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={(e) => handleWhatsApp(e, order)}
                                                        className="size-9 flex items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all active:scale-95 border border-green-100 dark:border-green-900/30 shadow-sm"
                                                        title="WhatsApp"
                                                    >
                                                        <img src="/whatsapp.png" alt="WhatsApp" className="size-5 object-contain" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            navigate(`/orders/${order.id}/edit`);
                                                        }}
                                                        className="size-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all active:scale-95 border border-blue-100 dark:border-blue-900/30 shadow-sm"
                                                        title="Editar Ordem"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <Link 
                                                        to={`/orders/${order.id}`} 
                                                        className="size-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-neutral-800 text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all active:scale-95 border border-slate-100 dark:border-neutral-700 shadow-sm"
                                                        title="Ver Detalhes"
                                                    >
                                                        <FileText size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center justify-center opacity-70">
                                                <Search size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                                                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Nenhuma ordem encontrada</p>
                                                <p className="text-sm text-slate-400">Tente ajustar seus filtros de busca.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => {
                            const MotionLink = motion(Link);
                            return (
                                <MotionLink
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.97 }}
                                    to={`/orders/${order.id}`}
                                    key={order.id}
                                    className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm transition-all"
                                >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 block">#{order.displayId || order.id.slice(0, 8)}</span>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {order.serviceType === 'VENDA_DIRETA' ? 'Venda de Produto' : order.deviceModel}
                                        </h3>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 bg-slate-50 dark:bg-neutral-900 p-2 rounded-lg border border-slate-100 dark:border-neutral-800 italic">
                                    "{order.serviceType === 'VENDA_DIRETA'
                                        ? (order.selectedProducts?.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'Produtos Diversos')
                                        : order.issueDescription}"
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {getClientName(order.clientId).substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-900 dark:text-white">{getClientName(order.clientId)}</span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg">
                                        R$ {order.total.toFixed(2)}
                                    </span>
                                </div>

                                {/* Quick Actions Row */}
                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800">
                                    <button
                                        onClick={(e) => handleWhatsApp(e, order)}
                                        className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-bold text-xs transition-all active:scale-95 border border-green-100 dark:border-green-900/30"
                                    >
                                        <img src="/whatsapp.png" alt="WhatsApp" className="size-5 object-contain" />
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            navigate(`/orders/${order.id}`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs transition-all active:scale-95 border border-blue-100 dark:border-blue-900/30"
                                    >
                                        <FileText size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            navigate(`/orders/${order.id}/edit`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs transition-all active:scale-95 border border-slate-100 dark:border-neutral-700"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </MotionLink>
                        )
                    })
                    ) : (
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 border-dashed p-8 text-center">
                            <div className="flex flex-col items-center justify-center opacity-70">
                                <Search size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Nenhuma ordem</p>
                                <p className="text-sm text-slate-400">Tente buscar por outro termo.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FAB Mobile removed - integrated into MobileNav */}
        </>
    );
};