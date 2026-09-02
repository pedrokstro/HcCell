import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../store';
import { useToast } from '../../components/Toast';

const formatDateStepper = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        
        // Format day and month
        const dayMonth = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            timeZone: 'America/Sao_Paulo'
        });
        
        // Format hour and minute
        const time = date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        });
        
        return `${dayMonth} às ${time}`;
    } catch (e) {
        console.error(e);
        return '';
    }
};
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
    Share2,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { OrderStatus, ServiceOrder, MovementType, PaymentMethod, PaymentEntry } from '../../types';
import { CustomDropdown } from '../../components/CustomDropdown';
import { BottomSheet } from '../../components/BottomSheet';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { AnimatedNumber } from '../../components/AnimatedNumber';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
        case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case OrderStatus.WAITING_WITHDRAWAL: return 'bg-orange-100 text-orange-800';
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
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | ''>('');
    const [currentPaymentAmount, setCurrentPaymentAmount] = useState<string>('');
    const [currentInstallments, setCurrentInstallments] = useState<number>(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | ''>(''); // fallback
    const [serviceNotes, setServiceNotes] = useState('');
    const [isSavingService, setIsSavingService] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const statusOptions = [
        { value: OrderStatus.PENDING, label: 'Pendente', icon: <Clock size={16} className="text-yellow-500" /> },
        { value: OrderStatus.IN_PROGRESS, label: 'Em Andamento', icon: <TrendingUp size={16} className="text-blue-500" /> },
        { value: OrderStatus.WAITING_WITHDRAWAL, label: 'Aguard. Retirada', icon: <Clock size={16} className="text-orange-500" /> },
        { value: OrderStatus.COMPLETED, label: 'Concluído', icon: <CheckCircle size={16} className="text-green-500" /> },
        { value: OrderStatus.CANCELLED, label: 'Cancelado', icon: <XCircle size={16} className="text-red-500" /> }
    ];

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
            case OrderStatus.WAITING_WITHDRAWAL:
                message += `Sobre seu aparelho ${order.deviceModel}: Ele já está pronto e aguardando retirada na nossa loja!`;
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


    const handleStatusChange = async (newStatus: OrderStatus, paymentMethodStr?: PaymentMethod, newPayments?: PaymentEntry[]) => {
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
            if (paymentMethodStr) updatedOrder.paymentMethod = paymentMethodStr;
            if (newPayments && newPayments.length > 0) updatedOrder.payments = newPayments;
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

    const handleComplete = () => {
        setPayments([]);
        setCurrentPaymentMethod('');
        setCurrentPaymentAmount(order.total > 0 ? order.total.toFixed(2) : '');
        setCurrentInstallments(1);
        setSelectedPaymentMethod('');
        setShowCompleteModal(true);
    };

    const handleAddPayment = () => {
        if (!currentPaymentMethod || !currentPaymentAmount) return;
        const amt = parseFloat(currentPaymentAmount);
        if (isNaN(amt) || amt <= 0) return;
        
        const newPayment: PaymentEntry = {
            method: currentPaymentMethod as PaymentMethod,
            amount: amt,
            installments: currentPaymentMethod === 'Cartão de Crédito' ? currentInstallments : 1
        };
        
        const newPayments = [...payments, newPayment];
        setPayments(newPayments);
        setCurrentPaymentMethod('');
        setCurrentInstallments(1);
        
        const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
        const remaining = Math.max(0, order.total - totalPaid);
        if (remaining > 0) {
            setCurrentPaymentAmount(remaining.toFixed(2));
        } else {
            setCurrentPaymentAmount('');
        }
    };

    const handleRemovePayment = (index: number) => {
        const removedAmount = payments[index].amount;
        const newPayments = payments.filter((_, i) => i !== index);
        setPayments(newPayments);
        
        const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
        const remaining = Math.max(0, order.total - totalPaid);
        setCurrentPaymentAmount(remaining > 0 ? remaining.toFixed(2) : '');
    };

    const confirmCompletion = async () => {
        let finalPayments = [...payments];
        if (currentPaymentMethod && currentPaymentAmount) {
            const amt = parseFloat(currentPaymentAmount);
            if (!isNaN(amt) && amt > 0) {
                finalPayments.push({
                    method: currentPaymentMethod as PaymentMethod,
                    amount: amt,
                    installments: currentPaymentMethod === 'Cartão de Crédito' ? currentInstallments : 1
                });
            }
        }
        
        if (finalPayments.length === 0) {
            // fallback if using the old simple select without amount
            if (selectedPaymentMethod) {
               finalPayments.push({
                   method: selectedPaymentMethod as PaymentMethod,
                   amount: order.total,
                   installments: selectedPaymentMethod === 'Cartão de Crédito' ? currentInstallments : 1
               });
            } else {
                showToast('Adicione pelo menos uma forma de pagamento.', 'error');
                return;
            }
        }

        const totalPaid = finalPayments.reduce((acc, p) => acc + p.amount, 0);
        if (Math.abs(totalPaid - order.total) > 0.01) {
            showToast('O valor pago deve ser igual ao total da ordem.', 'error');
            return;
        }

        const paymentMethodStr = finalPayments.length === 1 ? finalPayments[0].method : 'Múltiplo';

        await handleStatusChange(OrderStatus.COMPLETED, paymentMethodStr as PaymentMethod, finalPayments);
        setShowCompleteModal(false);
    };

    const renderReceipt = () => {
        if (!order) return null;
        return (
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
                                        {order.payments && order.payments.length > 0 ? (
                                            <>
                                                <tr>
                                                    <td colSpan={2} className="pt-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Formas de Pagamento</td>
                                                </tr>
                                                {order.payments.map((p, idx) => (
                                                    <tr key={idx}>
                                                        <td className="pt-1 text-[10px] uppercase tracking-widest text-slate-600 font-bold pl-2 flex items-center gap-1">
                                                            <span className="text-[8px] text-slate-300">•</span> {p.method}
                                                            {p.method === 'Cartão de Crédito' && p.installments && p.installments > 1 && (
                                                                <span className="text-[9px] text-slate-400 ml-1">({p.installments}x de R$ {(p.amount / p.installments).toFixed(2)})</span>
                                                            )}
                                                        </td>
                                                        <td className="pt-1 text-right text-[10px] text-slate-600 font-bold">R$ {p.amount.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </>
                                        ) : order.paymentMethod ? (
                                            <tr>
                                                <td className="pt-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Forma de Pagamento</td>
                                                <td className="pt-2 text-right text-[10px] uppercase tracking-widest text-slate-600 font-bold">{order.paymentMethod}</td>
                                            </tr>
                                        ) : (
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
        );
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
        <div className="max-w-[1240px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-3.5 sm:p-6 lg:p-7 space-y-5">
            {/* Header & Actions Bar (Clean White SaaS) */}
            <div className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
                            <Link to="/orders" className="p-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs flex items-center justify-center">
                                <ArrowLeft size={18} />
                            </Link>
                        </motion.div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                                    OS #{order.displayId || order.id.slice(0, 8)}
                                </h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium mt-1">
                                <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                                    <Clock size={12} className="text-primary" />
                                    Criada em {new Date(order.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                </span>
                                {(order.status === OrderStatus.COMPLETED || order.status.toUpperCase() === 'CONCLUÍDO') && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                                        <CheckCircle2 size={12} />
                                        Concluída em {new Date(order.executionDate || order.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Toolbar (Com Status Dropdown à Direita) */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        {/* Seletor de Status à Direita */}
                        <CustomDropdown
                            label="STATUS DA OS"
                            options={statusOptions}
                            selectedValue={order.status}
                            onSelect={(val) => handleStatusChange(val as OrderStatus)}
                            className="w-40 sm:w-44"
                            searchable={false}
                        />

                        {(order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_WITHDRAWAL) && (
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={handleComplete} 
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
                            >
                                <CheckCircle size={15} />
                                <span>Concluir OS</span>
                            </motion.button>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowReceiptModal(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-xs shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <FileText size={15} />
                            <span>Gerar Recibo</span>
                        </motion.button>

                        <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-neutral-900/60 rounded-xl border border-slate-200/80 dark:border-neutral-800">
                            <button
                                onClick={handleCopyTrackingLink}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 hover:text-primary font-bold text-xs shadow-xs border border-slate-200/60 dark:border-neutral-800 transition-all active:scale-95"
                                title="Copiar Link de Rastreio"
                            >
                                <Share2 size={13} />
                                <span>Link</span>
                            </button>

                            <button
                                onClick={handlePrintLabel}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 hover:text-primary font-bold text-xs shadow-xs border border-slate-200/60 dark:border-neutral-800 transition-all active:scale-95"
                                title="Imprimir Etiqueta"
                            >
                                <Tag size={13} />
                                <span>Etiqueta</span>
                            </button>

                            <Link
                                to={`/orders/${order.id}/edit`}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 hover:text-primary font-bold text-xs shadow-xs border border-slate-200/60 dark:border-neutral-800 transition-all active:scale-95"
                                title="Editar OS"
                            >
                                <Edit size={13} />
                                <span>Editar</span>
                            </Link>

                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all active:scale-95"
                                title="Excluir OS"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile & Tablet Toolbar (Padrão Bancada Mobile Pro) */}
                <div className="flex lg:hidden flex-col gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <CustomDropdown
                                label="STATUS DA OS"
                                options={statusOptions}
                                selectedValue={order.status}
                                onSelect={(val) => handleStatusChange(val as OrderStatus)}
                                className="w-full text-xs"
                                searchable={false}
                            />
                        </div>

                        {(order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_WITHDRAWAL) ? (
                            <button
                                onClick={handleComplete}
                                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs shadow-emerald-500/20 active:scale-95 shrink-0"
                            >
                                <CheckCircle size={15} />
                                <span>Concluir OS</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowReceiptModal(true)}
                                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-xs shadow-primary/20 active:scale-95 shrink-0"
                            >
                                <FileText size={15} />
                                <span>Gerar Recibo</span>
                            </button>
                        )}
                    </div>

                    {/* Quick Icon Actions (Sem botões duplicados) */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-neutral-900/60 rounded-xl border border-slate-200/80 dark:border-neutral-800">
                        <button
                            onClick={handleCopyTrackingLink}
                            className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 font-extrabold text-[10px] border border-slate-200/60 dark:border-neutral-800 active:scale-95 gap-0.5"
                            title="Copiar Link de Rastreio"
                        >
                            <Share2 size={13} className="text-primary" />
                            <span>Rastreio</span>
                        </button>

                        <button
                            onClick={handlePrintLabel}
                            className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 font-extrabold text-[10px] border border-slate-200/60 dark:border-neutral-800 active:scale-95 gap-0.5"
                            title="Imprimir Etiqueta"
                        >
                            <Tag size={13} className="text-primary" />
                            <span>Etiqueta</span>
                        </button>

                        <Link
                            to={`/orders/${order.id}/edit`}
                            className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 font-extrabold text-[10px] border border-slate-200/60 dark:border-neutral-800 active:scale-95 gap-0.5"
                            title="Editar Ordem de Serviço"
                        >
                            <Edit size={13} className="text-primary" />
                            <span>Editar</span>
                        </Link>

                        <button
                            onClick={handleDelete}
                            className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-500/20 active:scale-95 gap-0.5"
                            title="Excluir Ordem"
                        >
                            <Trash2 size={13} />
                            <span>Excluir</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancelled Alert Banner */}
            {order.status === OrderStatus.CANCELLED && (
                <motion.div 
                    className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 shadow-xs"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <XCircle className="shrink-0 text-red-500" size={20} />
                    <div>
                        <p className="font-black text-xs uppercase tracking-wide">Ordem de Serviço Cancelada</p>
                        <p className="text-xs font-semibold opacity-90">Esta ordem foi cancelada e seu estoque foi retornado.</p>
                    </div>
                </motion.div>
            )}

            {/* Status Timeline Stepper (Padrão Bancada Mobile Pro: Slim no mobile, Completo no Desktop) */}
            {order.status !== OrderStatus.CANCELLED && (
                <>
                    {/* Versão Mobile: Slim Horizontal Segmented Stepper (Economiza 150px de altura) */}
                    <div className="sm:hidden bg-white dark:bg-surface-dark rounded-2xl p-1.5 border border-slate-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-1">
                        {/* Step 1: Aberta */}
                        {(() => {
                            const isCurrent = order.status === OrderStatus.PENDING;
                            const isCompleted = order.status === OrderStatus.COMPLETED || order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_WITHDRAWAL;
                            return (
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(OrderStatus.PENDING)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all ${
                                        isCurrent
                                            ? 'bg-primary text-white shadow-xs'
                                            : isCompleted
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-slate-50 dark:bg-neutral-900 text-slate-400'
                                    }`}
                                >
                                    <span>+ Aberta</span>
                                </button>
                            );
                        })()}

                        {/* Step 2: Em Atendimento */}
                        {(() => {
                            const isCurrent = order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_WITHDRAWAL;
                            const isCompleted = order.status === OrderStatus.COMPLETED;
                            return (
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(OrderStatus.IN_PROGRESS)}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all ${
                                        isCurrent
                                            ? 'bg-primary text-white shadow-xs'
                                            : isCompleted
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-slate-50 dark:bg-neutral-900 text-slate-400'
                                    }`}
                                >
                                    <Clock size={12} />
                                    <span>Atendimento</span>
                                </button>
                            );
                        })()}

                        {/* Step 3: Concluída */}
                        {(() => {
                            const isCompleted = order.status === OrderStatus.COMPLETED;
                            return (
                                <button
                                    type="button"
                                    onClick={() => isCompleted ? null : handleComplete()}
                                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all ${
                                        isCompleted
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-50 dark:bg-neutral-900 text-slate-400'
                                    }`}
                                >
                                    <Check size={12} />
                                    <span>Concluída</span>
                                </button>
                            );
                        })()}
                    </div>

                    {/* Versão Desktop: Full Graphic Stepper */}
                    <motion.div 
                        className="hidden sm:block bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-200/80 dark:border-neutral-800 shadow-xs relative overflow-hidden"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="relative flex flex-row items-start justify-between max-w-[720px] mx-auto">
                            {/* Horizontal connecting line (Desktop) */}
                            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-100 dark:bg-neutral-800 -translate-y-1/2 z-0" />
                            
                            {/* Active line fill based on status (Desktop) */}
                            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] -translate-y-1/2 z-0 w-[66.66%] overflow-hidden">
                                <motion.div 
                                    className="h-full bg-primary" 
                                    initial={{ width: '0%' }}
                                    animate={{ 
                                        width: 
                                            order.status === OrderStatus.PENDING ? '0%' : 
                                            (order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_WITHDRAWAL) ? '50%' : 
                                            order.status === OrderStatus.COMPLETED ? '100%' : '0%'
                                    }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                            </div>

                            {/* Step 1: Aberta */}
                            {(() => {
                                const isCurrent = order.status === OrderStatus.PENDING;
                                return (
                                    <button 
                                        type="button"
                                        onClick={() => handleStatusChange(OrderStatus.PENDING)}
                                        className="relative z-10 flex flex-col items-center flex-1 cursor-pointer group text-center transition-transform active:scale-95"
                                        title="Definir status como Aberta / Pendente"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            {isCurrent && (
                                                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
                                            )}
                                            <div className="relative z-10 size-10 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary/20 shadow-xs shadow-primary/20 group-hover:scale-105 transition-transform">
                                                <span className="text-base font-bold font-sans">+</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center mt-2.5">
                                            <span className="text-xs font-black text-primary uppercase tracking-wider group-hover:underline">Aberta</span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">{formatDateStepper(order.createdAt)}</span>
                                        </div>
                                    </button>
                                );
                            })()}

                            {/* Step 2: Em Atendimento */}
                            {(() => {
                                const isCompleted = order.status === OrderStatus.COMPLETED;
                                const isCurrent = order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.WAITING_WITHDRAWAL;
                                const isActive = isCurrent || isCompleted;
                                
                                return (
                                    <button 
                                        type="button"
                                        onClick={() => handleStatusChange(OrderStatus.IN_PROGRESS)}
                                        className="relative z-10 flex flex-col items-center flex-1 cursor-pointer group text-center transition-transform active:scale-95"
                                        title="Definir status como Em Andamento"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            {isCurrent && (
                                                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
                                            )}
                                            <div className={`relative z-10 size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-105 ${
                                                isActive 
                                                    ? 'bg-primary text-white border-primary/20 shadow-xs shadow-primary/20' 
                                                    : 'bg-white dark:bg-neutral-900 text-slate-400 border-slate-200 dark:border-neutral-800 shadow-xs'
                                            }`}>
                                                <Clock size={15} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center mt-2.5">
                                            <span className={`text-xs font-black uppercase tracking-wider group-hover:underline ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                                {order.status === OrderStatus.WAITING_WITHDRAWAL ? 'Aguard. Retirada' : 'Em Atendimento'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">
                                                {isCurrent ? 'Em andamento' : isCompleted ? 'Realizado' : '--'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })()}

                            {/* Step 3: Concluída */}
                            {(() => {
                                const isCompleted = order.status === OrderStatus.COMPLETED;
                                return (
                                    <button 
                                        type="button"
                                        onClick={() => isCompleted ? null : handleComplete()}
                                        className="relative z-10 flex flex-col items-center flex-1 cursor-pointer group text-center transition-transform active:scale-95"
                                        title="Concluir Ordem de Serviço"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <div className={`relative z-10 size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-105 ${
                                                isCompleted 
                                                    ? 'bg-emerald-500 text-white border-emerald-500/20 shadow-xs shadow-emerald-500/20' 
                                                    : 'bg-white dark:bg-neutral-900 text-slate-400 border-slate-200 dark:border-neutral-800 shadow-xs'
                                            }`}>
                                                <Check size={15} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center mt-2.5">
                                            <span className={`text-xs font-black uppercase tracking-wider group-hover:underline ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>Concluída</span>
                                            {isCompleted ? (
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                                                    {formatDateStepper(order.executionDate || order.createdAt)}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">--</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })()}
                        </div>
                    </motion.div>
                </>
            )}

            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                    {/* Main Info Blocks (Cliente & Aparelho) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Client Card */}
                        <motion.div 
                            className="bg-white dark:bg-surface-dark rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 overflow-hidden"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                                        <User size={16} />
                                    </div>
                                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Cliente</h2>
                                </div>
                                {client?.phone && (
                                    <button 
                                        onClick={handleWhatsApp} 
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs shadow-emerald-500/20 transition-all text-xs font-bold active:scale-95 cursor-pointer" 
                                        title="Enviar WhatsApp"
                                    >
                                        <WhatsAppIcon size={14} color="#ffffff" />
                                        <span>WhatsApp</span>
                                    </button>
                                )}
                            </div>
                            <div className="p-4 sm:p-5 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                                    <p className="text-slate-900 dark:text-white font-bold text-base">{client?.name || 'Cliente Desconhecido'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/80">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-mono font-bold text-xs truncate">{client?.phone || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/80">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                                        <p className="text-slate-800 dark:text-slate-200 font-mono text-xs truncate">{client?.cpf || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Device Card */}
                        <motion.div 
                            className="bg-white dark:bg-surface-dark rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 overflow-hidden"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Smartphone size={16} />
                                </div>
                                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Aparelho</h2>
                            </div>
                            <div className="p-4 sm:p-5 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modelo</p>
                                    <p className="text-slate-900 dark:text-white font-black text-base truncate">{order.deviceModel}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/80">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IMEI / Serial</p>
                                        <p className="text-slate-600 dark:text-slate-300 font-mono text-xs truncate">{order.serialNumber || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/80">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Senha</p>
                                        <p className="text-amber-700 dark:text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block font-mono">{order.passcode || 'Nenhuma'}</p>
                                    </div>
                                </div>
                                {order.deviceImage && (
                                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Foto do Aparelho</p>
                                        <img src={order.deviceImage} alt="Foto do Aparelho" className="w-full h-auto rounded-xl border border-slate-200 dark:border-neutral-700 object-cover max-h-[220px]" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Problem & Execution */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                                <Wrench size={16} />
                            </div>
                            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Manutenção & Diagnóstico</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-5">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Problema Relatado</p>
                                <div className="bg-slate-50/80 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 p-3.5 rounded-xl">
                                    <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed italic">
                                        "{order.issueDescription}"
                                    </p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço Realizado (Técnico)</p>
                                    <motion.button
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSaveService}
                                        disabled={isSavingService}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold disabled:opacity-50 border border-primary/20"
                                    >
                                        <Save size={13} />
                                        {isSavingService ? 'Salvando...' : 'Salvar Alterações'}
                                    </motion.button>
                                </div>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200/80 dark:border-neutral-700 bg-slate-50/80 dark:bg-neutral-900/60 p-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all min-h-[90px] outline-none"
                                    placeholder="Descreva o serviço técnico realizado..."
                                    value={serviceNotes}
                                    onChange={(e) => setServiceNotes(e.target.value)}
                                />
                            </div>

                            {order.selectedProducts && order.selectedProducts.length > 0 && (
                                <div className="pt-4 border-t border-slate-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Peças Utilizadas</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {order.selectedProducts.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-neutral-900/60 rounded-xl border border-slate-100 dark:border-neutral-800">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {item.quantity}x
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-black font-mono text-slate-700 dark:text-slate-300">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Totals & Warranty */}
                <div className="space-y-5">
                    {/* Financial Summary */}
                    <motion.div 
                        className="bg-white dark:bg-surface-dark rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 overflow-hidden"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <DollarSign size={16} />
                            </div>
                            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Resumo Financeiro</h2>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-neutral-800/80">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Serviços</span>
                                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">R$ {order.priceServices.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-neutral-800/80">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Peças</span>
                                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">R$ {order.priceParts.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-neutral-800/80">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Desconto</span>
                                <span className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-mono">- R$ {order.discount.toFixed(2)}</span>
                            </div>
                            {(() => {
                                const totalPartsCost = (order.selectedProducts || []).reduce((acc, item) => acc + ((item.cost || 0) * item.quantity), 0);
                                return totalPartsCost > 0 ? (
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-neutral-800/80">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Custo das Peças</span>
                                        <span className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400 font-mono">R$ {totalPartsCost.toFixed(2)}</span>
                                    </div>
                                ) : null;
                            })()}
                            {order.payments && order.payments.length > 0 ? (
                                <div className="pt-2 border-t border-slate-50 dark:border-neutral-800 space-y-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamentos</span>
                                    {order.payments.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50/80 dark:bg-neutral-900/60 rounded-lg p-2 px-3 border border-slate-100 dark:border-neutral-800/60">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {p.method}
                                                {p.method === 'Cartão de Crédito' && p.installments && p.installments > 1 && (
                                                    <span className="ml-1 text-[10px] font-medium text-slate-400">({p.installments}x)</span>
                                                )}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">R$ {p.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : order.paymentMethod ? (
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-neutral-800">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pagamento</span>
                                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide">{order.paymentMethod}</span>
                                </div>
                            ) : null}
                            
                            {/* Highlight Total Box */}
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between mt-3">
                                <div>
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Total Líquido</span>
                                    <span className="text-[10px] font-bold text-primary">Valor final</span>
                                </div>
                                <span className="text-2xl font-black text-primary font-mono tracking-tight">
                                    <AnimatedNumber value={order.total} prefix="R$ " format="currency" />
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Warranty Card */}
                    {(order.warrantyEnd || order.noWarranty) && (
                        <motion.div 
                            className="bg-white dark:bg-surface-dark rounded-2xl shadow-xs border border-slate-200/80 dark:border-neutral-800 overflow-hidden"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Garantia</h2>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full uppercase tracking-wider">{order.noWarranty ? 'SEM GARANTIA' : '90 Dias'}</span>
                            </div>
                            <div className="p-4 sm:p-5 space-y-4">
                                {order.noWarranty ? (
                                    <div className="text-center py-3">
                                        <p className="text-xs font-medium text-slate-500">Este serviço foi registrado sem garantia.</p>
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
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isExpired ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                                                            {isExpired ? 'Expirada' : 'Ativa'}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
                                                            {isExpired ? 'Vencida' : `${remainingDays} dias restantes`}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : 'bg-primary'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div className="bg-slate-50/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/80 text-center">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Início</p>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{start.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                                                    </div>
                                                    <div className="bg-slate-50/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/80 text-center">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Término</p>
                                                        <p className="text-xs font-bold text-primary font-mono">{end.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setShowWarrantyModal(true)}
                                                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                                >
                                                    <Clock size={14} />
                                                    Renovar Garantia
                                                </button>
                                            </>
                                        );
                                    })()
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Warranty Modal */}
            {showWarrantyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-surface-dark p-6 text-left shadow-2xl transition-all border border-slate-200/80 dark:border-neutral-800 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Renovar Garantia</h3>
                                    <span className="text-[10px] font-bold text-slate-400">Extensão do período de garantia</span>
                                </div>
                            </div>
                            <button onClick={() => setShowWarrantyModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {[30, 90, 180].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setSelectedWarrantyDays(days)}
                                        className={`flex flex-col items-center justify-center rounded-xl border py-3 px-3 transition-all active:scale-95 ${selectedWarrantyDays === days
                                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                                            : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:border-primary/50'
                                            }`}
                                    >
                                        <span className="font-black text-lg">{days}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Dias</span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                                <button onClick={() => setShowWarrantyModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
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
                                            showToast('Garantia renovada com sucesso!', 'success');
                                        } catch (error) {
                                            console.error(error);
                                            showToast('Erro ao renovar garantia.', 'error');
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:bg-primary-dark transition-all active:scale-95"
                                >
                                    <Check size={16} /> Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Order / Payment Modal */}
            {showCompleteModal && (
                <>
                    {/* Desktop Modal (SaaS Profissional) */}
                    <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-surface-dark p-6 text-left shadow-2xl transition-all border border-slate-200/80 dark:border-neutral-800 animate-in zoom-in-95 duration-200 flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Concluir Ordem de Serviço</h3>
                                        <span className="text-[10px] font-bold text-slate-400">Registro financeiro e entrega ao cliente</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowCompleteModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-slate-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm">Valor Total da OS</p>
                                        <p className="opacity-90 font-mono font-bold text-base mt-0.5">R$ {order.total.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Saldo Restante</p>
                                        <p className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">R$ {Math.max(0, order.total - payments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}</p>
                                    </div>
                                </div>

                                {payments.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamentos Adicionados</p>
                                        {payments.map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-neutral-900/60 rounded-xl border border-slate-100 dark:border-neutral-800 text-xs">
                                                <div>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{p.method}</span>
                                                    {p.method === 'Cartão de Crédito' && p.installments && p.installments > 1 && (
                                                        <span className="ml-2 text-[10px] text-slate-500 font-medium">({p.installments}x de R$ {(p.amount / p.installments).toFixed(2)})</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-black text-primary font-mono">R$ {p.amount.toFixed(2)}</span>
                                                    <button onClick={() => handleRemovePayment(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Forma de Pagamento</p>
                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        {[
                                            { id: 'Cartão de Crédito', icon: CreditCard, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                                            { id: 'Cartão de Débito', icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                            { id: 'PIX', icon: QrCode, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                            { id: 'Dinheiro', icon: Banknote, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
                                        ].map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => {
                                                    setCurrentPaymentMethod(method.id as PaymentMethod);
                                                    setSelectedPaymentMethod(method.id as PaymentMethod);
                                                }}
                                                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2 transition-all group ${currentPaymentMethod === method.id
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${currentPaymentMethod === method.id ? 'bg-primary text-white' : `${method.bg} ${method.color}`} transition-colors`}>
                                                    <method.icon size={16} />
                                                </div>
                                                <span className={`font-bold text-[11px] text-center leading-tight ${currentPaymentMethod === method.id ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>{method.id}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-end gap-2.5">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Valor a Inserir (R$)</label>
                                            <input
                                                type="number"
                                                value={currentPaymentAmount}
                                                onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                                                className="w-full h-10 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary font-mono"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {currentPaymentMethod === 'Cartão de Crédito' && (
                                            <div className="w-28">
                                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Parcelas</label>
                                                <CustomDropdown
                                                    label="Parcelas"
                                                    options={[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `${i + 1}x` }))}
                                                    selectedValue={String(currentInstallments)}
                                                    onSelect={(val) => setCurrentInstallments(Number(val))}
                                                    searchable={false}
                                                    fullWidth
                                                />
                                            </div>
                                        )}
                                        <button
                                            onClick={handleAddPayment}
                                            disabled={!currentPaymentMethod || !currentPaymentAmount || parseFloat(currentPaymentAmount) <= 0}
                                            className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                                    <button onClick={() => setShowCompleteModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors">Cancelar</button>
                                    <button
                                        onClick={confirmCompletion}
                                        disabled={(payments.length === 0 && (!currentPaymentMethod || !currentPaymentAmount))}
                                        className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <Check size={16} /> Finalizar Ordem
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile BottomSheet */}
                    <BottomSheet
                        isOpen={showCompleteModal}
                        onClose={() => setShowCompleteModal(false)}
                        title="CONCLUIR ORDEM"
                    >
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4 text-sm text-green-800 dark:text-green-300 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-base mb-0.5 flex items-center gap-2">
                                        <CheckCircle2 className="text-green-600" size={18} />
                                        Finalizar Serviço
                                    </p>
                                    <p className="opacity-90 leading-snug text-xs mt-1">Total: R$ {order.total.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest opacity-80">Falta pagar</p>
                                    <p className="text-lg font-black text-green-700 dark:text-green-400">R$ {Math.max(0, order.total - payments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}</p>
                                </div>
                            </div>

                            {payments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamentos</p>
                                    {payments.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
                                            <div>
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.method} {p.installments && p.installments > 1 ? `(${p.installments}x de R$ ${(p.amount / p.installments).toFixed(2)})` : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-primary text-sm">R$ {p.amount.toFixed(2)}</span>
                                                <button onClick={() => handleRemovePayment(idx)} className="text-red-500 hover:text-red-700 p-1">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2">Deseja adicionar pagamento?</p>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {[
                                        { id: 'Cartão de Crédito', icon: CreditCard, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                                        { id: 'Cartão de Débito', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { id: 'PIX', icon: QrCode, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { id: 'Dinheiro', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' }
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => {
                                                setCurrentPaymentMethod(method.id as PaymentMethod);
                                                setSelectedPaymentMethod(method.id as PaymentMethod);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-3 px-1 transition-all group ${currentPaymentMethod === method.id
                                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 ring-offset-2'
                                                : 'border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl ${currentPaymentMethod === method.id ? 'bg-primary text-white' : `${method.bg} ${method.color}`} transition-colors`}>
                                                <method.icon size={18} />
                                            </div>
                                            <span className="font-bold text-[10px] text-center leading-tight">{method.id}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 mb-1 block">Valor (R$)</label>
                                        <input
                                            type="number"
                                            value={currentPaymentAmount}
                                            onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 text-sm font-bold text-slate-900 dark:text-white font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {currentPaymentMethod === 'Cartão de Crédito' && (
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 mb-1 block">Parcelas</label>
                                            <CustomDropdown
                                                label="Parcelas"
                                                options={[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `${i + 1}x` }))}
                                                selectedValue={String(currentInstallments)}
                                                onSelect={(val) => setCurrentInstallments(Number(val))}
                                                searchable={false}
                                                fullWidth
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAddPayment}
                                        disabled={!currentPaymentMethod || !currentPaymentAmount || parseFloat(currentPaymentAmount) <= 0}
                                        className="w-full h-11 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors disabled:opacity-50"
                                    >
                                        Adicionar Pagamento
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-2.5">
                                <button
                                    onClick={confirmCompletion}
                                    disabled={(payments.length === 0 && (!currentPaymentMethod || !currentPaymentAmount))}
                                    className="w-full h-12 rounded-xl bg-emerald-600 text-xs font-black text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 uppercase tracking-wider"
                                >
                                    <Check size={18} /> Finalizar Ordem
                                </button>
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    className="w-full h-11 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </BottomSheet>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <>
                    {/* Desktop Modal (SaaS Profissional) */}
                    <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-surface-dark p-6 text-left shadow-2xl transition-all border border-slate-200/80 dark:border-neutral-800 animate-in zoom-in-95 duration-200 flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                                        <Trash2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Excluir Ordem de Serviço</h3>
                                        <span className="text-[10px] font-bold text-slate-400">OS #{order.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Tem certeza que deseja excluir esta ordem de serviço permanentemente? <span className="text-rose-500 font-bold">Esta ação não pode ser desfeita e o estoque não retornado será mantido.</span>
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? 'Excluindo...' : 'Sim, Excluir OS'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile BottomSheet */}
                    <BottomSheet
                        isOpen={showCompleteModal}
                        onClose={() => setShowCompleteModal(false)}
                        title="CONCLUIR ORDEM"
                    >
                        <div className="space-y-4 pt-2 pb-4">
                            <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4 text-sm text-green-800 dark:text-green-300 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-base mb-0.5 flex items-center gap-2">
                                        <CheckCircle2 className="text-green-600" size={18} />
                                        Finalizar Serviço
                                    </p>
                                    <p className="opacity-90 leading-snug text-xs mt-1">Total: R$ {order.total.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest opacity-80">Falta pagar</p>
                                    <p className="text-lg font-black text-green-700 dark:text-green-400">R$ {Math.max(0, order.total - payments.reduce((acc, p) => acc + p.amount, 0)).toFixed(2)}</p>
                                </div>
                            </div>

                            {payments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamentos</p>
                                    {payments.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-800">
                                            <div>
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.method} {p.installments && p.installments > 1 ? `(${p.installments}x de R$ ${(p.amount / p.installments).toFixed(2)})` : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-primary text-sm">R$ {p.amount.toFixed(2)}</span>
                                                <button onClick={() => handleRemovePayment(idx)} className="text-red-500 hover:text-red-700 p-1">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2">Deseja adicionar pagamento?</p>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {[
                                        { id: 'Cartão de Crédito', icon: CreditCard, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                                        { id: 'Cartão de Débito', icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                        { id: 'PIX', icon: QrCode, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                        { id: 'Dinheiro', icon: Banknote, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => {
                                                setCurrentPaymentMethod(method.id as PaymentMethod);
                                                setSelectedPaymentMethod(method.id as PaymentMethod);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-3 px-1 transition-all ${currentPaymentMethod === method.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl ${currentPaymentMethod === method.id ? 'bg-primary text-white' : `${method.bg} ${method.color}`} transition-colors`}>
                                                <method.icon size={18} />
                                            </div>
                                            <span className={`font-bold text-[10px] text-center leading-tight ${currentPaymentMethod === method.id ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>{method.id === 'Cartão de Crédito' ? 'Crédito' : method.id === 'Cartão de Débito' ? 'Débito' : method.id}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={currentPaymentAmount}
                                            onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-sm font-bold text-slate-900 dark:text-white"
                                            placeholder="R$ 0.00"
                                        />
                                    </div>
                                    {currentPaymentMethod === 'Cartão de Crédito' && (
                                        <div className="w-[120px]">
                                            <CustomDropdown
                                                label="Parcelas"
                                                options={[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `${i + 1}x` }))}
                                                selectedValue={String(currentInstallments)}
                                                onSelect={(val) => setCurrentInstallments(Number(val))}
                                                searchable={false}
                                                fullWidth
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAddPayment}
                                        disabled={!currentPaymentMethod || !currentPaymentAmount || parseFloat(currentPaymentAmount) <= 0}
                                        className="h-[46px] px-4 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    onClick={confirmCompletion}
                                    disabled={(payments.length === 0 && (!currentPaymentMethod || !currentPaymentAmount))}
                                    className="w-full h-14 rounded-2xl bg-green-600 text-[13px] font-black text-white shadow-xl shadow-green-100 dark:shadow-none hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    <Check size={20} /> Finalizar Ordem
                                </button>
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    className="w-full h-12 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </BottomSheet>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <>
                    {/* Desktop Modal */}
                    <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white dark:bg-surface-dark p-8 text-center shadow-2xl shadow-red-500/10 transition-all border border-red-500/20 dark:border-red-900/30 animate-in zoom-in-95 duration-300">
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                                <Trash2 size={32} className="text-red-500" />
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
                                    className="flex items-center gap-2 rounded-2xl bg-red-500 hover:bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Mobile BottomSheet */}
                    <BottomSheet
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        title="EXCLUIR ORDEM"
                    >
                        <div className="flex flex-col items-center text-center py-4">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                                <Trash2 size={40} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Excluir Registro?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 px-4">
                                Tem certeza que deseja excluir permanentemente a ordem <span className="font-bold text-slate-900 dark:text-white">#{order.id.slice(0, 8)}</span>?
                                <br /><span className="text-red-500 font-medium">Não há como desfazer esta ação.</span>
                            </p>
                            
                            <div className="w-full flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="w-full h-14 rounded-2xl bg-red-600 text-sm font-black text-white shadow-xl shadow-red-100 dark:shadow-none active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    {isDeleting ? "Excluindo..." : "Sim, Excluir Agora"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full h-12 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </BottomSheet>
                </>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && (
                <>
                    {/* Desktop Modal Content */}
                    <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 print:bg-white print:p-0 print:block">
                        <div className="flex max-h-[95vh] h-auto w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl transition-all md:h-auto md:flex-row animate-in zoom-in-95 duration-300 print:shadow-none print:border-none print:h-auto print:block">
                            {/* Settings Sidebar (Desktop) */}
                            <div className="relative z-10 flex w-full flex-col border-r border-slate-100 bg-slate-50/50 p-6 md:p-8 md:w-1/3 print:hidden">
                                <div className="mb-6 md:mb-8 flex items-start justify-between">
                                    <div>
                                        <h3 className="mb-1 text-xl md:text-2xl font-black text-slate-900 tracking-tight">Gerar Recibo</h3>
                                        <p className="text-sm font-medium text-slate-500">Configuração do documento</p>
                                    </div>
                                    <button onClick={() => setShowReceiptModal(false)} className="rounded-full p-2 hover:bg-slate-200 transition-colors text-slate-400">
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
                                        <p className="font-medium opacity-90 leading-relaxed text-[11px]">
                                            Este documento serve como comprovante de garantia válido até {order.warrantyEnd ? new Date(order.warrantyEnd).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '--/--/----'}.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-200 flex flex-col gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <button
                                            onClick={handlePrint}
                                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-95 active:shadow-none"
                                        >
                                            <Printer size={18} />
                                            Imprimir A4
                                        </button>
                                        <button
                                            onClick={handlePrintThermal}
                                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-black active:scale-95 active:shadow-none"
                                        >
                                            <Printer size={18} />
                                            Cupom Térmico
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowReceiptModal(false)}
                                        className="w-full text-sm font-bold text-red-500 hover:text-red-700 py-2 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>

                                {/* Preview Area (Desktop) */}
                                <div className="hidden flex-1 bg-slate-100/50 md:flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
                                    <div className="scale-90 lg:scale-100 transition-all origin-top">
                                        {renderReceipt()}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                                        Pré-visualização do Documento
                                    </p>
                                </div>
                        </div>
                    </div>

                    {/* Mobile BottomSheet (Settings only) */}
                    <BottomSheet
                        isOpen={showReceiptModal}
                        onClose={() => setShowReceiptModal(false)}
                        title="GERAR RECIBO"
                    >
                        <div className="space-y-6 pt-2">
                            <div className="space-y-3">
                                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-4 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                                            <input
                                                checked={includeClientData}
                                                onChange={(e) => setIncludeClientData(e.target.checked)}
                                                className="size-4 rounded text-primary focus:ring-primary"
                                                type="checkbox"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Dados do Cliente</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incluir CPF e telefone</span>
                                        </div>
                                    </div>
                                    {includeClientData && <Check size={16} className="text-primary" />}
                                </label>

                                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-4 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                                            <input
                                                checked={includeTechnicalDetails}
                                                onChange={(e) => setIncludeTechnicalDetails(e.target.checked)}
                                                className="size-4 rounded text-primary focus:ring-primary"
                                                type="checkbox"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Detalhamento Técnico</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviços e mão de obra</span>
                                        </div>
                                    </div>
                                    {includeTechnicalDetails && <Check size={16} className="text-primary" />}
                                </label>

                                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-4 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                                            <input
                                                checked={includeWarrantyTerms}
                                                onChange={(e) => setIncludeWarrantyTerms(e.target.checked)}
                                                className="size-4 rounded text-primary focus:ring-primary"
                                                type="checkbox"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Termo de Garantia</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cláusulas de 90 dias</span>
                                        </div>
                                    </div>
                                    {includeWarrantyTerms && <Check size={16} className="text-primary" />}
                                </label>
                            </div>

                            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-4 text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-2 font-black mb-1 text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
                                    <AlertTriangle size={14} />
                                    Informação
                                </div>
                                <p className="font-medium leading-relaxed opacity-90">
                                    A garantia expira em {order.warrantyEnd ? new Date(order.warrantyEnd).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '--/--/----'}.
                                </p>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
                                >
                                    <Printer size={18} /> Gerar PDF (A4)
                                </button>
                                <button
                                    onClick={handlePrintThermal}
                                    className="w-full h-12 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-950/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
                                >
                                    <Printer size={18} /> Cupom Térmico
                                </button>
                                <button
                                    onClick={() => setShowReceiptModal(false)}
                                    className="w-full h-12 rounded-xl text-sm font-bold text-red-500 hover:text-red-700 py-2 transition-colors uppercase tracking-widest"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    </BottomSheet>

                    {/* Invisible Ghost Root for printing on mobile */}
                    <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                        <div className="bg-white p-0">

                            {/* The Real Document (Receipt) */}
                            {renderReceipt()}
                        </div>
                    </div>
                </>
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
