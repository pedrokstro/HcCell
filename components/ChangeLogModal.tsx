import React from 'react';
import { X, Zap, Check, Rocket, Sparkles, History } from 'lucide-react';
import { APP_VERSION } from '../constants';
import { BottomSheet } from './BottomSheet';

const CHANGELOG = [
    {
        version: '2.6.0',
        date: '04 Jun 2026',
        changes: [
            {
                title: "Pré-Carregamento Premium 🌀",
                description: "Nova animação de login! A logo da HC CELL se preenche com efeito líquido neon antes de deslizar suavemente para cima, revelando o painel já carregado em segundo plano.",
                type: "new"
            },
            {
                title: "Modais de Estatísticas Refinados ✨",
                description: "Redesenhamos os modais com pílulas coloridas de status, ícones dinâmicos por contexto (celular, dinheiro, caixa, garantias) e animações táteis elásticas de foco.",
                type: "improvement"
            },
            {
                title: "MobileNav & Encaixe Circular 📱",
                description: "Barra inferior unida às laterais e base da tela estilo app nativo, com cantos arredondados translúcidos, botão de '+' em encaixe circular e menu 'Mais' em grade compacta de 3 colunas respeitando o Safe Area.",
                type: "improvement"
            },
            {
                title: "Configurações Mobile Premium ⚙️",
                description: "Refatoração completa de UX/UI das subpáginas de configuração no celular! Cabeçalho resiliente que impede sobreposição, avatares centralizados com bordas neon, previews de tema Claro/Escuro de alta fidelidade e Toasts de sucesso imediatos nas notificações.",
                type: "improvement"
            },
            {
                title: "Segurança Otimizada 🔒",
                description: "Remoção definitiva do modo Cadastro (SignUp) no login para foco total no técnico, com ícones internos nos inputs e design de alertas em glassmorphism.",
                type: "improvement"
            },
            {
                title: "Paginação de Clientes 📑",
                description: "Adicionada paginação idêntica à de ordens na listagem de clientes (20 por página) e corrigida a duplicação visual de paginação no desktop.",
                type: "new"
            }
        ]
    },
    {
        version: '2.5.0',
        date: '22 Abr 2026',
        changes: [
            {
                title: "Garantia Pro 🛡️",
                description: "Novo sistema de descarte em lote! Agora você pode limpar todas as notificações de uma vez sem travamentos ou 'piscadas' na tela.",
                type: "new"
            },
            {
                title: "Mobile Dashboard 📱",
                description: "Estatísticas agora abrem em um Bottom Sheet fluido no celular. Otimizamos o espaço ocultando cards secundários e ajustando fontes para evitar quebras.",
                type: "improvement"
            },
            {
                title: "Supabase Sync ☁️",
                description: "Sincronização total das garantias com o banco de dados. Suas notificações descartadas agora são lembradas em qualquer dispositivo.",
                type: "new"
            },
            {
                title: "Página de Garantias 📑",
                description: "Nova seção dedicada no menu lateral para gerenciar todas as suas garantias ativas e vencidas com filtros inteligentes e busca rápida.",
                type: "new"
            },
            {
                title: "Visual Premium ✨",
                description: "Refinamos o hover dos cards de estatísticas e transformamos os botões em 'Chips' táteis, perfeitos para telas touch.",
                type: "improvement"
            }
        ]
    },
    {
        version: '2.4.0',
        date: '10 Abr 2026',
        changes: [
            {
                title: "Pagamentos Híbridos Premium 💳💰",
                description: "Agora você pode dividir o pagamento de uma Ordem de Serviço em várias formas! Receba R$50 no Pix e o restante Cartão de Crédito sem problemas.",
                type: "new"
            },
            {
                title: "Detalhes de Parcelamento",
                description: "Pagamentos em Cartão de Crédito agora passam a exibir a quebra de valor (ex: 2x de R$ 70,00) em recibos, telas e modais, refinado com um novo dropdown premium.",
                type: "improvement"
            },
            {
                title: "Histórico de Ordens Turbo 🚀",
                description: "Novos botões de ação super rápidos na tabela para chamar seu cliente no WhatsApp, editar ou visualizar em um clique! Agora com Avatar do cliente, OS ID e selos de status de pagamento.",
                type: "new"
            }
        ]
    },
    {
        version: '2.3.0',
        date: '17 Mar 2026',
        changes: [
            {
                title: "Configurações Desktop Pro 🖥️",
                description: "Nova interface premium para computadores com barra lateral, indicador fluido e transições suaves entre abas.",
                type: "new"
            },
            {
                title: "Relatórios & PDFs 📊",
                description: "Corrigimos a repetição do resumo financeiro em todas as páginas do PDF. Impressão de relatórios agora impecável.",
                type: "improvement"
            },
            {
                title: "LayoutID System ✨",
                description: "Navegação visualmente conectada com indicadores que deslizam suavemente para a posição selecionada.",
                type: "new"
            }
        ]
    },
    {
        version: '2.2.0',
        date: '15 Mar 2026',
        changes: [
            {
                title: "Experiência Fluida ✨",
                description: "Novo sistema de animações com Framer Motion. Cards e botões agora respondem ao toque com efeitos táteis e transições elásticas.",
                type: "new"
            },
            {
                title: "Ações Rápidas no Mobile ⚡",
                description: "WhatsApp, Edição e Ajuste de Estoque direto nos cards! Menos cliques para suas tarefas mais comuns.",
                type: "new"
            },
            {
                title: "Recibos & Preview 📄",
                description: "Nova área de pré-visualização de recibos no Desktop. Configure e visualize o documento antes de imprimir em A4 ou Térmica.",
                type: "improvement"
            },
            {
                title: "Dashboard mais Limpo",
                description: "Otimizamos a tela inicial no mobile para focar no que importa, ocultando estatísticas secundárias para agilizar sua visão.",
                type: "improvement"
            }
        ]
    },
    {
        version: '2.1.1',
        date: '14 Mar 2026',
        changes: [
            {
                title: "UI/UX Pro Max 🚀",
                description: "Novo sistema de calendário e seletores de data premium. Design circular, animações suaves e experiência otimizada para Desktop e Mobile.",
                type: "new"
            },
            {
                title: "Navegação Mobile Inteligente",
                description: "Barra de navegação redesenhada com 5 botões estratégicos e menu 'Mais' para acesso rápido a Clientes, Estoque e Categorias.",
                type: "new"
            },
            {
                title: "Gestão de OS e PDV",
                description: "Novo status 'Aguardando Retirada', correção de scroll no PDV mobile e otimização total do layout para celulares.",
                type: "improvement"
            },
            {
                title: "Busca em Seletores",
                description: "Adicionamos filtros de busca manual dentro de todos os novos seletores customizados, facilitando o gerenciamento de grandes listas.",
                type: "new"
            }
        ]
    },
    {
        version: '2.0.4',
        date: '03 Mar 2026',
        changes: [
            {
                title: "Nova Regra de Garantia",
                description: "A garantia de 90 dias agora começa a contar automaticamente a partir do momento em que a Ordem de Serviço é marcada como 'Concluída', garantindo maior precisão nos prazos.",
                type: "new"
            },
            {
                title: "Painel Dinâmico e Sidebar Retrátil",
                description: "A barra lateral agora pode ser encolhida para você ganhar mais espaço de tela, lembrando a sua preferência. Além disso, os cards do painel inicial ganharam novas animações.",
                type: "new"
            }
        ]
    },
    {
        version: '2.0.2',
        date: '12 Jan 2026',
        changes: [
            {
                title: "Persistência Inteligente do Carrinho",
                description: "Não perca mais suas vendas! Os itens do PDV agora são salvos automaticamente se você sair da tela. Também adicionamos um botão para limpar o carrinho rapidamente.",
                type: "new"
            },
            {
                title: "Refinamentos de Interface",
                description: "Ajustes de alinhamento nas Configurações e melhorias gerais de usabilidade.",
                type: "improvement"
            }
        ]
    },
    {
        version: '2.0.1',
        date: '12 Jan 2026',
        changes: [
            {
                title: "Melhorias de Usabilidade",
                description: "Ajuste na visibilidade das informações de versão no rodapé e refinamento no comportamento do modal de novidades.",
                type: "improvement"
            }
        ]
    },
    {
        version: '2.0.0',
        date: '10 Jan 2026',
        changes: [
            {
                title: "Novo Ponto de Venda (PDV)",
                description: "Acesse a aba 'Venda Rápida' para realizar vendas diretas de produtos com baixa automática de estoque. Ideal para balcão!",
                type: "new"
            },
            {
                title: "Venda de Itens Avulsos",
                description: "Agora é possível vender itens ou serviços não cadastrados. Basta usar a opção 'Item Avulso' (ícone de caneta) no PDV ou na Ordem de Serviço.",
                type: "new"
            },
            {
                title: "Painel de Controle Aprimorado",
                description: "Novos filtros de data personalizados (por período) e correção no cálculo de custos e lucros reais.",
                type: "improvement"
            }
        ]
    }
];

