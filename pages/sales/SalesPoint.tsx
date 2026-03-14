import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store';
import { Product, OrderStatus, PaymentMethod } from '../../types';
import { useToast } from '../../components/Toast';
import {
    ShoppingCart,
    Search,
    Trash2,
    Plus,
    Minus,
    User as UserIcon,
    CreditCard,
    Banknote,
    QrCode,
    X,
    Package,
    PenLine
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomDropdown } from '../../components/CustomDropdown';

export const SalesPoint: React.FC = () => {
    const { products, clients, categories, addOrder, updateProduct, addProductMovement } = useApp();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    // Initialize cart from localStorage to persist data
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
        try {
            const saved = localStorage.getItem('pdv_cart_items');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load cart", e);
            return [];
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pdv_cart_items', JSON.stringify(cart));
    }, [cart]);

    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
    const [discount, setDiscount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Manual Sale State
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualName, setManualName] = useState('');
    const [manualPrice, setManualPrice] = useState('');
    const [manualCost, setManualCost] = useState('');

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // Check stock
                if (existing.quantity >= product.quantity) {
                    showToast('Estoque insuficiente para adicionar mais itens.', 'error');
                    return prev;
                }
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            if (product.quantity <= 0) {
                showToast('Produto sem estoque.', 'error');
                return prev;
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                if (newQty < 1) return item;
                // Only check stock limit for real products
                if (!item.product.id.startsWith('manual-') && newQty > item.product.quantity) {
                    showToast('Estoque limite atingido.', 'error');
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const addManualItem = () => {
        if (!manualName || !manualPrice) {
            showToast('Informe nome e preço do item.', 'error');
            return;
        }
        const price = parseFloat(manualPrice.replace(',', '.'));
        if (isNaN(price) || price < 0) {
            showToast('Preço inválido.', 'error');
            return;
        }

        const manualProduct: Product = {
            id: `manual-${Date.now()}`,
            name: manualName,
            priceSale: price,
            priceCost: parseFloat(manualCost.replace(',', '.')) || 0,
            quantity: 999999, // Unlimited dummy stock
            category: 'Avulso',
            sku: 'MANUAL',
            createdAt: new Date().toISOString(),
            imageUrl: '',
            minStockLevel: 0,
            description: 'Item adicionado manualmente no PDV'
        };

        addToCart(manualProduct);

        // Reset and close
        setManualName('');
        setManualPrice('');
        setManualCost('');
        setShowManualInput(false);
        showToast('Item avulso adicionado ao carrinho.', 'success');
    };

    // Totals
    const subtotal = cart.reduce((acc, item) => acc + (item.product.priceSale * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showToast('Carrinho vazio.', 'error');
            return;
        }
        if (!paymentMethod) {
            showToast('Selecione uma forma de pagamento.', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Order (Sale)
            const orderId = Math.random().toString(36).substr(2, 9);

            // Map cart to selectedProducts format
            const selectedProducts = cart.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.priceSale,
                cost: item.product.priceCost, // Snapshot cost
                quantity: item.quantity
            }));

            // Deduct Stock
            for (const item of cart) {
                // Skip stock update for manual items
                if (item.product.id.startsWith('manual-')) continue;

                await updateProduct({
                    ...item.product,
                    quantity: item.product.quantity - item.quantity
                });

                // Register Movement
                await addProductMovement({
                    productId: item.product.id,
                    type: 'Saída' as any, // MovementType.EXIT
                    quantityChange: -item.quantity,
                    note: `Venda PDV - ID: ${orderId.slice(0, 8)}`
                });
            }

            // Create ServiceOrder record acting as Sale
            await addOrder({
                id: orderId,
                clientId: selectedClientId || null, // Allow null for anonymous
                deviceModel: 'Venda de Balcão',
                issueDescription: 'Venda Direta de Produtos', // Filling required field
                status: OrderStatus.COMPLETED,
                serviceType: 'VENDA_DIRETA',
                priceServices: 0,
                priceParts: total, // Using total as priceParts effectively
                discount: discount,
                total: total,
                paymentMethod: paymentMethod,
                selectedProducts: selectedProducts,
                createdAt: new Date().toISOString(),
                deviceImage: '',
                noWarranty: true, // Sales usually don't have service warranty logic here
                warrantyEnd: null
            });

            showToast('Venda realizada com sucesso!', 'success');

            // Reset
            setCart([]);
            setSearchTerm('');
            setDiscount(0);
            setPaymentMethod('');
            setSelectedClientId('');

        } catch (error) {
            console.error(error);
            showToast('Erro ao processar venda.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
            {/* Left Column: Products */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">

                {/* Header & Search */}
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <ShoppingCart className="text-primary" size={28} />
                            PDV <span className="text-sm font-medium text-slate-400 uppercase tracking-widest hidden sm:inline">Ponto de Venda</span>
                        </h1>
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Caixa Aberto
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                                placeholder="Buscar produto por nome ou código..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={() => setShowManualInput(!showManualInput)}
                            className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all shadow-sm whitespace-nowrap ${showManualInput
                                ? 'bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark'
                                : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <PenLine size={18} />
                            <span>Item Avulso</span>
                        </button>
                    </div>

                    {/* Manual Input Form */}
                    {showManualInput && (
                        <div className="bg-slate-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 animate-in slide-in-from-top-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <PenLine size={16} />
                                Adicionar Item Avulso
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Nome do Produto / Serviço"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none dark:bg-neutral-900 dark:text-white"
                                        value={manualName}
                                        onChange={e => setManualName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        placeholder="Preço"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none dark:bg-neutral-900 dark:text-white"
                                        value={manualPrice}
                                        onChange={e => setManualPrice(e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        placeholder="Custo (Op)"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none dark:bg-neutral-900 dark:text-white"
                                        value={manualCost}
                                        onChange={e => setManualCost(e.target.value)}
                                        title="Preço de Custo (Opcional)"
                                    />
                                </div>
                                <button
                                    onClick={addManualItem}
                                    className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm whitespace-nowrap"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Categories Dropdown */}
                    <CustomDropdown
                        label="FILTRAR POR CATEGORIA"
                        options={[
                            { value: 'all', label: 'Todas as Categorias' },
                            ...categories.map(cat => ({ value: cat.name, label: cat.name }))
                        ]}
                        selectedValue={selectedCategory}
                        onSelect={(val) => setSelectedCategory(val)}
                        icon={<Package size={18} />}
                        className="w-full sm:w-64"
                    />
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => {
                            const inCart = cart.find(c => c.product.id === product.id)?.quantity || 0;
                            const available = product.quantity - inCart;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => available > 0 && addToCart(product)}
                                    className={`bg-white dark:bg-surface-dark p-3 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col gap-3 group transition-all ${available > 0
                                        ? 'cursor-pointer hover:border-primary/50 hover:shadow-md hover:-translate-y-1'
                                        : 'opacity-50 cursor-not-allowed grayscale'
                                        }`}
                                >
                                    <div className="aspect-square rounded-lg bg-slate-100 dark:bg-neutral-900 relative overflow-hidden">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-neutral-700">
                                                <Package size={32} />
                                            </div>
                                        )}
                                        {available <= 0 && (
                                            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">ESGOTADO</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                            Estoque: {available}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={product.name}>{product.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.category}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-lg font-black text-primary">
                                            R$ {product.priceSale.toFixed(2)}
                                        </span>
                                        <button
                                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                                            disabled={available <= 0}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Search size={48} className="mb-4 opacity-50" />
                            <p>Nenhum produto encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Cart */}
            <div className="w-full md:w-[400px] flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Carrinho
                    </h2>
                    <div className="ml-auto flex items-center gap-2">
                        {cart.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Tem certeza que deseja esvaziar todo o carrinho?')) {
                                        setCart([]);
                                    }
                                }}
                                className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
                                title="Limpar todos os itens"
                            >
                                <Trash2 size={12} />
                                Limpar
                            </button>
                        )}
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
                            {cart.length} itens
                        </span>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                                <ShoppingCart size={32} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Seu carrinho está vazio</p>
                            <p className="text-xs text-center max-w-[200px]">Selecione produtos ao lado para iniciar uma venda.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="flex gap-3 items-center bg-slate-50 dark:bg-neutral-900/50 p-3 rounded-xl group animate-in slide-in-from-right-4 duration-300">
                                <div className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center p-1 border border-slate-100 dark:border-neutral-800">
                                    {item.product.imageUrl ? (
                                        <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                                    ) : (
                                        <Package size={16} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                                    <p className="text-[10px] text-slate-500">Unit: R$ {item.product.priceSale.toFixed(2)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        R$ {(item.product.priceSale * item.quantity).toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg p-0.5 border border-slate-100 dark:border-neutral-700">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, -1)}
                                            className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-700 rounded text-slate-500"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, 1)}
                                            className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-700 rounded text-slate-500"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Footer */}
                <div className="p-4 bg-slate-50 dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 space-y-4">

                    {/* Customer Select */}
                    {/* Customer Selection Dropdown */}
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                        <CustomDropdown
                            label="SELECIONAR CLIENTE"
                            options={[
                                { value: '', label: 'Consumidor Final (Balcão)', icon: <UserIcon size={16} /> },
                                ...clients.map(c => ({ value: c.id, label: c.name, icon: <UserIcon size={16} /> }))
                            ]}
                            selectedValue={selectedClientId}
                            onSelect={(val) => setSelectedClientId(val)}
                            className="w-full"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Pagamento</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'Dinheiro', icon: Banknote, label: 'Dinheiro', color: 'bg-green-100 text-green-700 border-green-200' },
                                { id: 'PIX', icon: QrCode, label: 'PIX', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                                { id: 'Cartão de Crédito', icon: CreditCard, label: 'Crédito', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                                { id: 'Cartão de Débito', icon: CreditCard, label: 'Débito', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-bold transition-all ${paymentMethod === method.id
                                        ? `${method.color} ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark`
                                        : 'bg-white dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <method.icon size={14} />
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Discount & Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-neutral-800">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-500">Desconto</label>
                            <input
                                type="number"
                                value={discount || ''}
                                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-sm font-bold text-right focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-slate-300"
                                placeholder="0,00"
                            />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 mb-0.5">Total a Pagar</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full py-3.5 bg-primary text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Processando...' : 'Finalizar Venda'}
                    </button>
                </div>
            </div>
        </div>
    );
};
