import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { OrderStatus } from '../types';
import {
  Search,
  Wrench,
  UserPlus,
  Plus,
  Users,
  Package,
  DollarSign,
  FileText,
  Settings,
  Moon,
  Sun,
  Keyboard,
  ArrowRight,
  Sparkles,
  Command,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenShortcuts,
}) => {
  const { orders, clients, products, darkMode, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // System Action Items
  const systemActions = useMemo(() => [
    {
      id: 'action-new-order',
      type: 'action' as const,
      title: 'Nova Ordem de Serviço',
      category: 'Ações Rápidas',
      icon: Plus,
      shortcut: 'N',
      action: () => {
        navigate('/orders/new');
        onClose();
      },
    },
    {
      id: 'action-new-client',
      type: 'action' as const,
      title: 'Cadastrar Novo Cliente',
      category: 'Ações Rápidas',
      icon: UserPlus,
      shortcut: 'C',
      action: () => {
        navigate('/clients/new');
        onClose();
      },
    },
    {
      id: 'action-pos',
      type: 'action' as const,
      title: 'Ponto de Vendas (PDV Balcão)',
      category: 'Ações Rápidas',
      icon: DollarSign,
      shortcut: 'V',
      action: () => {
        navigate('/sales');
        onClose();
      },
    },
    {
      id: 'action-reports',
      type: 'action' as const,
      title: 'Relatórios & DRE Financeiro',
      category: 'Navegação',
      icon: FileText,
      action: () => {
        navigate('/reports');
        onClose();
      },
    },
    {
      id: 'action-clients',
      type: 'action' as const,
      title: 'Base de Clientes',
      category: 'Navegação',
      icon: Users,
      action: () => {
        navigate('/clients');
        onClose();
      },
    },
    {
      id: 'action-inventory',
      type: 'action' as const,
      title: 'Gestão de Estoque & Peças',
      category: 'Navegação',
      icon: Package,
      action: () => {
        navigate('/inventory');
        onClose();
      },
    },
    {
      id: 'action-settings',
      type: 'action' as const,
      title: 'Configurações do Sistema',
      category: 'Navegação',
      icon: Settings,
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
    {
      id: 'action-theme',
      type: 'action' as const,
      title: darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro',
      category: 'Preferências',
      icon: darkMode ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'action-shortcuts',
      type: 'action' as const,
      title: 'Ver Todos os Atalhos de Teclado',
      category: 'Ajuda',
      icon: Keyboard,
      shortcut: '?',
      action: () => {
        onClose();
        if (onOpenShortcuts) onOpenShortcuts();
      },
    },
  ], [darkMode, navigate, onClose, onOpenShortcuts, toggleTheme]);

  // Dynamic search results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return systemActions;
    }

    const matchedActions = systemActions.filter(
      (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );

    const matchedOrders = orders
      .filter((o) => {
        const client = clients.find((c) => c.id === o.clientId);
        return (
          o.deviceModel.toLowerCase().includes(q) ||
          (o.displayId && o.displayId.toLowerCase().includes(q)) ||
          o.id.toLowerCase().includes(q) ||
          (client && client.name.toLowerCase().includes(q)) ||
          (o.issueDescription && o.issueDescription.toLowerCase().includes(q))
        );
      })
      .slice(0, 6)
      .map((o) => {
        const client = clients.find((c) => c.id === o.clientId);
        return {
          id: `order-${o.id}`,
          type: 'order' as const,
          title: o.deviceModel,
          subtitle: `OS #${o.displayId || o.id.slice(0, 8)} • ${client?.name || 'Cliente Geral'}`,
          category: 'Ordens de Serviço',
          icon: Smartphone,
          badge: o.status,
          total: o.total,
          action: () => {
            navigate(`/orders/${o.id}`);
            onClose();
          },
        };
      });

    const matchedClients = clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.cpf && c.cpf.includes(q))
      )
      .slice(0, 4)
      .map((c) => ({
        id: `client-${c.id}`,
        type: 'client' as const,
        title: c.name,
        subtitle: `${c.phone ? `Tel: ${c.phone}` : ''} ${c.cpf ? `• CPF: ${c.cpf}` : ''}`.trim(),
        category: 'Clientes',
        icon: Users,
        action: () => {
          navigate(`/clients/${c.id}/edit`);
          onClose();
        },
      }));

    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map((p) => ({
        id: `prod-${p.id}`,
        type: 'product' as const,
        title: p.name,
        subtitle: `Estoque: ${p.quantity} un • R$ ${p.priceSell.toFixed(2)}`,
        category: 'Estoque / Produtos',
        icon: Package,
        action: () => {
          navigate(`/inventory/edit/${p.id}`);
          onClose();
        },
      }));

    return [...matchedActions, ...matchedOrders, ...matchedClients, ...matchedProducts];
  }, [query, systemActions, orders, clients, products, navigate, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    // Keep selected item visible in scroll
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/80 dark:border-neutral-800 flex flex-col max-h-[75vh]"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-neutral-800 gap-3 shrink-0 bg-slate-50/50 dark:bg-neutral-900/50">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="O que você procura? Digite uma OS, cliente, peça ou comando..."
                className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={15} />
                </button>
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold bg-slate-200/70 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                  ESC
                </span>
              </div>
            </div>

            {/* Results List */}
            <div ref={listRef} className="overflow-y-auto custom-scrollbar p-2 flex-1 space-y-1">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'hover:bg-slate-50 dark:hover:bg-neutral-900/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.title}
                          </span>
                          {'subtitle' in item && item.subtitle && (
                            <span
                              className={`text-[11px] truncate ${
                                isSelected ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {'badge' in item && item.badge && (
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {'shortcut' in item && item.shortcut && (
                          <kbd
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-neutral-700'
                            }`}
                          >
                            {item.shortcut}
                          </kbd>
                        )}
                        {'category' in item && !('shortcut' in item) && (
                          <span
                            className={`text-[10px] font-semibold ${
                              isSelected ? 'text-white/70' : 'text-slate-400'
                            }`}
                          >
                            {item.category}
                          </span>
                        )}
                        <ChevronRight
                          size={14}
                          className={isSelected ? 'text-white' : 'text-slate-300 dark:text-neutral-700'}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Search size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                    Nenhum resultado encontrado
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tente buscar por outro termo ou navegue pelas ações do sistema.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-neutral-900/60 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-slate-200/80 dark:bg-neutral-800 px-1 rounded text-[10px] text-slate-600 dark:text-slate-400">
                    ↑↓
                  </kbd>{' '}
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-slate-200/80 dark:bg-neutral-800 px-1 rounded text-[10px] text-slate-600 dark:text-slate-400">
                    ↵
                  </kbd>{' '}
                  Abrir
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px]">
                <Command size={11} /> <strong>HcCell Command Center</strong>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
