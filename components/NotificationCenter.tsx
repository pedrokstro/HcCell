import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import {
  Bell,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  X,
  Check,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter: React.FC = () => {
  const { orders, clients } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hccell_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute operational alerts
  const notifications = useMemo(() => {
    const now = new Date();
    const list: Array<{
      id: string;
      type: 'stalled' | 'warranty' | 'withdrawal';
      title: string;
      description: string;
      orderId: string;
      date: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    orders.forEach((order) => {
      const client = clients.find((c) => c.id === order.clientId);
      const clientName = client?.name || 'Cliente';
      const createdDate = new Date(order.createdAt);
      const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

      // 1. Ordens paradas há mais de 48h em atendimento
      if (
        (order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS) &&
        hoursSinceCreation > 48
      ) {
        list.push({
          id: `stalled-${order.id}`,
          type: 'stalled',
          title: `OS #${order.displayId || order.id.slice(0, 8)} sem atualização`,
          description: `${order.deviceModel} (${clientName}) está em bancada há mais de ${Math.floor(hoursSinceCreation / 24)} dias.`,
          orderId: order.id,
          date: createdDate.toLocaleDateString('pt-BR'),
          priority: hoursSinceCreation > 96 ? 'high' : 'medium',
        });
      }

      // 2. Ordens prontas aguardando retirada há mais de 24h
      if (order.status === OrderStatus.WAITING_WITHDRAWAL && hoursSinceCreation > 24) {
        list.push({
          id: `withdrawal-${order.id}`,
          type: 'withdrawal',
          title: `Aparelho aguardando retirada`,
          description: `${order.deviceModel} de ${clientName} está pronto na bancada para entrega.`,
          orderId: order.id,
          date: createdDate.toLocaleDateString('pt-BR'),
          priority: 'low',
        });
      }

      // 3. Garantias prestes a vencer nos próximos 3 dias
      if (order.warrantyEnd) {
        const warrantyDate = new Date(order.warrantyEnd);
        const daysToWarranty = (warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (daysToWarranty >= 0 && daysToWarranty <= 3) {
          list.push({
            id: `warranty-${order.id}`,
            type: 'warranty',
            title: `Garantia expirando em ${Math.ceil(daysToWarranty)} dia(s)`,
            description: `Garantia da OS #${order.displayId || order.id.slice(0, 8)} (${order.deviceModel}) encerra em ${warrantyDate.toLocaleDateString('pt-BR')}.`,
            orderId: order.id,
            date: warrantyDate.toLocaleDateString('pt-BR'),
            priority: 'medium',
          });
        }
      }
    });

    return list;
  }, [orders, clients]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem('hccell_read_notifications', JSON.stringify(allIds));
  };

  const handleNotificationClick = (orderId: string, notifId: string) => {
    if (!readIds.includes(notifId)) {
      const updated = [...readIds, notifId];
      setReadIds(updated);
      localStorage.setItem('hccell_read_notifications', JSON.stringify(updated));
    }
    setIsOpen(false);
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
        title="Central de Notificações de Bancada"
      >
        <motion.div
          animate={
            unreadCount > 0
              ? {
                  rotate: [0, -15, 15, -12, 12, -6, 6, 0],
                  transition: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: 'easeInOut',
                  },
                }
              : { rotate: 0 }
          }
          className="flex items-center justify-center origin-top"
        >
          <Bell size={18} />
        </motion.div>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark" />
          </span>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 sm:left-auto sm:right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-surface-dark shadow-2xl border border-slate-200/80 dark:border-neutral-800 z-[999] overflow-hidden flex flex-col max-h-[480px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                  Avisos de Bancada
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    {unreadCount} novos
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Check size={13} />
                  Marcar lidos
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-neutral-800/80 p-1 flex-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  const isRead = readIds.includes(notif.id);

                  let Icon = Clock;
                  let iconBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

                  if (notif.type === 'stalled') {
                    Icon = AlertTriangle;
                    iconBg = notif.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                  } else if (notif.type === 'withdrawal') {
                    Icon = CheckCircle2;
                    iconBg = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
                  } else if (notif.type === 'warranty') {
                    Icon = ShieldAlert;
                    iconBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                  }

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.orderId, notif.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-neutral-900/60 ${
                        isRead ? 'opacity-65' : 'bg-slate-50/40 dark:bg-neutral-900/30 font-medium'
                      }`}
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${iconBg}`}>
                        <Icon size={16} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </span>
                          {!isRead && (
                            <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                      </div>

                      <ChevronRight size={14} className="text-slate-300 dark:text-neutral-700 shrink-0 mt-2" />
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500/60" />
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    Bancada 100% em dia!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nenhuma ordem estagnada ou garantia crítica no momento.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
