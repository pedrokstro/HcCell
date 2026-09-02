import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MoreVertical, 
    Check, 
    Clock, 
    Play, 
    PackageCheck, 
    CheckCircle2, 
    XCircle, 
    ChevronDown,
    Loader2
} from 'lucide-react';
import { OrderStatus, ServiceOrder, MovementType } from '../types';
import { useApp } from '../store';
import { BottomSheet } from './BottomSheet';

interface OrderKebabMenuProps {
    order: ServiceOrder;
    mode?: 'badge' | 'kebab';
    className?: string;
}

export const OrderKebabMenu: React.FC<OrderKebabMenuProps> = ({
    order,
    mode = 'badge',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left?: number; right?: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { updateOrder, products, updateProduct, addProductMovement } = useApp();

    // Status config with modern colors & icons
    const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; bg: string; border: string; dot: string }> = {
        [OrderStatus.PENDING]: {
            label: 'Pendente',
            icon: <Clock size={14} className="text-amber-500 shrink-0" />,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            dot: 'bg-amber-500'
        },
        [OrderStatus.IN_PROGRESS]: {
            label: 'Em Andamento',
            icon: <Play size={14} className="text-sky-500 shrink-0" />,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
            dot: 'bg-sky-500'
        },
        [OrderStatus.WAITING_WITHDRAWAL]: {
            label: 'Aguard. Retirada',
            icon: <PackageCheck size={14} className="text-cyan-500 shrink-0" />,
            color: 'text-cyan-600 dark:text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            dot: 'bg-cyan-500'
        },
        [OrderStatus.COMPLETED]: {
            label: 'Concluído',
            icon: <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            dot: 'bg-emerald-500'
        },
        [OrderStatus.CANCELLED]: {
            label: 'Cancelado',
            icon: <XCircle size={14} className="text-rose-500 shrink-0" />,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            dot: 'bg-rose-500'
        }
    };

    const currentConfig = statusConfig[order.status] || {
        label: order.status,
        icon: <Clock size={14} className="text-slate-400 shrink-0" />,
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        dot: 'bg-slate-400'
    };

    // Calculate fixed screen coordinates for the portal menu to avoid clipping/overflow
    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = 220; // approximate menu height
        const menuWidth = 176;  // w-44 is 176px

        let top = rect.bottom + 6;
        // If not enough space below, open upward
        if (rect.bottom + menuHeight > window.innerHeight && rect.top > menuHeight) {
            top = rect.top - menuHeight - 6;
        }

        // Horizontal positioning: align right if close to right edge, else align left
        if (rect.left + menuWidth > window.innerWidth - 16) {
            setMenuPosition({
                top,
                right: window.innerWidth - rect.right
            });
        } else {
            setMenuPosition({
                top,
                left: rect.left
            });
        }
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
            updatePosition();
        }
        setIsOpen(!isOpen);
    };

    // Listen to scroll and resize on desktop only to close or reposition floating menu
    useEffect(() => {
        if (!isOpen) return;
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;

        const handleScrollOrResize = () => {
            setIsOpen(false);
        };

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current && 
                !menuRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleStatusSelect = async (e: React.MouseEvent, newStatus: OrderStatus) => {
        e.preventDefault();
        e.stopPropagation();

        if (newStatus === order.status || isUpdating) {
            setIsOpen(false);
            return;
        }

        try {
            setIsUpdating(true);

            // Stock management for cancellations
            if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
                if (order.selectedProducts && order.selectedProducts.length > 0) {
                    for (const item of order.selectedProducts) {
                        if (item.productId.startsWith('manual-')) continue;
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            await updateProduct({
                                ...product,
                                quantity: product.quantity + item.quantity
                            });
                            await addProductMovement({
                                productId: product.id,
                                type: MovementType.ENTRY,
                                quantityChange: item.quantity,
                                note: `Estoque devolvido (OS Cancelada: #${order.displayId || order.id.slice(0, 8)})`
                            });
                        }
                    }
                }
            } else if (order.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
                if (order.selectedProducts && order.selectedProducts.length > 0) {
                    for (const item of order.selectedProducts) {
                        if (item.productId.startsWith('manual-')) continue;
                        const product = products.find(p => p.id === item.productId);
                        if (product) {
                            await updateProduct({
                                ...product,
                                quantity: Math.max(0, product.quantity - item.quantity)
                            });
                            await addProductMovement({
                                productId: product.id,
                                type: MovementType.EXIT,
                                quantityChange: -item.quantity,
                                note: `Estoque re-deduzido (OS Reativada: #${order.displayId || order.id.slice(0, 8)})`
                            });
                        }
                    }
                }
            }

            const updatedOrder: ServiceOrder = {
                ...order,
                status: newStatus
            };

            if (newStatus === OrderStatus.COMPLETED) {
                if (!order.executionDate) {
                    updatedOrder.executionDate = new Date().toISOString();
                }
                if (!order.noWarranty && !order.warrantyEnd) {
                    const date = new Date();
                    date.setDate(date.getDate() + 90);
                    updatedOrder.warrantyEnd = date.toISOString();
                }
            }

            await updateOrder(updatedOrder);
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        } finally {
            setIsUpdating(false);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
            {/* Trigger Mode 1: Status Badge */}
            {mode === 'badge' && (
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer select-none active:scale-95 shadow-2xs hover:brightness-95 ${currentConfig.bg} ${currentConfig.color} ${currentConfig.border}`}
                    title="Clique para alterar o status da ordem"
                >
                    {isUpdating ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dot} ${order.status === OrderStatus.PENDING ? 'animate-pulse' : ''}`} />
                    )}
                    <span>{currentConfig.label}</span>
                    <ChevronDown size={11} className={`opacity-60 group-hover:opacity-100 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Trigger Mode 2: Kebab Button (3 Pontinhos) */}
            {mode === 'kebab' && (
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`size-8 flex items-center justify-center rounded-lg border transition-all shadow-2xs active:scale-95 ${
                        isOpen 
                            ? 'bg-primary text-white border-primary shadow-xs' 
                            : 'bg-white dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700 border-slate-200/70 dark:border-neutral-700'
                    }`}
                    title="Alterar Status da OS"
                >
                    {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <MoreVertical size={15} />
                    )}
                </button>
            )}

            {/* Mobile BottomSheet View (Padrão Bancada Mobile Pro) */}
            <BottomSheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={`Alterar Status • #${order.displayId || order.id.slice(0, 8)}`}
            >
                <div className="flex flex-col gap-2 pt-2">
                    {Object.values(OrderStatus).map((status) => {
                        const cfg = statusConfig[status];
                        const isCurrent = order.status === status;

                        return (
                            <button
                                key={status}
                                type="button"
                                onClick={(e) => handleStatusSelect(e, status)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all text-left active:scale-[0.98] ${
                                    isCurrent
                                        ? `${cfg.bg} ${cfg.color} border-2 ${cfg.border} shadow-xs`
                                        : 'bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-100 dark:border-neutral-800'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`size-8 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                                        {cfg.icon}
                                    </div>
                                    <span className="font-extrabold text-xs sm:text-sm">{cfg.label}</span>
                                </div>
                                {isCurrent && (
                                    <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                                        <Check size={14} className="stroke-[3]" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </BottomSheet>

            {/* Desktop Portal Floating Menu (hidden on mobile) */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                top: menuPosition.top,
                                ...(menuPosition.left !== undefined ? { left: menuPosition.left } : {}),
                                ...(menuPosition.right !== undefined ? { right: menuPosition.right } : {}),
                                zIndex: 99999
                            }}
                            className="hidden md:block w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-neutral-800 p-1.5 backdrop-blur-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Alterar Status
                                </span>
                                <span className="text-[9px] font-mono font-bold text-slate-400">
                                    #{order.displayId || order.id.slice(0, 8)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-0.5">
                                {Object.values(OrderStatus).map((status) => {
                                    const cfg = statusConfig[status];
                                    const isCurrent = order.status === status;

                                    return (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={(e) => handleStatusSelect(e, status)}
                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left ${
                                                isCurrent
                                                    ? `${cfg.bg} ${cfg.color} border ${cfg.border} shadow-2xs`
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800/80 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {cfg.icon}
                                                <span className="truncate">{cfg.label}</span>
                                            </div>
                                            {isCurrent && (
                                                <Check size={13} className="stroke-[3] shrink-0 ml-1.5" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
