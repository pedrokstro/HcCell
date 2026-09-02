import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Command, Search, Plus, UserPlus, DollarSign, ArrowUpDown, CornerDownLeft } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcutGroups = [
    {
      title: 'Navegação Global & Busca',
      shortcuts: [
        { keys: ['Ctrl', 'K'], label: 'Abrir Command Palette / Busca Global' },
        { keys: ['?'], label: 'Exibir este menu de atalhos' },
        { keys: ['/'], label: 'Focar na barra de pesquisa da página' },
        { keys: ['D'], label: 'Ir para o Painel Geral (Dashboard)' },
        { keys: ['Esc'], label: 'Fechar qualquer modal, gaveta ou menu aberto' },
      ],
    },
    {
      title: 'Ações Rápidas de Bancada',
      shortcuts: [
        { keys: ['N'], label: 'Criar Nova Ordem de Serviço' },
        { keys: ['C'], label: 'Cadastrar Novo Cliente' },
        { keys: ['V'], label: 'Abrir Ponto de Vendas (PDV Balcão)' },
        { keys: ['Espaço'], label: 'Espiar OS selecionada na tabela (Quick Peek)' },
      ],
    },
    {
      title: 'Navegação por Teclado',
      shortcuts: [
        { keys: ['↑', '↓'], label: 'Navegar entre itens em listas e menus' },
        { keys: ['Enter'], label: 'Executar item selecionado ou abrir registro' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/80 dark:border-neutral-800 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Keyboard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Atalhos de Teclado
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    Produtividade máxima na bancada e balcão
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {shortcutGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group.title}
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-neutral-800/80 rounded-xl border border-slate-200/80 dark:border-neutral-800 overflow-hidden bg-slate-50/40 dark:bg-neutral-900/40">
                    {group.shortcuts.map((sc, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white dark:hover:bg-neutral-900 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {sc.label}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {sc.keys.map((k, kIdx) => (
                            <kbd
                              key={kIdx}
                              className="px-2 py-1 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold font-mono rounded-md border border-slate-200 dark:border-neutral-700 shadow-2xs"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-neutral-900/60 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>Pressione <kbd className="font-mono font-bold text-slate-600 dark:text-slate-300">ESC</kbd> para fechar</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all active:scale-95"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
