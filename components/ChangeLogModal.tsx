import React from 'react';
import { X, Zap, Check, Rocket, Sparkles, History, CheckCircle2 } from 'lucide-react';
import { APP_VERSION } from '../constants';
import { BottomSheet } from './BottomSheet';

const CHANGELOG = [
  {
    version: '2.9.0',
    date: '01 Set 2026',
    changes: [
      {
        title: 'Sino de Notificações com Animação Vibrante & Radar Ping 🔔🚨',
        description:
          'O sino do cabeçalho agora vibra suavemente em loop contínuo quando há avisos operacionais pendentes, acompanhado de indicador vermelho vivo com efeito de pulso duplo (Radar Ping).',
        type: 'new',
      },
      {
        title: 'Refinamento do Dropdown de Filtros de Ordens 🎯',
        description:
          'Eliminação de corte de overflow e elevação para camada superior (z-100), permitindo abertura fluida e limpa do menu de períodos em qualquer resolução.',
        type: 'improvement',
      },
      {
        title: 'Busca Centralizada no Topo do Desktop 🔍',
        description:
          'Acesso limpo e consistente à Command Palette exclusivamente pelo cabeçalho superior desktop (Ctrl + K) e atalhos de teclado, despoluindo a barra lateral.',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.8.0',
    date: '01 Set 2026',
    changes: [
      {
        title: 'Command Palette Global (Ctrl + K) 🔍⚡',
        description:
          'Busca universal instantânea e centro de comandos de teclado para localizar Ordens de Serviço, Clientes, Produtos e executar ações com velocidade máxima na bancada.',
        type: 'new',
      },
      {
        title: 'Quick Peek Drawer (Espiar Ordem em Painel Lateral) 🗂️',
        description:
          'Inspecione cliente, defeito relatado, WhatsApp, peças e totais de qualquer ordem em um painel lateral deslizante sem sair da listagem e sem perder seus filtros aplicados.',
        type: 'new',
      },
      {
        title: 'Ações em Lote na Tabela Desktop (Bulk Actions) ☑️',
        description:
          'Seleção múltipla por checkboxes na tabela com barra flutuante de ações rápidas: exportação consolidada em CSV e alteração de status de múltiplos aparelhos de uma só vez.',
        type: 'new',
      },
      {
        title: 'Central de Avisos de Bancada no Header 🔔',
        description:
          'Notificações inteligentes para ordens sem atualização há mais de 48h, aparelhos prontos aguardando retirada e garantias prestes a expirar.',
        type: 'new',
      },
      {
        title: 'Central de Atalhos de Teclado (?) ⌨️',
        description:
          'Menu de referência rápida para navegação e produtividade na bancada (N para Nova OS, C para Cliente, V para PDV, / para busca, D para Dashboard).',
        type: 'new',
      },
      {
        title: 'Modais Desktop SaaS Profissional & Dual Experience 💻✨',
        description:
          'Redesenho completo de todos os modais da versão desktop no formato Data Table SaaS com cabeçalhos informativos e rodapé discreto, mantendo BottomSheets deslizantes ágeis no mobile.',
        type: 'improvement',
      },
      {
        title: 'Motor de Animações GSAP de Alta Performance (60fps) 🎬⚡',
        description:
          'Integração de contadores numéricos suaves (AnimatedNumber) para métricas de faturamento, custos, ordens e relatórios, além de transição fluida do logo da tela de login até a Sidebar.',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.7.0',
    date: '30 Ago 2026',
    changes: [
      {
        title: 'Padrão Bancada Mobile Pro em Clientes & Cadastro 👥📱',
        description:
          'Layout mobile ultra-compacto na listagem de clientes e formulários (Novo/Editar), com botões rápidos de WhatsApp, discagem direta e histórico de OS sem poluição visual.',
        type: 'new',
      },
      {
        title: 'Padrão Bancada Mobile Pro em Configurações ⚙️📱',
        description:
          'Subpáginas de Perfil, Segurança, Notificações e Sobre o Sistema organizadas em abas horizontais deslizantes com formulários de densidade compacta.',
        type: 'new',
      },
      {
        title: 'Padrão Bancada Mobile Pro em Relatórios 📊📱',
        description:
          'Painel financeiro mobile com cartões de KPIs em grade 2x2 (Faturamento, Lucro, Peças, Ticket Médio) e visualização direta de gráficos e extrato consolidado.',
        type: 'new',
      },
      {
        title: 'Alerta Clean White de Monitoramento de Garantias 🛡️',
        description:
          'Painel translúcido exclusivo na bancada desktop com indicador pulsante âmbar e acesso rápido às ordens com garantia expirada ou em prazo crítico.',
        type: 'improvement',
      },
      {
        title: 'Detalhes da OS Otimizado & Slim Stepper 🛠️',
        description:
          'Barra de status e recibo em 2 linhas, sem botões duplicados, e Slim Stepper horizontal ultra-compacto que economiza mais de 150px de altura.',
        type: 'improvement',
      },
      {
        title: 'Ícone Oficial do WhatsApp Integrado 💬',
        description:
          'Componente vetorial oficial do WhatsApp em alta resolução para envio direto de mensagens e atualizações de OS aos clientes com 1 clique.',
        type: 'improvement',
      },
      {
        title: 'Alteração Rápida de Status via BottomSheet & Portal 🔄',
        description:
          'Menu flutuante no desktop e BottomSheet deslizante no celular ao tocar na badge de status da ordem.',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.6.0',
    date: '04 Jun 2026',
    changes: [
      {
        title: 'Design Clean White SaaS Profissional 🎨',
        description:
          'Padronização visual completa no estilo SaaS Profissional! Telas de Dashboard, Ordens de Serviço, Clientes, Garantias, Relatórios com PDF Fintech, Formulários e Configurações integrados com acabamento premium.',
        type: 'new',
      },
      {
        title: 'Exportação em PDF Fintech Grade 📄',
        description:
          'Relatório em PDF com o logotipo oficial da HcCell, tabela consolidada de meios de pagamento, detalhamento de bancada e código HASH de auditoria.',
        type: 'new',
      },
      {
        title: 'Pré-Carregamento Premium 🌀',
        description:
          'Nova animação de login! A logo da HC CELL se preenche com efeito líquido neon antes de deslizar suavemente para cima, revelando o painel carregado em segundo plano.',
        type: 'improvement',
      },
      {
        title: 'Modais de Estatísticas Refinados ✨',
        description:
          'Redesenhamos os modais com pílulas coloridas de status, ícones dinâmicos por contexto (celular, dinheiro, caixa, garantias) e animações táteis elásticas de foco.',
        type: 'improvement',
      },
      {
        title: 'MobileNav & Encaixe Circular 📱',
        description:
          'Barra inferior unida às laterais e base da tela estilo app nativo, com cantos arredondados translúcidos, botão de "+" em encaixe circular e menu "Mais" em grade compacta de 3 colunas.',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.5.0',
    date: '22 Abr 2026',
    changes: [
      {
        title: 'Garantia Pro 🛡️',
        description:
          'Novo sistema de descarte em lote! Agora você pode limpar todas as notificações de uma vez sem travamentos ou "piscadas" na tela.',
        type: 'new',
      },
      {
        title: 'Mobile Dashboard 📱',
        description:
          'Estatísticas agora abrem em um Bottom Sheet fluido no celular. Otimizamos o espaço ocultando cards secundários e ajustando fontes para evitar quebras.',
        type: 'improvement',
      },
      {
        title: 'Supabase Sync ☁️',
        description:
          'Sincronização total das garantias com o banco de dados. Suas notificações descartadas agora são lembradas em qualquer dispositivo.',
        type: 'new',
      },
    ],
  },
  {
    version: '2.4.0',
    date: '10 Abr 2026',
    changes: [
      {
        title: 'Pagamentos Híbridos Premium 💳💰',
        description:
          'Agora você pode dividir o pagamento de uma Ordem de Serviço em várias formas! Receba R$50 no Pix e o restante em Cartão sem problemas.',
        type: 'new',
      },
      {
        title: 'Detalhes de Parcelamento',
        description:
          'Pagamentos em Cartão de Crédito passam a exibir a quebra de valor (ex: 2x de R$ 70,00) em recibos e modais com seletor de parcelas.',
        type: 'improvement',
      },
    ],
  },
  {
    version: '2.3.0',
    date: '17 Mar 2026',
    changes: [
      {
        title: 'Configurações Desktop Pro 🖥️',
        description:
          'Nova interface premium para computadores com barra lateral, indicador fluido e transições suaves entre abas.',
        type: 'new',
      },
      {
        title: 'Relatórios & PDFs 📊',
        description:
          'Corrigimos a repetição do resumo financeiro em todas as páginas do PDF. Impressão de relatórios com melhor alinhamento visual.',
        type: 'improvement',
      },
    ],
  },
];

interface ChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  showHistory?: boolean;
}

export const ChangeLogModal: React.FC<ChangeLogModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  showHistory: initialShowHistory = false,
}) => {
  const [viewHistory, setViewHistory] = React.useState(initialShowHistory);

  React.useEffect(() => {
    if (isOpen) setViewHistory(initialShowHistory);
  }, [isOpen, initialShowHistory]);

  if (!isOpen) return null;

  const versionsToShow = viewHistory
    ? CHANGELOG
    : [CHANGELOG.find((v) => v.version === APP_VERSION) || CHANGELOG[0]];

  const Content = () => (
    <div className="space-y-6">
      {versionsToShow.map((ver) => (
        <div key={ver.version} className="relative">
          {viewHistory && (
            <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-200/80 dark:border-neutral-800 sticky top-0 bg-white dark:bg-surface-dark z-10 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-white">
                  v{ver.version}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                  {ver.date}
                </span>
              </div>
              {ver.version === APP_VERSION && (
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Atual
                </span>
              )}
            </div>
          )}

          <div className="space-y-3.5">
            {ver.changes.map((update, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/70 dark:border-neutral-800"
              >
                <div
                  className={`mt-0.5 shrink-0 size-8 rounded-xl flex items-center justify-center font-bold text-xs ${update.type === 'new'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                >
                  {update.type === 'new' ? <Zap size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {update.title}
                    </h3>
                    {update.type === 'new' && (
                      <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                        Novo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {update.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop SaaS Modal */}
      <div className="hidden md:flex fixed inset-0 z-[999] items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-surface-dark w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-neutral-800 animate-in zoom-in-95 duration-200 relative max-h-[82vh] flex flex-col">
          {/* SaaS Header */}
          <div className="bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                {viewHistory ? <History size={20} /> : <Sparkles size={20} />}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {viewHistory ? 'Histórico de Versões' : 'Notas de Atualização'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    v{APP_VERSION}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {viewHistory ? 'Linha do Tempo de Recursos' : 'O que há de novo no HcCell System'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-neutral-700 transition-all active:scale-95"
              title="Fechar (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-surface-dark">
            <Content />
          </div>

          {/* SaaS Footer */}
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-neutral-900/80 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
            {viewHistory ? (
              <button
                type="button"
                onClick={() => setViewHistory(false)}
                className="text-xs font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors flex items-center gap-1.5"
              >
                ← Voltar para versão atual
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewHistory(true)}
                className="text-xs font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <History size={14} />
                <span>Ver histórico completo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-all active:scale-95"
            >
              {viewHistory ? 'Fechar Histórico' : 'Entendi, vamos lá!'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen && window.innerWidth < 768}
        onClose={onClose}
        title={viewHistory ? 'Histórico de Atualizações' : 'Novas Atualizações'}
      >
        <div className="space-y-6">
          <Content />
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
            >
              {viewHistory ? 'FECHAR HISTÓRICO' : 'ENTENDI, VAMOS LÁ!'}
            </button>
            {!viewHistory && (
              <button
                type="button"
                onClick={() => setViewHistory(true)}
                className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-center"
              >
                Ver histórico completo
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
