import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../store';
import { Save, Image as ImageIcon, ArrowLeft, Check, Trash2, Plus, Info } from 'lucide-react';
import { Product, MovementType } from '../../types';

export const ProductForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, categories, addProduct, updateProduct, deleteProduct, addProductMovement } = useApp();

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        category: '',
        quantity: 0,
        priceSale: 0,
        priceCost: 0,
        description: '',
        sku: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (id) {
            const existing = products.find(p => p.id === id);
            if (existing) setFormData(existing);
        }
    }, [id, products]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        try {
            if (id) {
                const existing = products.find(p => p.id === id);
                if (existing) {
                    // Record Stock Adjustment
                    if (formData.quantity !== undefined && formData.quantity !== existing.quantity) {
                        const diff = formData.quantity - existing.quantity;
                        await addProductMovement({
                            productId: id,
                            type: MovementType.MANUAL_ADJUSTMENT,
                            quantityChange: diff,
                            note: 'Ajuste manual de estoque via formulário'
                        });
                    }

                    // Record Price Update
                    if (formData.priceSale !== undefined && formData.priceSale !== existing.priceSale) {
                        await addProductMovement({
                            productId: id,
                            type: MovementType.PRICE_UPDATE,
                            priceOld: existing.priceSale,
                            priceNew: formData.priceSale,
                            note: 'Atualização de preço'
                        });
                    }

                    await updateProduct({ ...formData, id } as Product);
                }
            } else {
                const newId = Math.random().toString(36).substr(2, 9);
                const sku = formData.sku || `SKU-${Math.floor(Math.random() * 10000)}`;

                await addProduct({
                    ...formData,
                    id: newId,
                    sku
                } as Product);

                // Record Initial Entry
                if (formData.quantity && formData.quantity > 0) {
                    await addProductMovement({
                        productId: newId,
                        type: MovementType.ENTRY,
                        quantityChange: formData.quantity,
                        note: 'Cadastro inicial de estoque'
                    });
                }
            }
            navigate('/inventory');
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Erro ao salvar produto.");
        }
    };

    const handleDelete = () => {
        if (id) {
            const confirmed = window.confirm("ATENÇÃO: Tem certeza que deseja excluir este produto do estoque permanentemente? Esta ação não pode ser desfeita.");
            if (confirmed) {
                deleteProduct(id);
                navigate('/inventory');
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="hidden sm:flex items-center gap-4 mb-8">
                <Link to="/inventory" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{id ? 'Editar Produto' : 'Novo Produto'}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie os detalhes do produto, preços e níveis de estoque.</p>
                </div>
            </div>
            <div className="bg-white dark:bg-surface-dark shadow-sm ring-1 ring-slate-900/5 dark:ring-white/5 rounded-xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-bold text-slate-900 dark:text-white">Nome do Produto <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400"
                                placeholder="Ex: Tela iPhone 11 Original"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900 dark:text-white">Categoria</label>
                            <select
                                className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all"
                                value={formData.category || ''}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Selecione uma categoria...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900 dark:text-white">SKU / Código</label>
                            <input
                                type="text"
                                className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400"
                                placeholder="Gerado automaticamente se vazio"
                                value={formData.sku || ''}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900 dark:text-white">Preço de Custo (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400"
                                    placeholder="0,00"
                                    value={formData.priceCost || ''}
                                    onChange={e => setFormData({ ...formData, priceCost: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900 dark:text-white">Preço de Venda (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400"
                                    placeholder="0,00"
                                    value={formData.priceSale || ''}
                                    onChange={e => setFormData({ ...formData, priceSale: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900 dark:text-white">Estoque Atual</label>
                            <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400"
                                placeholder="0"
                                value={formData.quantity || ''}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-bold text-slate-900 dark:text-white">Descrição</label>
                        <textarea
                            rows={3}
                            className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400 resize-none"
                            placeholder="Detalhes adicionais do produto..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4 pt-2">
                        <label className="block text-sm font-bold text-slate-900 dark:text-white">Imagem do Produto</label>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div
                                onClick={() => document.getElementById('file-input')?.click()}
                                className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-50 dark:bg-neutral-900 ring-2 ring-slate-200 dark:ring-neutral-700 shadow-inner flex flex-col items-center justify-center cursor-pointer group hover:ring-primary transition-all"
                            >
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <ImageIcon className="h-10 w-10 group-hover:text-primary transition-colors" />
                                        <span className="text-[10px] font-bold uppercase">Selecionar Foto</span>
                                    </div>
                                )}
                                {formData.imageUrl ? (
                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData({ ...formData, imageUrl: '' });
                                            }}
                                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                            title="Remover imagem"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('file-input')?.click()}
                                            className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100 transition-colors"
                                            title="Trocar imagem"
                                        >
                                            <ImageIcon size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <Plus className="text-slate-500" size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, imageUrl: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <input
                                    id="camera-input"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, imageUrl: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="block w-full rounded-lg border-0 py-2.5 px-4 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 transition-all placeholder:text-slate-400"
                                        placeholder="Ou cole o URL da imagem aqui..."
                                        value={formData.imageUrl || ''}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed flex flex-col gap-2">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <Info size={14} /> Opções de Imagem
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('camera-input')?.click()}
                                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                                        >
                                            <ImageIcon size={14} /> Câmera
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('file-input')?.click()}
                                            className="px-3 py-1.5 bg-white dark:bg-surface-dark border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                                        >
                                            <ImageIcon size={14} /> Galeria / Arquivos
                                        </button>
                                    </div>
                                    <span className="opacity-80">Você também pode colar um link direto acima.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-neutral-900/50 px-6 py-4 -mx-6 -mb-8 mt-6 flex items-center justify-end gap-x-4 border-t border-slate-100 dark:border-neutral-800">
                        <button type="button" onClick={() => navigate('/inventory')} className="text-sm font-bold leading-6 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                        <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-dark transition-all flex items-center gap-2">
                            <Save size={18} />
                            Salvar Produto
                        </button>
                    </div>
                </form>
            </div>

            {id && (
                <div className="mt-8 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Excluir Produto</h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-1">Esta ação não pode ser desfeita e removerá permanentemente o item do estoque.</p>
                    </div>
                    <button onClick={handleDelete} className="rounded-lg bg-white dark:bg-surface-dark border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 shadow-sm">
                        <Trash2 size={16} /> Excluir
                    </button>
                </div>
            )}
        </div>
    );
};