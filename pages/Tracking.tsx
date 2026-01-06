import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Package, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { OrderStatus } from '../types';

export const Tracking: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    // Check for ID in URL on load
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        // Also check hash params if using HashRouter (common in simple React deployments)
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const idParam = params.get('id') || hashParams.get('id');

        if (idParam) {
            setQuery(idParam);
            // Execute search immediately (extracted to a reusable function logic preferably, but fine here)
            handleSearch(null, idParam);
        }
    }, []);

    // Search function - tries to find by ID or Display ID
    const handleSearch = async (e: React.FormEvent | null, searchCode?: string) => {
        if (e) e.preventDefault();

        const codeToSearch = searchCode || query;
        if (!codeToSearch) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Remove # se presente e limpar espaços
            const cleanQuery = codeToSearch.replace('#', '').trim();

            if (!cleanQuery) {
                setError('Digite um código válido.');
                setLoading(false);
                return;
            }

            // Usa a função RPC que busca por display_id ou UUID
            const { data, error: err } = await supabase
                .rpc('search_order_public', { search_term: cleanQuery });

            if (err) {
                console.error('Supabase error:', err);
                setError('Erro ao buscar. Tente novamente.');
            } else if (!data || data.length === 0) {
                setError('Ordem não encontrada. Verifique o código e tente novamente.');
            } else {
                // Formata o resultado para o formato esperado
                const order = data[0];
                setResult({
                    id: order.id,
                    status: order.status,
                    device_model: order.device_model,
                    created_at: order.created_at,
                    total: order.total,
                    display_id: order.display_id,
                    clients: { name: order.client_name }
                });
            }

        } catch (err) {
            console.error('Search error:', err);
            setError('Erro ao buscar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case OrderStatus.PENDING: return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Seu aparelho está na fila para avaliação.' };
            case OrderStatus.IN_PROGRESS: return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Nossos técnicos estão trabalhando no seu aparelho.' };
            case OrderStatus.WAITING_PARTS: return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Estamos aguardando a chegada de peças para continuar.' };
            case OrderStatus.COMPLETED: return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Pronto! Seu aparelho pode ser retirado.' };
            case OrderStatus.CANCELLED: return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', text: 'Este serviço foi cancelado.' };
            default: return { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', text: 'Status desconhecido.' };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-center p-4 transition-colors">
            <div className="mb-8 flex flex-col items-center gap-3">
                <img src="/logo-full.png" alt="HCCELL" className="h-20 w-auto object-contain dark:brightness-0 dark:invert" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-[0.25em] uppercase">Rastreamento de Reparo</p>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-100 dark:border-neutral-800 overflow-hidden transition-colors">
                    <div className="p-8">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Consulte seu Status</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Digite o ID da sua Ordem de Serviço para acompanhar o progresso em tempo real.</p>

                        <form onSubmit={handleSearch} className="flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ex: 550e8400-..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-900 dark:text-white placeholder:font-normal transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Buscando...' : (
                                    <>
                                        Rastrear <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center text-sm font-medium border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="bg-slate-50 dark:bg-neutral-900/50 border-t border-slate-100 dark:border-neutral-800 p-8 animate-in fade-in slide-in-from-bottom-4 transition-colors">
                            <div className="flex flex-col items-center text-center">
                                <div className={`p-4 rounded-full mb-4 ${getStatusInfo(result.status).bg} ${getStatusInfo(result.status).color} bg-opacity-20 dark:bg-opacity-20`}>
                                    {React.createElement(getStatusInfo(result.status).icon, { size: 32 })}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{result.status}</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-[200px] leading-relaxed">{getStatusInfo(result.status).text}</p>

                                <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 space-y-3 transition-colors">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Aparelho</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{result.device_model}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Cliente</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{result.clients?.name?.split(' ')[0]}***</span>
                                    </div>
                                    <div className="w-full h-px bg-slate-100 dark:bg-neutral-800 my-2"></div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Data Entrada</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{new Date(result.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold"></p>
            </div>
        </div>
    );
};
