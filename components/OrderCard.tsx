import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ServiceOrder, Client, OrderStatus } from '../types';
import { OrderKebabMenu } from './OrderKebabMenu';
import { WhatsAppIcon } from './WhatsAppIcon';

interface OrderCardProps {
  order: ServiceOrder;
  client?: Client | null;
  onWhatsApp?: (e: React.MouseEvent, order: ServiceOrder) => void;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  client,
  onWhatsApp,
  className = '',
}) => {
  const clientName = client?.name || 'Cliente Geral';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWhatsApp) {
      onWhatsApp(e, order);
    } else if (client?.phone) {
      let message = `Olá ${clientName}, aqui é da HcCell Assistência Técnica. Sobre seu aparelho ${order.deviceModel}: `;
      const trackingUrl = `${window.location.origin}/#/tracking?id=${
        order.displayId || order.id.slice(0, 8)
      }`;
      if (order.status === OrderStatus.COMPLETED) {
        message += `está pronto e concluído! Total: R$ ${order.total.toFixed(2)}.`;
      } else {
        message += `gostaria de falar sobre a OS #${
          order.displayId || order.id.slice(0, 8)
        }.`;
      }
      message += `\n\nAcompanhe aqui: ${trackingUrl}`;
      const phone = client.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const MotionLink = motion(Link);

  return (
    <MotionLink
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      to={`/orders/${order.id}`}
      key={order.id}
      className={`bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 shadow-sm transition-all flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
            #{order.displayId || order.id.slice(0, 8)} •{' '}
            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })}
          </span>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 truncate">
            {order.serviceType === 'VENDA_DIRETA'
              ? 'Venda de Produto'
              : order.deviceModel}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {clientName}
          </span>
        </div>

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <OrderKebabMenu order={order} mode="badge" />
        </div>
      </div>

      {(order.serviceType === 'VENDA_DIRETA' ||
        (order.issueDescription && order.issueDescription.trim().length > 0)) && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800/60">
          {order.serviceType === 'VENDA_DIRETA'
            ? order.selectedProducts?.map((p) => `${p.quantity}x ${p.name}`).join(', ') ||
              'Produtos Diversos'
            : order.issueDescription}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {client?.phone && (
            <button
              onClick={handleWhatsAppClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/20 active:scale-95"
            >
              <WhatsAppIcon size={14} color="#10b981" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 font-medium">Total:</span>
          <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
            R$ {order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </MotionLink>
  );
};
