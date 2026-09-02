
import React, { useState, useMemo } from 'react';
import { useApp } from '../../store';
import { Search, Download, Plus, Minus, MoreVertical, TrendingUp, AlertTriangle, Package, Image as ImageIcon, Filter, DollarSign, Tags, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


import { CustomDropdown } from '../../components/CustomDropdown';
import { AnimatedNumber } from '../../components/AnimatedNumber';

export const InventoryList: React.FC = () => {
    const { products, categories, updateProduct, addProductMovement } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);

    const statusOptions = [
        { value: 'all', label: 'Todos os Status', icon: <Filter size={18} /> },
        { value: 'in_stock', label: 'Em Estoque', icon: <Package size={18} className="text-emerald-500" /> },
        { value: 'low_stock', label: 'Estoque Baixo', icon: <AlertTriangle size={18} className="text-amber-500" /> },
        { value: 'out_of_stock', label: 'Sem Estoque', icon: <AlertTriangle size={18} className="text-red-500" /> }
    ];

    const currentStatusLabel = statusOptions.find(o => o.value === statusFilter)?.label || 'Status';


    const lowStockCount = products.filter(p => p.quantity <= (p.minStockLevel || 5)).length;

    // Use categories from store for filter options, plus 'All'
    const categoryOptions = useMemo(() => {
        return ['All', ...categories.map(c => c.name).sort()];
    }, [categories]);

    // Filter logic
    const filteredProducts = products.filter(product => {
        // Name or SKU search
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;

        // Status filter
        let matchesStatus = true;
        const minStock = product.minStockLevel || 5;

        if (statusFilter === 'out_of_stock') {
            matchesStatus = product.quantity === 0;
        } else if (statusFilter === 'low_stock') {
            matchesStatus = product.quantity > 0 && product.quantity <= minStock;
        } else if (statusFilter === 'in_stock') {
            matchesStatus = product.quantity > minStock;
        }

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleQuantityChange = async (product: any, change: number) => {
        const newQuantity = Math.max(0, product.quantity + change);
        if (newQuantity === product.quantity) return;

        try {
            await updateProduct({
                ...product,
                quantity: newQuantity
            });

            await addProductMovement({
                productId: product.id,
                type: change > 0 ? 'Entrada' : 'Saída' as any,
                quantityChange: Math.abs(change),
                priceOld: product.priceSale,
                priceNew: product.priceSale,
                note: `Ajuste rápido via card (+${change})`
            });
        } catch (error) {
            console.error('Erro ao ajustar estoque:', error);
            alert('Erro ao ajustar estoque');
        }
    };

    return (
        <>
            <div className="flex flex-col gap-8 animate-fade-in">
                {/* Header (Oculto no Mobile para economizar espaço) */}
                <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Estoque</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie níveis de estoque, rastreie peças e adicione novos itens.</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <Link to="/inventory/categories" className="flex items-center justify-center gap-2 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-neutral-700 px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all whitespace-nowrap">
                            <Tags size={20} />
                            <span>Categorias</span>
                        </Link>
                        <Link to="/inventory/new" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all whitespace-nowrap">
                            <Plus size={20} />
                            <span>Novo Produto</span>
                        </Link>
                    </div>
                </div>

                {/* Stats (Oculto no Mobile para economizar espaço) */}
                <div className="hidden sm:grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">

                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                <AlertTriangle size={20} />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Itens c/ Estoque Baixo</p>
                        </div>
                        <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                            <AnimatedNumber value={lowStockCount} format="integer" />
                        </p>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Package size={20} />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Produtos</p>
                        </div>
                        <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                            <AnimatedNumber value={products.length} format="integer" />
                        </p>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <Tags size={20} />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Categorias</p>
                        </div>
                        <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                            <AnimatedNumber value={categories.length > 0 ? categories.length : categoryOptions.length - 1} format="integer" />
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex flex-col sm:flex-row gap-3">
                        <CustomDropdown
                            label="CATEGORIA"
                            options={categoryOptions.map(cat => ({ value: cat, label: cat === 'All' ? 'Todas as Categorias' : cat }))}
                            selectedValue={categoryFilter}
                            onSelect={setCategoryFilter}
                            icon={<Tags size={18} />}
                            className="w-full sm:w-56"
                        />

                        <CustomDropdown
                            label="STATUS"
                            options={statusOptions}
                            selectedValue={statusFilter}
                            onSelect={setStatusFilter}
                            icon={<Filter size={18} />}
                            className="w-full sm:w-56"
                        />

                        <div className="flex items-center gap-2 w-full sm:w-72">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-surface-dark py-2.5 pl-10 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                                    placeholder="Buscar por nome, SKU..."
                                />
                            </div>
                            <Link
                                to="/inventory/new"
                                className="sm:hidden flex items-center justify-center gap-1 bg-primary text-white px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-xs shrink-0 active:scale-95"
                                title="Novo Produto"
                            >
                                <Plus size={16} />
                                <span className="font-extrabold">Novo</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-surface-dark shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Produto / SKU</th>
                                    <th className="px-6 py-4 font-medium">Categoria</th>
                                    <th className="px-6 py-4 font-medium">Preço (Custo)</th>
                                    <th className="px-6 py-4 font-medium">Preço (Venda)</th>
                                    <th className="px-6 py-4 font-medium">Quantidade</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ImageIcon size={18} />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Link to={`/inventory/${product.id}`} className="font-medium text-slate-900 dark:text-white hover:text-primary">{product.name}</Link>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">{product.category}</span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">R$ {(product.priceCost || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">R$ {product.priceSale.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.quantity} un</td>
                                            <td className="px-6 py-4">
                                                {product.quantity === 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Sem Estoque</span>
                                                ) : product.quantity <= (product.minStockLevel || 5) ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Baixo</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Em Estoque</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/inventory/${product.id}/edit`} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white inline-block">
                                                    <MoreVertical size={20} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum produto encontrado para estes filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody >
                        </table >
                    </div >
                </div >

                <div className="md:hidden flex flex-col gap-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <motion.div 
                                key={product.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm flex flex-col gap-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <Link to={`/inventory/${product.id}`} className="font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</Link>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{product.sku}</p>
                                            <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">{product.category}</span>
                                        </div>
                                    </div>
                                    <Link to={`/inventory/${product.id}/edit`} className="p-2 text-slate-400 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                                        <MoreVertical size={18} />
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800 mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Preço</span>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {product.priceSale.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Estoque</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono text-slate-700">{product.quantity} un</span>
                                            {product.quantity === 0 ? (
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            ) : product.quantity <= (product.minStockLevel || 5) ? (
                                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions Row */}
                                <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                                    <div className="flex bg-slate-100 dark:bg-neutral-800 rounded-xl p-1 gap-1">
                                        <button
                                            onClick={() => handleQuantityChange(product, -1)}
                                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 rounded-lg shadow-sm active:scale-90 transition-all border border-slate-200 dark:border-neutral-700"
                                            disabled={product.quantity <= 0}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <div className="flex flex-col items-center justify-center px-3 min-w-[40px]">
                                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Qtd</span>
                                            <span className="font-black text-slate-800 dark:text-white leading-none">{product.quantity}</span>
                                        </div>
                                        <button
                                            onClick={() => handleQuantityChange(product, 1)}
                                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 rounded-lg shadow-sm active:scale-90 transition-all border border-slate-200 dark:border-neutral-700"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <Link
                                        to={`/inventory/${product.id}/edit`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                                    >
                                        <Edit2 size={14} />
                                        Editar
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 border-dashed p-8 text-center">
                            <Package className="mx-auto text-slate-300 dark:text-neutral-700 mb-2" size={32} />
                            <p className="text-slate-500 dark:text-slate-400">Nenhum produto encontrado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FAB Mobile removed */}
        </>
    );
};