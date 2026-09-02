import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { ServiceOrder, OrderStatus } from '../types';
import {
  X,
  Smartphone,
  User,
  Phone,
  Calendar,
  DollarSign,
  Wrench,
  Clock,
  ArrowUpRight,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppIcon } from './WhatsAppIcon';

interface OrderQuickDrawerProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderQuickDrawer: React.FC<OrderQuickDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { clients, products, updateOrder } = useApp();
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!order) return null;

  const client = clients.find((c) => c.id === order.clientId);
  const createdDate = new Date(order.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const trackingUrl = `${window.location.origin}/#/track?orderId=${order.displayId || order.id}`;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case OrderStatus.IN_PROGRESS:
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case OrderStatus.WAITING_WITHDRAWAL:
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case OrderStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case OrderStatus.CANCELLED:
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-surface-dark h-full shadow-2xl border-l border-slate-200/80 dark:border-neutral-800 flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Smartphone size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-neutral-800 text-slate-700 dark:text-slate-300">
                      OS #{order.displayId || order.id.slice(0, 8)}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
                    {order.deviceModel}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto custom-scrollbar p-5 space-y-5 flex-1 text-xs">
              {/* Client Card */}
              <div className="rounded-xl border border-slate-200/80 dark:border-neutral-800 p-4 bg-slate-50/40 dark:bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Cliente
                  </span>
                  {client?.phone && (
                    <a
                      href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(client.name)}, atualizações sobre sua OS #${order.displayId || order.id.slice(0, 8)} (${encodeURIComponent(order.deviceModel)}) na HcCell.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold text-[11px] transition-all border border-emerald-500/20 active:scale-95"
                    >
                      <WhatsAppIcon size={13} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {client?.name || 'Cliente Balcão'}
                  </p>
                  {client?.phone && (
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      {client.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Diagnosis & Issue */}
              <div className="rounded-xl border border-slate-200/80 dark:border-neutral-800 p-4 bg-slate-50/40 dark:bg-neutral-900/40 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Defeito Relatado / Diagnóstico
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-100 dark:border-neutral-800/80">
                  {order.issueDescription || 'Nenhum defeito detalhado registrado.'}
                </p>
              </div>

              {/* Selected Parts & Services */}
              <div className="rounded-xl border border-slate-200/80 dark:border-neutral-800 p-4 bg-slate-50/40 dark:bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Peças & Serviços
                  </span>
                  <span className="font-bold text-slate-500">
                    {(order.selectedProducts || []).length} item(ns)
                  </span>
                </div>

                {order.selectedProducts && order.selectedProducts.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800 rounded-lg overflow-hidden border border-slate-100 dark:border-neutral-800 bg-white dark:bg-surface-dark">
                    {order.selectedProducts.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <Package size={14} className="text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {prod?.name || item.name || 'Peça / Item'}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-slate-900 dark:text-white shrink-0">
                            {item.quantity}x R$ {(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Nenhuma peça adicionada.</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-neutral-800 font-extrabold text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Total da Ordem:</span>
                  <span className="text-primary font-mono text-base">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Fast Links & Info */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 font-bold transition-all text-slate-700 dark:text-slate-300 active:scale-95"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Rastreio'}</span>
                </button>

                <Link
                  to={`/orders/${order.id}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-sm"
                >
                  <span>Abrir Detalhes</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Footer with fast Status Selector */}
            <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/60 shrink-0 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Criada em: {createdDate}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200/80 dark:bg-neutral-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
