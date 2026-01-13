import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store';
import { useToast } from '../../components/Toast';
import {
    Clock,
    User,
    Smartphone,
    FileText,
    CheckCircle,
    Printer,
    ShieldCheck,
    Calendar,
    ArrowLeft,
    Edit,
    DollarSign,
    Wrench,
    X,
    Check,
    Trash2,
    AlertTriangle,
    Download,
    ZoomIn,
    ZoomOut,
    CheckCircle2,
    MessageCircle,
    Tag,
    CreditCard,
    Banknote,
    QrCode,
    Wallet,
    Save,
    Share2
} from 'lucide-react';
import { OrderStatus, ServiceOrder, MovementType, PaymentMethod } from '../../types';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
        case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case OrderStatus.WAITING_PAYMENT: return 'bg-orange-100 text-orange-800';
        case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

export const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, clients, products, updateOrder, deleteOrder, updateProduct, addProductMovement } = useApp();
    const { showToast } = useToast();
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [includeClientData, setIncludeClientData] = useState(true);
    const [includeTechnicalDetails, setIncludeTechnicalDetails] = useState(true);
    const [includeWarrantyTerms, setIncludeWarrantyTerms] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedWarrantyDays, setSelectedWarrantyDays] = useState(90);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | ''>('');
    const [serviceNotes, setServiceNotes] = useState('');
    const [isSavingService, setIsSavingService] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Ref for the QR Code (hidden but used for generating SVG)
    const qrRef = useRef<HTMLDivElement>(null);

    const order = orders.find(o => o.id === id);

    React.useEffect(() => {
        if (order) {
            setServiceNotes(order.servicePerformed || '');
        }
    }, [order?.servicePerformed]);
    // ... (rest of the file until handlePrint)

    if (!order) return null; // Simplified for brevity in this chunk, actual code persists

    const client = clients.find(c => c.id === order.clientId);

    const handleWhatsApp = () => {
        if (!client?.phone) return;

        let message = `Olá ${client.name}, aqui é da HcCell Assistência Técnica. `;
        const total = order.total.toFixed(2);

        switch (order.status) {
            case OrderStatus.COMPLETED:
                message += `Seu aparelho ${order.deviceModel} está pronto! O serviço foi concluído com sucesso. Valor total: R$ ${total}. Já pode vir retirar?`;
                break;
            case OrderStatus.WAITING_PAYMENT:
                message += `Sobre seu aparelho ${order.deviceModel}: Estamos aguardando confirmação (Pagamento/Peça) para prosseguir!`;
                break;
            case OrderStatus.IN_PROGRESS:
                message += `Passando para avisar que já iniciamos o reparo do seu ${order.deviceModel}. Qualquer novidade avisamos!`;
                break;
            default:
                message += `Gostaria de falar sobre sua Ordem de Serviço #${order.displayId || order.id.slice(0, 8)}.`;
        }

        // Add tracking link to message
        const trackingUrl = `${window.location.origin}/#/tracking?id=${order.displayId || order.id.slice(0, 8)}`;
        message += `\n\nAcompanhe o status aqui: ${trackingUrl}`;

        const phone = client.phone.replace(/\D/g, ''); // Remove non-digits
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleCopyTrackingLink = () => {
        const trackingUrl = `${window.location.origin}/#/tracking?id=${order.displayId || order.id.slice(0, 8)}`;
        navigator.clipboard.writeText(trackingUrl);
        showToast('Link de rastreamento copiado!', 'success');
    };

    const handlePrintLabel = () => {
        const originalTitle = document.title;
        document.title = `etiqueta_${order.displayId || order.id.slice(0, 8)}`;
        const frame = document.createElement('iframe');
        frame.style.position = 'absolute';
        frame.style.top = '-9999px';
        document.body.appendChild(frame);

        const frameDoc = frame.contentWindow?.document;
        if (!frameDoc) return;

        // QR Code SVG
        const qrSvg = document.getElementById('label-qr-code')?.innerHTML || '';

        frameDoc.write(`
            <html>
                <head>
                    <style>
                        @page { size: 50mm 30mm; margin: 0; }
                        body { margin: 0; padding: 2mm; font-family: sans-serif; display: flex; align-items: center; justify-content: space-between; height: 100vh; overflow: hidden; }
                        .info { flex: 1; overflow: hidden; }
                        .title { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                        .detail { font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                        .id { font-size: 12px; font-weight: 900; margin: 2px 0; }
                        .qr { width: 40px; height: 40px; flex-shrink: 0; margin-left: 4px; }
                        .qr svg { width: 100%; height: 100%; }
                    </style>
                </head>
                <body>
                    <div class="info">
                        <div class="title">HCCELL</div>
                        <div class="id">#${order.displayId || order.id.slice(0, 8)}</div>
                        <div class="detail">${client?.name?.split(' ')[0] || 'Cliente'}</div>
                        <div class="detail">${order.deviceModel}</div>
                        <div class="detail">${new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div class="qr">${qrSvg}</div>
                </body>
            </html>
        `);
        frameDoc.close();

        setTimeout(() => {
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(frame);
                document.title = originalTitle;
            }, 1000);
        }, 500);
    };

    // Impressão otimizada para impressora térmica 80mm (Epson TM-T20)
    const handlePrintThermal = () => {
        const originalTitle = document.title;
        document.title = `recibo_termico_${order.displayId || order.id.slice(0, 8)}`;
        const frame = document.createElement('iframe');
        frame.style.position = 'absolute';
        frame.style.top = '-9999px';
        document.body.appendChild(frame);

        const frameDoc = frame.contentWindow?.document;
        if (!frameDoc) return;

        // Formata data
        const dataEmissao = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' -');

        const dataEntrada = new Date(order.createdAt).toLocaleDateString('pt-BR');

        // Gera linhas de produtos/serviços
        let produtosHtml = '';
        if (order.selectedProducts && order.selectedProducts.length > 0) {
            order.selectedProducts.forEach((item: any) => {
                produtosHtml += `<tr><td>${item.quantity}x ${item.name}</td><td class="right">R$ ${(item.price * item.quantity).toFixed(2)}</td></tr>`;
            });
        }

        frameDoc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        @page { 
                            size: 80mm auto; 
                            margin: 0; 
                        }
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body { 
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            line-height: 1.3;
                            width: 80mm;
                            padding: 3mm;
                            color: #000;
                        }
                        .center { text-align: center; }
                        .right { text-align: right; }
                        .bold { font-weight: bold; }
                        .small { font-size: 10px; }
                        .large { font-size: 14px; }
                        .xlarge { font-size: 18px; }
                        .separator {
                            border-top: 1px dashed #000;
                            margin: 4mm 0;
                        }
                        .separator-double {
                            border-top: 2px solid #000;
                            margin: 4mm 0;
                        }
                        h1 { 
                            font-size: 16px; 
                            margin-bottom: 2mm;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        td {
                            padding: 1mm 0;
                            vertical-align: top;
                        }
                        .row {
                            display: flex;
                            justify-content: space-between;
                            margin: 1mm 0;
                        }
                        .row-label {
                            color: #333;
                        }
                        .row-value {
                            font-weight: bold;
                        }
                        .total-row {
                            font-size: 16px;
                            font-weight: bold;
                            padding: 2mm 0;
                        }
                        .footer {
                            margin-top: 5mm;
                            font-size: 9px;
                            text-align: center;
                            color: #666;
                        }
                        .warranty-box {
                            border: 1px solid #000;
                            padding: 2mm;
                            margin-top: 3mm;
                            font-size: 9px;
                        }
                    </style>
                </head>
                <body>
                    <!-- Cabeçalho -->
                    <div class="center">
                        <h1 class="bold">HCCELL</h1>
                        <div class="small">ASSISTÊNCIA TÉCNICA</div>
                        <div class="small">Tel: (XX) XXXX-XXXX</div>
                    </div>
                    
                    <div class="separator-double"></div>
                    
                    <!-- Info da OS -->
                    <div class="center bold large">
                        RECIBO DE SERVIÇO
                    </div>
                    <div class="center">
                        OS #${order.displayId || order.id.slice(0, 8)}
                    </div>
                    <div class="center small">
                        Emissão: ${dataEmissao}
                    </div>
                    
                    <div class="separator"></div>
                    
                    <!-- Cliente -->
                    <div class="bold">CLIENTE:</div>
                    <div>${client?.name || 'Cliente'}</div>
                    ${client?.cpf ? `<div class="small">CPF: ${client.cpf}</div>` : ''}
                    ${client?.phone ? `<div class="small">Tel: ${client.phone}</div>` : ''}
                    
                    <div class="separator"></div>
                    
                    <!-- Aparelho -->
                    <div class="bold">APARELHO:</div>
                    <div>${order.deviceModel}</div>
                    ${order.serialNumber ? `<div class="small">IMEI: ...${order.serialNumber.slice(-8)}</div>` : ''}
                    <div class="small">Data Entrada: ${dataEntrada}</div>
                    
                    <div class="separator"></div>
                    
                    <!-- Serviços -->
                    <div class="bold">SERVIÇOS:</div>
                    ${order.servicePerformed ? `<div class="small" style="margin: 1mm 0;">${order.servicePerformed}</div>` : ''}
                    
                    <table>

                        <tr>
                            <td>Peças</td>
                            <td class="right">R$ ${order.priceParts.toFixed(2)}</td>
                        </tr>
                        ${produtosHtml}
                        ${order.discount > 0 ? `
                        <tr>
                            <td>Desconto</td>
                            <td class="right">- R$ ${order.discount.toFixed(2)}</td>
                        </tr>
                        ` : ''}
                    </table>
                    
                    <div class="separator-double"></div>
                    
                    <!-- Total -->
                    <table>
                        <tr class="total-row">
                            <td>TOTAL</td>
                            <td class="right xlarge">R$ ${order.total.toFixed(2)}</td>
                        </tr>
                        ${order.paymentMethod ? `
                        <tr>
                            <td class="small">Pagamento:</td>
                            <td class="right small bold">${order.paymentMethod}</td>
                        </tr>
                        ` : ''}
                    </table>
                    
                    ${order.warrantyEnd ? `
                    <div class="warranty-box">
                        <div class="bold center">GARANTIA: 90 DIAS</div>
                        <div class="center">Válida até: ${new Date(order.warrantyEnd).toLocaleDateString('pt-BR')}</div>
                        <div style="margin-top: 1mm;">
                            A garantia cobre defeitos relacionados ao serviço executado.
                            Não cobre mau uso, quedas ou danos por líquidos.
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="separator"></div>
                    
                    <!-- Assinatura -->
                    <div style="margin-top: 10mm;">
                        <div class="center small">_______________________________</div>
                        <div class="center small">Assinatura do Cliente</div>
                    </div>
                    
                    <div class="footer">
                        Obrigado pela preferência!<br>
                        HCCELL - Assistência Técnica
                    </div>
                </body>
            </html>
        `);
        frameDoc.close();

        setTimeout(() => {
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(frame);
                document.title = originalTitle;
            }, 1000);
        }, 500);
    };


    const handleStatusChange = async (newStatus: OrderStatus, paymentMethod?: PaymentMethod) => {
        try {
            // Logic to return stock if cancelled
            if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
                if (order.selectedProducts && order.selectedProducts.length > 0) {
                    for (const item of order.selectedProducts) {
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            await updateProduct({
                                ...product,
                                quantity: product.quantity + item.quantity
                            });

                            // Record Entry Movement (Return)
                            await addProductMovement({
                                productId: product.id,
                                type: MovementType.ENTRY,
                                quantityChange: item.quantity,
                                note: `Estoque devolvido (OS Cancelada: #${order.id.slice(0, 8)})`
                            });
                        }
                    }
                }
            }
            // Logic to deduct stock if coming back from cancelled
            else if (order.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
                if (order.selectedProducts && order.selectedProducts.length > 0) {
                    for (const item of order.selectedProducts) {
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            await updateProduct({
                                ...product,
                                quantity: Math.max(0, product.quantity - item.quantity)
                            });

                            // Record Exit Movement
                            await addProductMovement({
                                productId: product.id,
                                type: MovementType.EXIT,
                                quantityChange: -item.quantity,
                                note: `Estoque re-deduzido (OS Reativada: #${order.id.slice(0, 8)})`
                            });
                        }
                    }
                }
            }

            const updatedOrder = { ...order, status: newStatus };
            if (paymentMethod) {
                updatedOrder.paymentMethod = paymentMethod;
            }
            await updateOrder(updatedOrder);
            showToast('Status atualizado com sucesso!', 'success');
        } catch (error) {
            console.error("Failed to update status", error);
            showToast("Erro ao atualizar status e estoque.", 'error');
        }
    };

    const handleDelete = async () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteOrder(order.id);
            navigate('/orders');
            showToast('Ordem de serviço excluída.', 'success');
        } catch (error) {
            console.error("Failed to delete order", error);
            showToast("Erro ao excluir ordem.", 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleSaveService = async () => {
        setIsSavingService(true);
        try {
            await updateOrder({ ...order, servicePerformed: serviceNotes });
            showToast('Serviço salvo com sucesso!', 'success');
        } catch (error) {
            console.error("Failed to save service", error);
            showToast("Erro ao salvar serviço. Tente novamente.", 'error');
        } finally {
            setIsSavingService(false);
        }
    };

    const handleComplete = () => setShowCompleteModal(true);

    const confirmCompletion = async () => {
        if (!selectedPaymentMethod) return;
        await handleStatusChange(OrderStatus.COMPLETED, selectedPaymentMethod as PaymentMethod);
        setShowCompleteModal(false);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `os${order.displayId || order.id.slice(0, 8)}`;

        const content = document.getElementById('receipt-content');
        if (!content) {
            document.title = originalTitle;
            return;
        }

        // Create a hidden iframe
        const frame = document.createElement('iframe');
        frame.style.visibility = 'hidden';
        frame.style.position = 'fixed';
        frame.style.right = '0';
        frame.style.bottom = '0';
        frame.style.width = '0';
        frame.style.height = '0';
        frame.style.border = 'none';
        document.body.appendChild(frame);

        const frameDoc = frame.contentWindow?.document;
        if (!frameDoc) return;

        // Copy styles from the main document to ensure Tailwind and fonts work
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(tag => tag.outerHTML)
            .join('\n');

        frameDoc.write(`
            <html>
                <head>
                    <title>os{order.displayId || order.id.slice(0, 8)}.pdf</title>
                    ${styles}
                    <style>
                        body { 
                            background: white !important; 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important;
                        }
                        #receipt-content { 
                            box-shadow: none !important; 
                            border: none !important; 
                            margin: 0 auto !important; 
                            width: 100% !important;
                            max-width: 420px !important;
                            padding: 40px !important;
                        }
                        /* Ensure icons and text are visible */
                        * { visibility: visible !important; }
                    </style>
                </head>
                <body>
                    <div id="receipt-content">
                        ${content.innerHTML}
                    </div>
                </body>
            </html>
        `);
        frameDoc.close();

        // Wait for images and styles to load before printing
        frame.contentWindow?.focus();
        setTimeout(() => {
            frame.contentWindow?.print();
            // Clean up after print dialog closes
            setTimeout(() => {
                document.body.removeChild(frame);
                document.title = originalTitle;
            }, 1000);
        }, 500);
    };

    return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                <Link to="/orders" className="p-3 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 transition-all shadow-sm flex-shrink-0 w-fit">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight truncate">OS #{order.displayId || order.id.slice(0, 8)}</h1>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm font-medium">
                        <Clock size={14} className="text-primary" />
                        Criada em {new Date(order.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                    </p>
                </div>
                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex flex-wrap gap-2">
                    <button
                        onClick={handleCopyTrackingLink}
                        className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-800 font-bold transition-all shadow-sm"
                        title="Copiar Link de Rastreio"
                    >
                        <Share2 size={20} />
                        <span className="hidden lg:inline">Link</span>
                    </button>
                    <button
                        onClick={handlePrintLabel}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-800 font-bold transition-all shadow-sm"
                    >
                        <Tag size={20} />
                        Etiqueta
                    </button>
                    <button
                        onClick={() => setShowReceiptModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark font-bold transition-all shadow-xl shadow-primary/20"
                    >
                        <FileText size={20} />
                        Gerar Recibo
                    </button>
                    {(order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_PAYMENT) && (
                        <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-bold transition-all shadow-xl shadow-green-200">
                            <CheckCircle size={20} />
                            Concluir
                        </button>
                    )}
                    <Link to={`/orders/${order.id}/edit`} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-800 font-bold transition-all shadow-sm">
                        <Edit size={20} />
                        Editar
                    </Link>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-3 bg-white dark:bg-surface-dark border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all">
                        <Trash2 size={20} />
                    </button>
                </div>

                <div className="flex sm:hidden flex-col gap-3 w-full mt-4">
                    <button
                        onClick={handleCopyTrackingLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm shadow-sm"
                    >
                        <Share2 size={18} />
                        Copiar Link de Rastreio
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handlePrintLabel}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm"
                        >
                            <Tag size={18} />
                            Etiqueta
                        </button>
                        <button
                            onClick={() => setShowReceiptModal(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm"
                        >
                            <FileText size={18} />
                            Recibo
                        </button>
                    </div>

                    {(order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_PAYMENT) && (
                        <button onClick={handleComplete} className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200">
                            <CheckCircle size={20} />
                            Concluir Serviço
                        </button>
                    )}

                    <div className="grid grid-cols-[1fr_auto] gap-3">
                        <Link to={`/orders/${order.id}/edit`} className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">
                            <Edit size={20} />
                            Editar Ordem
                        </Link>
                        <button onClick={handleDelete} className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    {/* Main Info Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Card */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                    <User size={18} />
                                </div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Cliente</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome Completo</p>
                                    <p className="text-slate-900 dark:text-white font-bold text-lg">{client?.name || 'Cliente Desconhecido'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Telefone</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-slate-700 dark:text-slate-300 font-mono font-bold text-sm bg-slate-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl w-fit">{client?.phone || '-'}</p>
                                            {client?.phone && (
                                                <button onClick={handleWhatsApp} className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" title="Enviar Mensagem">
                                                    <MessageCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CPF</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">{client?.cpf || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Device Card */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                    <Smartphone size={18} />
                                </div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Aparelho</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Modelo</p>
                                    <p className="text-slate-900 dark:text-white font-black text-xl">{order.deviceModel}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">IMEI / Serial</p>
                                        <p className="text-slate-500 dark:text-slate-400 font-mono text-xs truncate">{order.serialNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Senha</p>
                                        <p className="text-amber-700 dark:text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded-lg inline-block">{order.passcode || 'Nenhuma'}</p>
                                    </div>
                                </div>
                                {order.deviceImage && (
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-neutral-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Foto do Aparelho</p>
                                        <img src={order.deviceImage} alt="Foto do Aparelho" className="w-full h-auto rounded-xl border border-slate-200 dark:border-neutral-700 object-cover max-h-[300px]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Problem & Execution */}
                    <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                                <Wrench size={18} />
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Manutenção</h2>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Problema Relatado</p>
                                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-5 rounded-2xl">
                                    <p className="text-slate-900 dark:text-white font-medium leading-relaxed italic">
                                        "{order.issueDescription}"
                                    </p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço Realizado (Técnico)</p>
                                    <button
                                        onClick={handleSaveService}
                                        disabled={isSavingService}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold disabled:opacity-50"
                                    >
                                        <Save size={14} />
                                        {isSavingService ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full rounded-2xl border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 p-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-primary transition-all min-h-[100px]"
                                    placeholder="Descreva o serviço técnico realizado..."
                                    value={serviceNotes}
                                    onChange={(e) => setServiceNotes(e.target.value)}
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Status & Atualização</p>
                                <select
                                    className="w-full sm:w-64 rounded-xl border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-black text-slate-900 dark:text-white focus:border-primary focus:ring-primary transition-all cursor-pointer h-12"
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                                >
                                    <option value={OrderStatus.PENDING}>{OrderStatus.PENDING}</option>
                                    <option value={OrderStatus.IN_PROGRESS}>{OrderStatus.IN_PROGRESS}</option>
                                    <option value={OrderStatus.WAITING_PAYMENT}>{OrderStatus.WAITING_PAYMENT}</option>
                                    {order.status === OrderStatus.COMPLETED && (
                                        <option value={OrderStatus.COMPLETED}>{OrderStatus.COMPLETED}</option>
                                    )}
                                    <option value={OrderStatus.CANCELLED}>{OrderStatus.CANCELLED}</option>
                                </select>
                            </div>

                            {order.selectedProducts && order.selectedProducts.length > 0 && (
                                <div className="pt-6 border-t border-slate-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Peças Utilizadas</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {order.selectedProducts.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {item.quantity}x
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-600 dark:text-slate-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Totals & Warranty */}
                <div className="space-y-8">
                    {/* Financial Summary */}
                    <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <DollarSign size={18} />
                            </div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Financeiro</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-neutral-800">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Serviços</span>
                                <span className="font-bold text-slate-900 dark:text-white">R$ {order.priceServices.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-neutral-800">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Peças</span>
                                <span className="font-bold text-slate-900 dark:text-white">R$ {order.priceParts.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-neutral-800">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Desconto</span>
                                <span className="font-bold text-green-600 dark:text-green-400">- R$ {order.discount.toFixed(2)}</span>
                            </div>
                            {(() => {
                                const totalPartsCost = (order.selectedProducts || []).reduce((acc, item) => acc + ((item.cost || 0) * item.quantity), 0);
                                return totalPartsCost > 0 ? (
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-neutral-800">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Custo das Peças</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">R$ {totalPartsCost.toFixed(2)}</span>
                                    </div>
                                ) : null;
                            })()}
                            {order.paymentMethod && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-neutral-800">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pagamento</span>
                                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide">{order.paymentMethod}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Total</span>
                                <span className="text-3xl font-black text-primary">R$ {order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Warranty Card */}
                    {(order.warrantyEnd || order.noWarranty) && (
                        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h2 className="font-bold text-slate-900 dark:text-white">Garantia</h2>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.noWarranty ? 'SEM GARANTIA' : '90 Dias'}</span>
                            </div>
                            <div className="p-6 space-y-6">
                                {order.noWarranty ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm font-medium text-slate-500">Este serviço foi registrado sem garantia.</p>
                                    </div>
                                ) : (
                                    (() => {
                                        const end = new Date(order.warrantyEnd!);
                                        const start = new Date(order.createdAt);
                                        const now = new Date();
                                        const totalDays = 90;
                                        const diffTime = end.getTime() - now.getTime();
                                        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        const progress = Math.max(0, Math.min(100, (remainingDays / totalDays) * 100));
                                        const isExpired = remainingDays <= 0;

                                        return (
                                            <>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {isExpired ? 'Expirada' : 'Ativa'}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-600">
                                                            {isExpired ? 'Vencida' : `${remainingDays} dias restantes`}
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : 'bg-primary'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-2xl border border-slate-100 dark:border-neutral-800 text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início</p>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{start.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-2xl border border-slate-100 dark:border-neutral-800 text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Término</p>
                                                        <p className="text-xs font-bold text-primary">{end.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setShowWarrantyModal(true)}
                                                    className="w-full py-3 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Clock size={16} />
                                                    Renovar Garantia
                                                </button>
                                            </>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Warranty Modal */}
            {showWarrantyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-lg transform overflow-hidden rounded-[32px] bg-white dark:bg-surface-dark p-10 text-left shadow-2xl transition-all border border-slate-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Renovar Garantia</h3>
                            <button onClick={() => setShowWarrantyModal(false)} className="rounded-2xl p-2.5 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-8">
                            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6 text-sm text-blue-700 flex items-start gap-4">
                                <ShieldCheck className="shrink-0 mt-0.5" size={24} />
                                <div>
                                    <p className="font-bold text-lg mb-1">Extensão de Garantia</p>
                                    <p className="opacity-80">Escolha o período adicional para a garantia deste serviço.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[30, 90, 180].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setSelectedWarrantyDays(days)}
                                        className={`flex flex-col items-center justify-center rounded-2xl border-2 py-6 px-4 transition-all group ${selectedWarrantyDays === days
                                            ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 ring-offset-2'
                                            : 'border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:border-primary hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        <span className="font-black text-2xl">{days}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest group-hover:text-primary/70 ${selectedWarrantyDays === days ? 'text-primary/70' : 'text-slate-400'
                                            }`}>Dias</span>
                                    </button>
                                ))}
                            </div>
                            <div className="pt-6 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-4">
                                <button onClick={() => setShowWarrantyModal(false)} className="rounded-2xl px-8 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800">Cancelar</button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const today = new Date();
                                            const endDate = new Date(today);
                                            endDate.setDate(today.getDate() + selectedWarrantyDays);

                                            await updateOrder({
                                                ...order,
                                                warrantyEnd: endDate.toISOString()
                                            });
                                            setShowWarrantyModal(false);
                                            // Optional: Toast success
                                        } catch (error) {
                                            console.error(error);
                                            alert("Erro ao renovar garantia");
                                        }
                                    }}
                                    className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all"
                                >
                                    <Check size={20} /> Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Order / Payment Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-lg transform overflow-hidden rounded-[32px] bg-white dark:bg-surface-dark p-10 text-left shadow-2xl transition-all border border-slate-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Concluir Ordem</h3>
                            <button onClick={() => setShowCompleteModal(false)} className="rounded-2xl p-2.5 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="rounded-2xl bg-green-50 border border-green-100 p-6 text-sm text-green-800 flex items-start gap-4">
                                <CheckCircle2 className="shrink-0 mt-0.5" size={24} />
                                <div>
                                    <p className="font-bold text-lg mb-1">Finalizar Serviço</p>
                                    <p className="opacity-90">Selecione a forma de pagamento, se aplicável, para registrar a baixa financeira.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'Cartão de Crédito', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
                                    { id: 'Cartão de Débito', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
                                    { id: 'PIX', icon: QrCode, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
                                    { id: 'Dinheiro', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-200' }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPaymentMethod(method.id as PaymentMethod)}
                                        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 py-6 px-4 transition-all group relative overflow-hidden ${selectedPaymentMethod === method.id
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2'
                                            : `border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 ${method.border}`
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${selectedPaymentMethod === method.id ? 'bg-primary text-white' : `${method.bg} ${method.color}`} transition-colors`}>
                                            <method.icon size={24} />
                                        </div>
                                        <span className={`font-bold text-sm ${selectedPaymentMethod === method.id ? 'text-primary' : 'text-slate-600'}`}>{method.id}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-4">
                                <button onClick={() => setShowCompleteModal(false)} className="rounded-2xl px-8 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800">Cancelar</button>
                                <button
                                    onClick={confirmCompletion}
                                    disabled={!selectedPaymentMethod}
                                    className="flex items-center gap-2 rounded-2xl bg-green-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check size={20} /> Confirmar Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white dark:bg-surface-dark p-8 text-center shadow-2xl transition-all border border-slate-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                            <Trash2 size={32} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Excluir Ordem?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                            Tem certeza que deseja excluir esta ordem de serviço <span className="font-bold text-slate-900 dark:text-white">#{order.id.slice(0, 8)}</span> permanentemente?
                            <br /><span className="text-red-500 font-medium">Esta ação não pode ser desfeita.</span>
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-2xl px-8 py-3.5 text-sm font-bold text-slate-500 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Sim, Excluir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 print:bg-white print:p-0 print:block">
                    <div className="flex max-h-[95vh] h-auto w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl transition-all md:h-auto md:flex-row animate-in zoom-in-95 duration-300 print:shadow-none print:border-none print:h-auto print:block">
                        {/* Settings Sidebar */}
                        <div className="relative z-10 flex w-full flex-col border-r border-slate-100 bg-slate-50/50 p-6 md:p-8 md:w-1/3 print:hidden">
                            <div className="mb-6 md:mb-8 flex items-start justify-between">
                                <div>
                                    <h3 className="mb-1 text-xl md:text-2xl font-black text-slate-900 tracking-tight">Gerar Recibo</h3>
                                    <p className="text-sm font-medium text-slate-500">Configuração do documento</p>
                                </div>
                                <button onClick={() => setShowReceiptModal(false)} className="rounded-full p-2 hover:bg-slate-200 transition-colors text-slate-400 md:hidden">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                                <div className="space-y-3">
                                    <label className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-primary hover:bg-primary/5 active:bg-primary/5 border-dashed">
                                        <div className="flex h-6 items-center">
                                            <input
                                                checked={includeClientData}
                                                onChange={(e) => setIncludeClientData(e.target.checked)}
                                                className="size-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                                type="checkbox"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 group-hover:text-primary transition-colors">Dados do Cliente</span>
                                            <span className="text-xs font-medium text-slate-400">Incluir CPF e telefone</span>
                                        </div>
                                    </label>

                                    <label className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-primary hover:bg-primary/5 active:bg-primary/5 border-dashed">
                                        <div className="flex h-6 items-center">
                                            <input
                                                checked={includeTechnicalDetails}
                                                onChange={(e) => setIncludeTechnicalDetails(e.target.checked)}
                                                className="size-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                                type="checkbox"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 group-hover:text-primary transition-colors">Detalhamento Técnico</span>
                                            <span className="text-xs font-medium text-slate-400">Serviços e mão de obra</span>
                                        </div>
                                    </label>

                                    <label className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-primary hover:bg-primary/5 active:bg-primary/5 border-dashed">
                                        <div className="flex h-6 items-center">
                                            <input
                                                checked={includeWarrantyTerms}
                                                onChange={(e) => setIncludeWarrantyTerms(e.target.checked)}
                                                className="size-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                                type="checkbox"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 group-hover:text-primary transition-colors">Termo de Garantia</span>
                                            <span className="text-xs font-medium text-slate-400">Cláusulas de 90 dias</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="rounded-2xl bg-blue-50 p-4 text-xs text-blue-800 border border-blue-100">
                                    <div className="flex items-center gap-2 font-black mb-1 text-blue-600">
                                        <AlertTriangle size={14} />
                                        Informação
                                    </div>
                                    <p className="font-medium opacity-90 leading-relaxed">
                                        Este documento serve como comprovante de garantia válido até {order.warrantyEnd ? new Date(order.warrantyEnd).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '--/--/----'}.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-200 flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={handlePrint}
                                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark active:scale-95 active:shadow-none"
                                    >
                                        <Printer size={20} />
                                        A4 / PDF
                                    </button>
                                    <button
                                        onClick={handlePrintThermal}
                                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-800 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-800/20 transition-all hover:bg-slate-900 active:scale-95 active:shadow-none"
                                    >
                                        <Printer size={20} />
                                        Térmica 80mm
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowReceiptModal(false)}
                                    className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        {/* Document Preview */}
                        <div className="hidden md:flex relative w-full flex-col items-center justify-center bg-slate-100 p-8 md:w-2/3 overflow-y-auto print:bg-white print:p-0 print:overflow-visible">
                            <div className="absolute inset-0 opacity-[0.05] print:hidden" style={{ backgroundImage: 'radial-gradient(#0395a5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

                            <div className="absolute right-6 top-6 z-20 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm print:hidden">
                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 transition-colors"><ZoomIn size={18} /></button>
                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 transition-colors"><ZoomOut size={18} /></button>
                            </div>

                            {/* The Real Document (Receipt) */}
                            <div id="receipt-content" className="relative flex min-h-[600px] w-full max-w-[420px] flex-col bg-white text-slate-900 shadow-2xl p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <div className="border-b-2 border-slate-100 pb-6 mb-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col items-start">
                                            <img src="/logo-full.png" alt="HCCELL Logo" className="h-16 w-auto object-contain" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Assistência Técnica</span>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-lg font-black text-slate-900">RECIBO</h2>
                                            <p className="text-[10px] font-black text-slate-400">OS #{order.displayId || order.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Emissão: {new Date().toLocaleString('pt-BR', {
                                            timeZone: 'America/Sao_Paulo',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }).replace(',', ' -')}</span>
                                        <span>Via do Cliente</span>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {includeClientData && (
                                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                            <h4 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Dados do Cliente</h4>
                                            <div className="flex justify-between items-start text-xs font-bold">
                                                <div>
                                                    <p className="text-slate-900 text-sm mb-1">{client?.name || 'Cliente Desconhecido'}</p>
                                                    <p className="text-slate-500">CPF: {client?.cpf || '--'}</p>
                                                </div>
                                                <p className="text-slate-500">{client?.phone || '--'}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="mb-3 border-b border-slate-100 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Aparelho</h4>
                                        <div className="flex justify-between text-xs font-bold text-slate-900">
                                            <span>{order.deviceModel}</span>
                                            <span className="font-mono text-slate-400">IMEI: {order.serialNumber ? `...${order.serialNumber.slice(-8)}` : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-3 border-b border-slate-100 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Serviços Executados</h4>
                                        {order.servicePerformed && (
                                            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição Técnica</p>
                                                <p className="text-xs font-medium text-slate-800 leading-relaxed">{order.servicePerformed}</p>
                                            </div>
                                        )}
                                        {includeTechnicalDetails ? (
                                            <>
                                                <table className="w-full text-xs">
                                                    <tbody className="font-bold text-slate-700">

                                                        <tr className="border-b border-slate-50">
                                                            <td className="py-2">Peças e componentes</td>
                                                            <td className="py-2 text-right">R$ {order.priceParts.toFixed(2)}</td>
                                                        </tr>
                                                        {order.discount > 0 && (
                                                            <tr className="border-b border-slate-50 text-green-600">
                                                                <td className="py-2">Desconto aplicado</td>
                                                                <td className="py-2 text-right">- R$ {order.discount.toFixed(2)}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                    <tfoot className="font-black text-sm">
                                                        <tr>
                                                            <td className="pt-3 uppercase text-slate-500">Total</td>
                                                            <td className="pt-3 text-right text-slate-900">R$ {order.total.toFixed(2)}</td>
                                                        </tr>
                                                        {order.paymentMethod ? (
                                                            <tr>
                                                                <td className="pt-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Forma de Pagamento</td>
                                                                <td className="pt-2 text-right text-[10px] uppercase tracking-widest text-slate-600 font-bold">{order.paymentMethod}</td>
                                                            </tr>
                                                        ) : (
                                                            // Legacy orders or unpaid
                                                            <tr>
                                                                <td className="pt-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</td>
                                                                <td className="pt-2 text-right text-[10px] uppercase tracking-widest text-slate-600 font-bold">{order.status}</td>
                                                            </tr>
                                                        )}
                                                    </tfoot>
                                                </table>
                                            </>
                                        ) : (
                                            <div className="py-4 text-xs italic text-slate-400">Detalhamento oculto no recibo.</div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between border-t-2 border-slate-900 pt-3">
                                            <span className="text-xs font-black uppercase tracking-widest">TOTAL</span>
                                            <span className="text-xl font-black text-slate-900">R$ {order.total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {includeWarrantyTerms && (
                                        <div className="mt-8 border-t border-slate-100 bg-slate-50 rounded-2xl p-6">
                                            <div className="mb-4 flex items-center gap-2">
                                                <ShieldCheck className="text-primary" size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Garantia Limitada (90 Dias)</span>
                                            </div>
                                            <div className="mb-4 grid grid-cols-2 gap-4 text-[9px] font-bold">
                                                <div>
                                                    <span className="block text-slate-400 uppercase mb-1">Início</span>
                                                    <span className="text-slate-700">{new Date(order.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-slate-400 uppercase mb-1">Término</span>
                                                    <span className="text-slate-900 font-black">{order.warrantyEnd ? new Date(order.warrantyEnd).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <p className="text-[8px] font-medium leading-relaxed text-slate-500 text-justify">
                                                Esta garantia cobre exclusivamente defeitos de fabricação das peças substituídas. A garantia será automaticamente anulada em casos de: contato com líquidos, quedas, trincas no vidro, ou violação do selo de garantia.
                                            </p>
                                            <div className="mt-8 flex items-end justify-between border-t border-dashed border-slate-300 pt-4">
                                                <div className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Gerado via HCCELL System</div>
                                                <div className="text-[10px] font-bold text-slate-300 italic">Assinatura do Técnico</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden QR Code for Label Printing */}
            <div style={{ display: 'none' }}>
                <div id="label-qr-code" ref={qrRef}>
                    <QRCode
                        value={window.location.origin + '/#/tracking?id=' + order.id}
                        size={64}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </div>
        </div>
    );
};