import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../store';
import { Edit, Trash2, Store, Image as ImageIcon, Plus, ShoppingCart, Tag, ChevronRight, Info, LayoutDashboard, Package, History, AlertCircle, Settings, User, X } from 'lucide-react';
import { MovementType } from '../../types';

export const ProductDetails: React.FC = () => {
    const { id } = useParams();
    const { products, productMovements, updateProduct, addProductMovement } = useApp();
    const [showQuickStockModal, setShowQuickStockModal] = useState(false);
    const [quickStockAmount, setQuickStockAmount] = useState(1);
    const [quickStockNote, setQuickStockNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const product = products.find(p => p.id === id);

    const movements = productMovements
        .filter(m => m.productId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4">
                <AlertCircle size={48} className="text-slate-300" />
                <p className="text-xl font-medium">Produto não encontrado</p>
                <Link to="/inventory" className="text-primary hover:underline font-bold">Voltar para o Inventário</Link>
            </div>
        );
    }

    const stockPercentage = Math.min(100, Math.max(0, (product.quantity / (product.minStockLevel || 20)) * 100));

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleQuickStockUpdate = async (type: 'ENTRY' | 'EXIT') => {
        if (!product || isUpdating) return;
        setIsUpdating(true);
        try {
            const amount = type === 'ENTRY' ? quickStockAmount : -quickStockAmount;
            const newQuantity = Math.max(0, product.quantity + amount);

            await updateProduct({
                ...product,
                quantity: newQuantity
            });

            await addProductMovement({
                productId: product.id,
                type: type === 'ENTRY' ? MovementType.ENTRY : MovementType.EXIT,
                quantityChange: amount,
                note: quickStockNote || (type === 'ENTRY' ? 'Entrada rápida de estoque' : 'Saída rápida de estoque')
            });

            setShowQuickStockModal(false);
            setQuickStockAmount(1);
            setQuickStockNote('');
        } catch (error) {
            console.error("Update failed", error);
            alert("Erro ao atualizar estoque.");
        } finally {
            setIsUpdating(false);
        }
    };

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'Entrada': return { icon: Plus, color: 'text-green-600', bg: 'bg-green-100' };
            case 'Saída': return { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'Ajuste de Preço': return { icon: Tag, color: 'text-orange-600', bg: 'bg-orange-100' };
            default: return { icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' };
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Link to="/inventory" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Package size={16} />
                    Inventário
                </Link>
                <ChevronRight size={14} className="text-slate-300 dark:text-neutral-600" />
                <span className="text-slate-400 dark:text-slate-500">Produtos</span>
                <ChevronRight size={14} className="text-slate-300 dark:text-neutral-600" />
                <span className="text-slate-900 dark:text-white font-bold">Detalhes</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{product.name}</h1>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${product.quantity > (product.minStockLevel || 5)
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20'
                            : product.quantity > 0
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20'
                            }`}>
                            {product.quantity > (product.minStockLevel || 5) ? 'Em Estoque' : product.quantity > 0 ? 'Estoque Baixo' : 'Sem Estoque'}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg flex items-center gap-2">
                        Detalhes do Ativo <span className="text-slate-300 dark:text-neutral-700">•</span> SKU: <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{product.sku}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowQuickStockModal(true)}
                        className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} /> Adicionar Estoque
                    </button>
                    <Link to={`/inventory/${product.id}/edit`} className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-white text-sm font-bold shadow-sm transition-all">
                        <Edit size={18} /> Editar
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Info Card */}
                    <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <Info size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Informações Principais</h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Nome do Produto</span>
                                <span className="text-lg font-semibold text-slate-900 dark:text-white">{product.name}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Categoria</span>
                                <div>
                                    <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-3 py-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {product.category}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Fornecedor</span>
                                <span className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Store size={20} className="text-primary" />
                                    {product.supplier || 'Fornecedor Padrão'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">SKU de Controle</span>
                                <span className="font-mono text-sm bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 px-3 py-1.5 rounded-lg w-fit text-slate-600 dark:text-slate-400 select-all">
                                    {product.sku}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Descrição</span>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{product.description || 'Nenhuma descrição detalhada fornecida.'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Price Card */}
                    <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-white/5 flex items-center gap-3">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                <ShoppingCart size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Preços e Disponibilidade</h3>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 flex flex-col gap-1 shadow-sm transition-all hover:scale-[1.02]">
                                    <span className="text-green-700 dark:text-green-400 text-[10px] uppercase font-bold tracking-wider">Preço de Venda</span>
                                    <p className="text-3xl font-black text-green-800 dark:text-green-300">R$ {(product.priceSale || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 flex flex-col gap-1">
                                    <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Custo de Aquisição</span>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {(product.priceCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex flex-col gap-1 shadow-sm transition-all hover:scale-[1.02]">
                                    <span className="text-blue-700 dark:text-blue-400 text-[10px] uppercase font-bold tracking-wider">Peças em Estoque</span>
                                    <p className="text-3xl font-black text-blue-800 dark:text-blue-300">{product.quantity} <span className="text-sm font-medium">un</span></p>
                                </div>
                            </div>

                            <div className="space-y-3 p-6 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-slate-100 dark:border-neutral-800">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Saúde do Estoque</span>
                                    <span className="text-sm font-bold text-primary">{Math.round(stockPercentage)}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ${product.quantity === 0 ? 'bg-red-500' :
                                            product.quantity <= (product.minStockLevel || 5) ? 'bg-amber-500' :
                                                'bg-primary'
                                            }`}
                                        style={{ width: `${stockPercentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <AlertCircle size={14} className="text-slate-400" />
                                    <p className="text-[11px] text-slate-400 italic">O estoque ideal deve permanecer acima de {product.minStockLevel || 5} unidades.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    {/* Image Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm p-4 flex flex-col gap-4 group">
                        <div className="aspect-square w-full rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-700 flex items-center justify-center relative overflow-hidden transition-all group-hover:shadow-lg">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-neutral-700">
                                    <ImageIcon size={64} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Sem Foto</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                        </div>
                    </div>

                    {/* Meta/History Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                <History size={20} className="text-primary" />
                                Histórico de Atividades
                            </h3>
                        </div>
                        <div className="flex flex-col divide-y divide-slate-50 dark:divide-neutral-800 max-h-[500px] overflow-y-auto">
                            {movements.length > 0 ? (
                                movements.map((m, idx) => {
                                    const { icon: Icon, color, bg } = getMovementIcon(m.type);
                                    return (
                                        <div key={idx} className="flex items-start gap-4 p-5 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-default group">
                                            <div className={`mt-0.5 size-10 rounded-2xl ${bg} ${color} flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform shadow-sm`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.type}</span>
                                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap">{formatDate(m.createdAt).split(',')[0]}</span>
                                                </div>
                                                <div className="mt-1 flex flex-col gap-0.5">
                                                    {m.quantityChange !== undefined && (
                                                        <span className={`text-[11px] font-bold ${m.quantityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                            {m.quantityChange > 0 ? '+' : ''}{m.quantityChange} unidades
                                                        </span>
                                                    )}
                                                    {m.priceOld !== undefined && (
                                                        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                                                            Preço: R$ {m.priceOld} → R$ {m.priceNew}
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{m.note || 'Sem observações'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1 inline-flex items-center gap-1">
                                                        <User size={10} /> {m.technicianName || 'Sistema'} • {formatDate(m.createdAt).split(',')[1]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-neutral-900 rounded-3xl text-slate-300 dark:text-neutral-700">
                                        <History size={40} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma atividade registrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stock Modal */}
            {showQuickStockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Entrada de Estoque</h3>
                                <button onClick={() => setShowQuickStockModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-neutral-800">
                                    <div className="size-12 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center shadow-sm">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} className="size-full object-cover rounded-xl" />
                                        ) : (
                                            <Package size={24} className="text-slate-300 dark:text-slate-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Estoque atual: <span className="font-bold text-slate-700 dark:text-slate-300">{product.quantity} un</span></p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quantidade a Adicionar</label>
                                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-neutral-900 p-2 rounded-2xl border border-slate-200 dark:border-neutral-800">
                                            <button
                                                onClick={() => setQuickStockAmount(prev => Math.max(1, prev - 1))}
                                                className="size-11 rounded-xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-neutral-700 active:scale-95 transition-all text-slate-600 dark:text-slate-400"
                                            >
                                                <X size={16} className="rotate-45" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quickStockAmount}
                                                onChange={(e) => setQuickStockAmount(parseInt(e.target.value) || 0)}
                                                className="flex-1 bg-transparent border-none text-center font-black text-xl text-slate-900 dark:text-white focus:ring-0"
                                            />
                                            <button
                                                onClick={() => setQuickStockAmount(prev => prev + 1)}
                                                className="size-11 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Observação (Opcional)</label>
                                        <textarea
                                            placeholder="Ex: Novo lote recebido, reposição..."
                                            value={quickStockNote}
                                            onChange={(e) => setQuickStockNote(e.target.value)}
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm resize-none h-24 text-slate-900 dark:text-white placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button
                                    onClick={() => setShowQuickStockModal(false)}
                                    className="h-14 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleQuickStockUpdate('ENTRY')}
                                    disabled={isUpdating || quickStockAmount <= 0}
                                    className="h-14 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? 'Salvando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};