interface ChangeLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    showHistory?: boolean;
}

export const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ isOpen, onClose, onConfirm, showHistory: initialShowHistory = false }) => {
    const [viewHistory, setViewHistory] = React.useState(initialShowHistory);

    // Reseta visualização quando modal abre
    React.useEffect(() => {
        if (isOpen) setViewHistory(initialShowHistory);
    }, [isOpen, initialShowHistory]);

    if (!isOpen) return null;

    // Se viewHistory for true, mostra todo o histórico.
    // Se for false, tenta encontrar a versão atual ou mostra a mais recente.
    const versionsToShow = viewHistory
        ? CHANGELOG
        : [CHANGELOG.find(v => v.version === APP_VERSION) || CHANGELOG[0]];

    const Content = () => (
        <div className="space-y-8">
            {versionsToShow.map((ver) => (
                <div key={ver.version} className="relative">
                    {viewHistory && (
                        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-surface-dark z-10 pt-1">
                            <span className="text-lg font-black text-slate-800 dark:text-white">v{ver.version}</span>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-full">{ver.date}</span>
                            {ver.version === APP_VERSION && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">Atual</span>}
                        </div>
                    )}

                    <div className="space-y-4">
                        {ver.changes.map((update, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className={`mt-1 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${update.type === 'new'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
                                    }`}>
                                    {update.type === 'new' ? <Zap size={20} /> : <Check size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {update.title}
                                        {update.type === 'new' && (
                                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Novo</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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
            {/* Desktop Modal */}
            <div className="hidden md:flex fixed inset-0 z-[999] items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 relative max-h-[90vh] flex flex-col">

                    {/* Header com Gradiente */}
                    <div className="relative bg-gradient-to-r from-primary to-blue-600 p-6 text-white overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                            <Rocket size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/30">
                                {viewHistory ? <History size={12} /> : <Sparkles size={12} />}
                                <span>{viewHistory ? 'Histórico de Atualizações' : `Novidades da Versão ${APP_VERSION}`}</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">{viewHistory ? 'Linha do Tempo' : 'O sistema foi atualizado!'}</h2>
                            <p className="text-blue-100 mt-1 text-sm font-medium">
                                {viewHistory ? 'Confira todas as mudanças realizadas até hoje no sistema.' : 'Confira as melhorias que preparamos para você.'}
                            </p>
                        </div>
                    </div>

                    {/* Conteúdo Scrollável */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <Content />
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-neutral-900/50 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
                        {!viewHistory ? (
                            <button
                                onClick={() => setViewHistory(true)}
                                className="text-xs font-bold text-slate-500 hover:text-primary transition-colors hover:underline flex items-center gap-1.5"
                            >
                                <History size={14} />
                                Ver histórico completo
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={onConfirm}
                            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/20"
                        >
                            {viewHistory ? 'Fechar Histórico' : 'Entendi, vamos lá!'}
                        </button>
                    </div>

                    {/* Botão Fechar X absoluto */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                    >
                        <X size={20} />
                    </button>
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
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            {viewHistory ? 'FECHAR HISTÓRICO' : 'ENTENDI, VAMOS LÁ!'}
                        </button>
                        {!viewHistory && (
                            <button
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

