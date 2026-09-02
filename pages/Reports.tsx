import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Smartphone,
  Wrench,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  PieChart as PieIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet
} from 'lucide-react';
import { CustomDropdown } from '../components/CustomDropdown';
import { DatePicker } from '../components/DatePicker';
import { DashboardChart } from '../components/DashboardChart';
import { AnimatedNumber } from '../components/AnimatedNumber';
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
  Cell
} from 'recharts';
import { OrderStatus } from '../types';

type DateFilter = 'today' | 'week' | 'month' | 'year' | 'custom';
const ITEMS_PER_PAGE = 10;

export const Reports: React.FC = () => {
  const { orders, clients, products } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Date Range calculation
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
          end: endDate ? new Date(endDate + 'T23:59:59') : new Date(),
        };
      default:
        return { start: new Date(0), end: new Date() };
    }
  };

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, dateFilter, startDate, endDate]);

  const completedOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === OrderStatus.COMPLETED),
    [filteredOrders]
  );

  // Core Key Performance Indicators
  const metrics = useMemo(() => {
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalServices = completedOrders.reduce((sum, o) => sum + o.priceServices, 0);
    const totalParts = completedOrders.reduce((sum, o) => sum + o.priceParts, 0);
    const avgTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Previous period for comparison
    const { start, end } = getDateRange();
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = new Date(start.getTime());

    const prevOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate >= prevStart && orderDate < prevEnd && order.status === OrderStatus.COMPLETED
      );
    });
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueChange =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const totalCosts = completedOrders.reduce((acc, order) => {
      const partsCost = (order.selectedProducts || []).reduce((pAcc, item) => {
        const savedCost =
          item.cost !== undefined && item.cost !== null ? Number(item.cost) : undefined;
        if (savedCost !== undefined && !isNaN(savedCost)) {
          return pAcc + savedCost * item.quantity;
        }
        const product = products.find((p) => p.id === item.productId);
        return pAcc + (product?.priceCost || 0) * item.quantity;
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
      avgTicket,
      ordersCount: completedOrders.length,
      revenueChange,
    };
  }, [completedOrders, orders, dateFilter, products]);

  // Essential Chart 1: Service Types Frequency (Bancada Técnica)
  const serviceTypeChartData = useMemo(() => {
    const serviceCount: { [key: string]: { count: number; revenue: number } } = {};

    const serviceKeywords: { [key: string]: string[] } = {
      'Troca de Tela': ['tela', 'display', 'lcd', 'touch', 'vidro'],
      Bateria: ['bateria', 'battery'],
      'Conector de Carga': ['conector', 'carga', 'usb', 'carregador', 'charging'],
      'Alto-falante': ['alto-falante', 'speaker', 'auricular', 'som'],
      Câmera: ['camera', 'câmera', 'frontal', 'traseira'],
      'Placa / Chip': ['placa', 'chip', 'ic', 'baseband', 'ci'],
      Software: ['software', 'formatação', 'reset', 'desbloqueio', 'conta'],
      Microfone: ['microfone', 'mic'],
      Outros: [],
    };

    filteredOrders.forEach((order) => {
      let matched = false;
      const searchText = `${order.issueDescription} ${order.servicePerformed || ''} ${order.serviceType || ''
        }`.toLowerCase();

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

    const colors = [
      '#00CCFF',
      '#10b981',
      '#8b5cf6',
      '#f97316',
      '#eab308',
      '#ef4444',
      '#ec4899',
      '#14b8a6',
    ];

    return Object.entries(serviceCount)
      .map(([type, data], idx) => ({
        name: type,
        quantidade: data.count,
        faturamento: data.revenue,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [filteredOrders]);

  // Essential Chart 2: Status Breakdown (Production Funnel)
  const statusChartData = useMemo(() => {
    const statusCount: { [key: string]: number } = {};

    filteredOrders.forEach((order) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    const statusColors: { [key: string]: string } = {
      [OrderStatus.PENDING]: '#f59e0b',
      [OrderStatus.IN_PROGRESS]: '#0284c7',
      [OrderStatus.WAITING_WITHDRAWAL]: '#06b6d4',
      [OrderStatus.COMPLETED]: '#10b981',
      [OrderStatus.CANCELLED]: '#f43f5e',
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status] || '#94a3b8',
    }));
  }, [filteredOrders]);

  // Essential Chart 3: Top Devices Repaired
  const deviceChartData = useMemo(() => {
    const deviceCount: { [key: string]: number } = {};

    filteredOrders.forEach((order) => {
      const device = order.deviceModel.split(' ')[0] || 'Geral';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });

    return Object.entries(deviceCount)
      .map(([device, count]) => ({ name: device, quantidade: count }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);
  }, [filteredOrders]);

  // Essential Chart 4: Formas de Pagamento (Receita R$ & Quantidade de OSs)
  const paymentChartData = useMemo(() => {
    const paymentCount: { [key: string]: { count: number; revenue: number } } = {};

    completedOrders.forEach((order) => {
      if (order.payments && order.payments.length > 0) {
        order.payments.forEach((p) => {
          const method = p.method || 'Não informado';
          if (!paymentCount[method]) {
            paymentCount[method] = { count: 0, revenue: 0 };
          }
          paymentCount[method].count += 1;
          paymentCount[method].revenue += p.amount || 0;
        });
      } else {
        const method = order.paymentMethod || 'Não informado';
        if (!paymentCount[method]) {
          paymentCount[method] = { count: 0, revenue: 0 };
        }
        paymentCount[method].count += 1;
        paymentCount[method].revenue += order.total || 0;
      }
    });

    const paymentColors: { [key: string]: string } = {
      PIX: '#10b981',
      'Cartão de Crédito': '#00CCFF',
      'Cartão de Débito': '#8b5cf6',
      Dinheiro: '#f59e0b',
      Múltiplo: '#ec4899',
      'Não informado': '#94a3b8',
    };

    return Object.entries(paymentCount)
      .map(([method, data]) => ({
        name: method,
        quantidade: data.count,
        receita: data.revenue,
        color: paymentColors[method] || '#06b6d4',
      }))
      .sort((a, b) => b.receita - a.receita);
  }, [completedOrders]);

  // Total Revenue for Payment Percentage calculation
  const totalPaymentRevenue = useMemo(
    () => paymentChartData.reduce((acc, curr) => acc + curr.receita, 0),
    [paymentChartData]
  );

  // Pagination for Detailed Orders Table
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // High-Contrast Glass Tooltip Configuration for Recharts
  const tooltipStyleProps = {
    contentStyle: {
      backgroundColor: '#0f172a',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
      padding: '8px 12px',
    },
    itemStyle: {
      color: '#f8fafc',
      fontSize: '12px',
      fontWeight: 700,
    },
    labelStyle: {
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: 800,
      marginBottom: '2px',
    },
  };

  // Fintech Grade Executive PDF Export Function
  const handleExportPDF = () => {
    const frame = document.createElement('iframe');
    frame.style.position = 'absolute';
    frame.style.top = '-9999px';
    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow?.document;
    if (!frameDoc) return;

    const logoUrl = `${window.location.origin}/logo-full.png`;
    const reportHash = `HCCELL-FINTECH-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const nowFormatted = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const periodText =
      dateFilter === 'custom'
        ? `Personalizado (${startDate || 'Início'} até ${endDate || 'Hoje'})`
        : dateFilter === 'today'
          ? 'Hoje'
          : dateFilter === 'week'
            ? 'Últimos 7 Dias'
            : dateFilter === 'month'
              ? 'Este Mês'
              : 'Este Ano';

    // Payment rows HTML
    let paymentRowsHtml = '';
    paymentChartData.forEach((item) => {
      const share =
        totalPaymentRevenue > 0 ? ((item.receita / totalPaymentRevenue) * 100).toFixed(1) : '0';
      paymentRowsHtml += `
        <tr>
          <td style="font-weight: 700; color: #1e293b;">${item.name}</td>
          <td style="text-align: center; font-weight: 600; color: #475569;">${item.quantidade} OS</td>
          <td style="text-align: right; font-weight: 700; font-family: monospace; color: #0f172a;">R$ ${item.receita.toLocaleString(
        'pt-BR',
        { minimumFractionDigits: 2 }
      )}</td>
          <td style="text-align: right; font-weight: 800; color: #0284c7;">${share}%</td>
        </tr>
      `;
    });

    // Top Service rows HTML
    let serviceRowsHtml = '';
    serviceTypeChartData.forEach((item) => {
      serviceRowsHtml += `
        <tr>
          <td style="font-weight: 700; color: #1e293b;">${item.name}</td>
          <td style="text-align: center; font-weight: 600; color: #475569;">${item.quantidade} ocorrência(s)</td>
          <td style="text-align: right; font-weight: 700; font-family: monospace; color: #0f172a;">R$ ${item.faturamento.toLocaleString(
        'pt-BR',
        { minimumFractionDigits: 2 }
      )}</td>
        </tr>
      `;
    });

    // Orders rows HTML
    let ordersRowsHtml = '';
    filteredOrders.forEach((order) => {
      const client = clients.find((c) => c.id === order.clientId);
      ordersRowsHtml += `
        <tr>
          <td style="font-family: monospace; font-weight: 800; color: #0284c7;">#${order.displayId || order.id.slice(0, 8)
        }</td>
          <td style="color: #475569;">${new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
          <td style="font-weight: 700; color: #0f172a;">${client?.name || 'Cliente Geral'}</td>
          <td style="color: #334155;">${order.deviceModel}</td>
          <td>
            <span style="padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; ${order.status === OrderStatus.COMPLETED
          ? 'background: #dcfce7; color: #15803d;'
          : order.status === OrderStatus.CANCELLED
            ? 'background: #ffe4e6; color: #be123c;'
            : 'background: #f1f5f9; color: #334155;'
        }">
              ${order.status}
            </span>
          </td>
          <td style="text-align: right; font-weight: 900; font-family: monospace; color: #0f172a;">R$ ${order.total.toLocaleString(
          'pt-BR',
          { minimumFractionDigits: 2 }
        )}</td>
        </tr>
      `;
    });

    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Relatório Financeiro & Operacional - HcCell</title>
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #ffffff; font-size: 11px; line-height: 1.4; }
            .header-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
            .logo-container { display: flex; align-items: center; gap: 14px; }
            .logo-img { height: 44px; object-fit: contain; }
            .company-info h2 { margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
            .company-info p { margin: 2px 0 0 0; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .doc-meta { text-align: right; }
            .badge-fintech { display: inline-block; padding: 4px 10px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 900; text-transform: uppercase; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 4px; }
            .doc-meta p { margin: 2px 0 0 0; font-size: 10px; color: #64748b; font-weight: 600; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
            .kpi-title { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .kpi-val { font-size: 16px; font-weight: 900; font-family: 'Courier New', monospace; color: #0f172a; margin-top: 4px; }
            .kpi-sub { font-size: 9px; font-weight: 700; margin-top: 2px; }
            .text-emerald { color: #16a34a; }
            .text-cyan { color: #0284c7; }
            .text-rose { color: #e11d48; }
            .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-left: 3px solid #0284c7; padding-left: 8px; margin: 20px 0 10px 0; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
            th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 9px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
            tr:nth-child(even) td { background: #fafafa; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8; font-weight: 600; }
            .hash-box { font-family: monospace; font-weight: 700; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div class="logo-container">
              <img src="${logoUrl}" alt="HcCell Logo" class="logo-img" onerror="this.style.display='none'" />
              <div class="company-info">
                <h2>HcCell Assistência Técnica</h2>
                <p>Relatório Consolidado de Desempenho & Finanças</p>
              </div>
            </div>
            <div class="doc-meta">
              <span class="badge-fintech">Fintech Executive Report</span>
              <p>Período: <strong>${periodText}</strong></p>
              <p>Gerado em: <strong>${nowFormatted}</strong></p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Faturamento Bruto</div>
              <div class="kpi-val">R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="kpi-sub text-emerald">Receita Total</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Lucro Líquido Est.</div>
              <div class="kpi-val text-emerald">R$ ${metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="kpi-sub text-cyan">${metrics.profitMargin.toFixed(1)}% Margem Operacional</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Custos de Insumos</div>
              <div class="kpi-val">R$ ${metrics.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="kpi-sub text-rose">Peças & Substitutos</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Ticket Médio / OS</div>
              <div class="kpi-val">R$ ${metrics.avgTicket.toFixed(2)}</div>
              <div class="kpi-sub text-cyan">${metrics.ordersCount} Ordens Concluídas</div>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <div class="section-title">Detalhamento por Meios de Pagamento</div>
              <table>
                <thead>
                  <tr>
                    <th>Meio</th>
                    <th style="text-align: center;">Ordens</th>
                    <th style="text-align: right;">Total R$</th>
                    <th style="text-align: right;">Participação</th>
                  </tr>
                </thead>
                <tbody>${paymentRowsHtml || '<tr><td colSpan="4">Sem lançamentos</td></tr>'}</tbody>
              </table>
            </div>

            <div>
              <div class="section-title">Principais Serviços de Bancada</div>
              <table>
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th style="text-align: center;">Volume</th>
                    <th style="text-align: right;">Faturamento R$</th>
                  </tr>
                </thead>
                <tbody>${serviceRowsHtml || '<tr><td colSpan="3">Sem lançamentos</td></tr>'}</tbody>
              </table>
            </div>
          </div>

          <div class="section-title">Listagem Consolidada de Ordens de Serviço (${filteredOrders.length} OS)</div>
          <table>
            <thead>
              <tr>
                <th>Código OS</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Aparelho / Modelo</th>
                <th>Status</th>
                <th style="text-align: right;">Valor Total</th>
              </tr>
            </thead>
            <tbody>${ordersRowsHtml || '<tr><td colSpan="6">Nenhuma ordem encontrada no período</td></tr>'}</tbody>
          </table>

          <div class="footer">
            <span>HcCell System v2.3.0 • Todos os direitos reservados.</span>
            <span class="hash-box">HASH AUDIT: ${reportHash}</span>
          </div>
        </body>
      </html>
    `);

    frameDoc.close();
    setTimeout(() => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(frame), 1000);
    }, 600);
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'OS',
      'Data',
      'Cliente',
      'Aparelho',
      'Status',
      'Servicos',
      'Pecas',
      'Total',
    ];
    const rows = filteredOrders.map((order) => {
      const client = clients.find((c) => c.id === order.clientId);
      return [
        order.displayId || order.id.slice(0, 8),
        new Date(order.createdAt).toLocaleDateString('pt-BR'),
        client?.name || 'Cliente Geral',
        order.deviceModel,
        order.status,
        order.priceServices.toFixed(2),
        order.priceParts.toFixed(2),
        order.total.toFixed(2),
      ].join(';');
    });

    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_hccell_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-3.5 sm:gap-6 pb-36 md:pb-12">
      {/* SaaS Header & Export Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-5 bg-white dark:bg-surface-dark p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        {/* Título e Banner (Oculto no Mobile - Padrão Bancada Mobile Pro) */}
        <div className="hidden sm:flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 size={16} />
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Análise de Desempenho
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Relatórios Operacionais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Métricas de faturamento, formas de pagamento, margem e tipos de serviços.
          </p>
        </div>

        {/* Period Selector & Export Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <CustomDropdown
            label="FILTRAR PERÍODO"
            options={[
              { value: 'today', label: 'Hoje' },
              { value: 'week', label: 'Últimos 7 dias' },
              { value: 'month', label: 'Este Mês' },
              { value: 'year', label: 'Este Ano' },
              { value: 'custom', label: 'Personalizado' },
            ]}
            selectedValue={dateFilter}
            onSelect={(val) => setDateFilter(val as DateFilter)}
            icon={<Calendar size={16} />}
            className="w-full sm:w-56"
          />

          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full sm:w-44">
                <DatePicker label="Início" value={startDate} onChange={setStartDate} />
              </div>
              <span className="text-slate-400 text-[10px] uppercase font-bold px-1">até</span>
              <div className="w-full sm:w-44">
                <DatePicker label="Fim" value={endDate} onChange={setEndDate} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
              title="Exportar documento PDF em padrão Fintech"
            >
              <FileText size={15} />
              <span>PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-neutral-800 text-white rounded-xl font-bold text-xs transition-all hover:bg-slate-800 dark:hover:bg-neutral-700 active:scale-95 border border-slate-800 dark:border-neutral-700"
              title="Exportar planilha CSV"
            >
              <Download size={15} />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Faturamento */}
        <div className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <DollarSign size={18} />
            </div>
            {metrics.revenueChange !== 0 && (
              <span
                className={`flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${metrics.revenueChange > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
              >
                {metrics.revenueChange > 0 ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {Math.abs(metrics.revenueChange).toFixed(0)}%
              </span>
            )}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Faturamento Bruto
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
              <AnimatedNumber value={metrics.totalRevenue} prefix="R$ " format="currency" />
            </p>
          </div>
        </div>

        {/* Card 2: Lucro Líquido Est. */}
        <div className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              <AnimatedNumber value={metrics.profitMargin} format="decimal" suffix="% Margem" />
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Lucro Líquido Est.
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              <AnimatedNumber value={metrics.netProfit} prefix="R$ " format="currency" />
            </p>
          </div>
        </div>

        {/* Card 3: Custos de Peças */}
        <div className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <TrendingDown size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Peças
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Custos de Peças
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
              <AnimatedNumber value={metrics.totalCosts} prefix="R$ " format="currency" />
            </p>
          </div>
        </div>

        {/* Card 4: Ticket Médio & Ordens */}
        <div className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              <AnimatedNumber value={metrics.ordersCount} format="integer" suffix=" Concluídas" />
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Ticket Médio
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
              <AnimatedNumber value={metrics.avgTicket} prefix="R$ " format="currency" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart (Receita vs Lucro vs Ordens) */}
      <DashboardChart orders={orders} products={products} dateFilter={dateFilter} />

      {/* Payment Methods Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment Method Revenue Distribution (R$ & %) */}
        <div className="bg-white dark:bg-surface-dark p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CreditCard size={16} />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Receita por Meios de Pagamento
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Distribuição R$</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-48 w-full relative flex items-center justify-center">
              {paymentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="receita"
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`pay-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [
                        `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Receita',
                      ]}
                      {...tooltipStyleProps}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-slate-400 text-xs">Sem lançamentos</span>
              )}
            </div>

            {/* List of Payment Revenue Breakdown */}
            <div className="flex flex-col gap-2.5">
              {paymentChartData.map((item, idx) => {
                const percent =
                  totalPaymentRevenue > 0
                    ? Math.round((item.receita / totalPaymentRevenue) * 100)
                    : 0;
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-2 rounded-xl bg-slate-50/70 dark:bg-neutral-900/40 border border-slate-100 dark:border-neutral-800/80"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                        R$ {item.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/60 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Method Volume (Quantidade de Ordens por Pagamento) */}
        <div className="bg-white dark:bg-surface-dark p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Wallet size={16} />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Quantidade de Ordens por Meio de Pagamento
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Volume de OS</span>
          </div>

          <div className="h-56 w-full">
            {paymentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="rgba(148, 163, 184, 0.15)"
                  />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val: number) => [`${val} ordem(ns)`, 'Quantidade']}
                    {...tooltipStyleProps}
                  />
                  <Bar dataKey="quantidade" radius={[0, 8, 8, 0]}>
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`pay-qty-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                Nenhum lançamento no período
              </div>
            )}
          </div>

          {/* Quick Summary Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs">
            {paymentChartData.map((p, idx) => (
              <span key={idx} className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}: <strong className="font-mono text-slate-900 dark:text-white">{p.quantidade} OS</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Analytics Grid (Tipos de Serviço, Status & Top Aparelhos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Essential Chart 1: Services Breakdown */}
        <div className="bg-white dark:bg-surface-dark p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Wrench size={16} />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Tipos de Serviço Mais Frequentes
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Bancada Técnica</span>
          </div>

          <div className="h-64 w-full">
            {serviceTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceTypeChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="rgba(148, 163, 184, 0.15)"
                  />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    width={90}
                  />
                  <Tooltip
                    formatter={(val: number) => [`${val} ocorrência(s)`, 'Volume']}
                    {...tooltipStyleProps}
                  />
                  <Bar dataKey="quantidade" radius={[0, 8, 8, 0]}>
                    {serviceTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                Nenhum dado disponível no período
              </div>
            )}
          </div>
        </div>

        {/* Essential Chart 2: Workbench Status Breakdown & Top Devices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Donut Chart */}
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                <PieIcon size={16} />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Funil de Status
              </h3>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyleProps} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-slate-400 text-xs">Sem dados</span>
              )}
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] font-bold">
              {statusChartData.map((s, idx) => (
                <span key={idx} className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}: <strong className="font-mono text-slate-900 dark:text-white">{s.value}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Top Devices Bar */}
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Smartphone size={16} />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Top Aparelhos em Bancada
              </h3>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {deviceChartData.length > 0 ? (
                deviceChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {item.name}
                    </span>
                    <span className="font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white">
                      {item.quantidade} OS
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-xs text-center py-6">Sem dados</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Orders Table */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col gap-3.5 sm:gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Layers size={16} />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Registro Detalhado do Período
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {filteredOrders.length} ordens filtradas
          </span>
        </div>

        {/* Mobile View: Cards Responsivos (Padrão Bancada Mobile Pro) */}
        <div className="md:hidden flex flex-col gap-2.5">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const client = clients.find((c) => c.id === order.clientId);
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="bg-slate-50/70 dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-neutral-800 flex flex-col gap-2 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-black text-slate-500">
                        #{order.displayId || order.id.slice(0, 8)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800/60">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {client?.name || 'Cliente Geral'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {order.deviceModel}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total</span>
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhum registro encontrado no período selecionado.
            </div>
          )}
        </div>

        {/* Desktop View: Tabela SaaS Completa */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  OS
                </th>
                <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Data
                </th>
                <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Cliente
                </th>
                <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Aparelho / Reparo
                </th>
                <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const client = clients.find((c) => c.id === order.clientId);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-neutral-900/50 text-xs">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #{order.displayId || order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {client?.name || 'Cliente Geral'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {order.deviceModel}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        R$ {order.total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum registro encontrado no período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-neutral-800">
            <span className="text-slate-400">
              Página {safeCurrentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
