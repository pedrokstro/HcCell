import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../store';
import { Search, Save, User, Package, X, Plus, Calculator, Settings, Smartphone, Image as ImageIcon, ShieldAlert, Upload } from 'lucide-react';
import { OrderStatus, ServiceOrder, MovementType } from '../../types';

export const OrderForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addOrder, updateOrder, orders, clients, products, updateProduct, addProductMovement } = useApp();

    // Form State
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [deviceModel, setDeviceModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [passcode, setPasscode] = useState('');
    const [priceServices, setPriceServices] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [deviceImage, setDeviceImage] = useState('');
    const [noWarranty, setNoWarranty] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDeviceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Selected Products from Inventory
    const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number; price: number; name: string }[]>([]);

    // Product Search State
    const [productSearch, setProductSearch] = useState('');
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);

    // Manual Item State
    const [manualName, setManualName] = useState('');
    const [manualPrice, setManualPrice] = useState<string>('');
    const [manualCost, setManualCost] = useState<string>('');
    const [manualQty, setManualQty] = useState<number>(1);

    const handleAddManualItem = () => {
        if (!manualName || !manualPrice) return;
        const price = parseFloat(manualPrice.replace(',', '.'));
        if (isNaN(price)) return;

        setSelectedProducts([...selectedProducts, {
            productId: `manual-${Date.now()}`,
            name: manualName,
            price: price,
            cost: parseFloat(manualCost.replace(',', '.')) || 0,
            quantity: manualQty
        }]);
        setManualName('');
        setManualPrice('');
        setManualCost('');
        setManualQty(1);
    };

    // Filter products based on search
    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(productSearch.toLowerCase())) &&
        p.quantity > 0
    );

    const priceParts = selectedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const total = (priceServices + priceParts) - discount;

    // Client Search State
    const [clientSearch, setClientSearch] = useState('');
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const productSearchRef = useRef<HTMLDivElement>(null);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowClientSuggestions(false);
            }
            if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
                setShowProductSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter clients based on search
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone?.includes(clientSearch) ||
        c.cpf?.includes(clientSearch)
    );

    const selectedClient = clients.find(c => c.id === selectedClientId);

    useEffect(() => {
        if (id) {
            const orderToEdit = orders.find(o => o.id === id);
            if (orderToEdit) {
                setSelectedClientId(orderToEdit.clientId);
                setDeviceModel(orderToEdit.deviceModel);
                setSerialNumber(orderToEdit.serialNumber || '');
                setIssueDescription(orderToEdit.issueDescription);
                setPasscode(orderToEdit.passcode || '');
                setPriceServices(orderToEdit.priceServices || 0);
                setDiscount(orderToEdit.discount || 0);
                setDeviceImage(orderToEdit.deviceImage || '');
                setNoWarranty(orderToEdit.noWarranty || false);
                setSelectedProducts(orderToEdit.selectedProducts || []);
            }
        }
    }, [id, orders]);

    const handleAddProduct = (product: any) => {
        const existing = selectedProducts.find(p => p.productId === product.id);
        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, {
                productId: product.id,
                name: product.name,
                price: product.priceSale,
                cost: product.priceCost || 0,
                quantity: 1
            }]);
        }
        setProductSearch('');
        setShowProductSuggestions(false);
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId) {
            alert('Por favor, selecione um cliente.');
            return;
        }
        if (!deviceModel) {
            alert('Preencha o modelo do aparelho.');
            return;
        }

        try {

            if (id) {
                // EDIT MODE: Calculate differences (delta) in stock
                const existingOrder = orders.find(o => o.id === id);
                if (existingOrder) {
                    const oldProducts = existingOrder.selectedProducts || [];
                    const newProducts = selectedProducts;

                    // Get all unique product IDs involved
                    const allProductIds = new Set([
                        ...oldProducts.map(p => p.productId),
                        ...newProducts.map(p => p.productId)
                    ]);

                    for (const productId of allProductIds) {
                        // Skip manual items
                        if (productId.startsWith('manual-')) continue;

                        const oldItem = oldProducts.find(p => p.productId === productId);
                        const newItem = newProducts.find(p => p.productId === productId);

                        const oldQty = oldItem ? oldItem.quantity : 0;
                        const newQty = newItem ? newItem.quantity : 0;
                        const diff = newQty - oldQty; // Positive: consumed more. Negative: returned to stock.

                        if (diff !== 0) {
                            const product = products.find(p => p.id === productId);
                            if (product) {
                                // Update Stock
                                await updateProduct({
                                    ...product,
                                    quantity: product.quantity - diff
                                });

                                // Record Movement
                                await addProductMovement({
                                    productId: product.id,
                                    type: diff > 0 ? MovementType.EXIT : MovementType.ENTRY,
                                    quantityChange: diff > 0 ? -diff : Math.abs(diff),
                                    note: `Atualização de OS (Edição)`
                                });
                            }
                        }
                    }

                    // Save Order Updates
                    // Save Order Updates
                    const warrantyEnd = noWarranty ? null : (existingOrder.warrantyEnd || new Date(new Date().setDate(new Date().getDate() + 90)).toISOString());

                    await updateOrder({
                        ...existingOrder,
                        clientId: selectedClientId,
                        deviceModel,
                        serialNumber,
                        passcode,
                        issueDescription,
                        deviceImage,
                        priceServices,
                        priceParts,
                        discount,
                        total,
                        noWarranty,
                        warrantyEnd: noWarranty ? null : warrantyEnd,
                        selectedProducts
                    });
                }
            } else {
                // NEW MODE: Deduct all selected products
                for (const item of selectedProducts) {
                    // Skip manual items
                    if (item.productId.startsWith('manual-')) continue;

                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        await updateProduct({
                            ...product,
                            quantity: product.quantity - item.quantity
                        });

                        // Record Exit Movement
                        await addProductMovement({
                            productId: product.id,
                            type: MovementType.EXIT,
                            quantityChange: -item.quantity,
                            note: `Consumido na Ordem de Serviço (Nova)`
                        });
                    }
                }

                // Create new order
                const createdAt = new Date().toISOString();
                const warrantyEndDate = new Date();
                warrantyEndDate.setDate(warrantyEndDate.getDate() + 90);

                await addOrder({
                    clientId: selectedClientId,
                    deviceModel,
                    serialNumber,
                    passcode,
                    issueDescription,
                    deviceImage,
                    status: OrderStatus.PENDING,
                    priceServices,
                    priceParts,
                    discount,
                    total,
                    createdAt,
                    noWarranty,
                    warrantyEnd: noWarranty ? null : warrantyEndDate.toISOString(),
                    selectedProducts
                } as Partial<ServiceOrder>);
            }
            navigate('/orders');
        } catch (error) {
            console.error("Failed to save order", error);
            alert("Erro ao salvar ordem de serviço.");
        }
    };

    const handleSelectClient = (clientId: string) => {
        setSelectedClientId(clientId);
        setClientSearch('');
        setShowClientSuggestions(false);
    };

    return (
        <div className="max-w-[1024px] mx-auto flex flex-col gap-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-gray-200 dark:border-neutral-800">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">
                        {id ? 'Atualize os dados da manutenção abaixo.' : 'Preencha os dados abaixo para registrar uma entrada de manutenção.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
                {/* Client Selection Section */}
                <section className="bg-white dark:bg-surface-dark p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dados do Cliente</h3>
                        {!id && <button type="button" onClick={() => navigate('/clients/new')} className="text-primary text-sm font-bold hover:underline">Novo Cliente</button>}
                    </div>

                    {!selectedClient ? (
                        <div className="relative" ref={searchRef}>
                            <div className="flex w-full items-stretch rounded-lg h-12 bg-slate-50 dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-primary transition-all border border-slate-200 dark:border-neutral-800">
                                <div
                                    className="flex items-center justify-center pl-4 text-slate-400 hover:text-primary cursor-pointer transition-colors"
                                    onClick={() => setShowClientSuggestions(true)}
                                >
                                    <Search size={20} />
                                </div>
                                <input
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white px-4 placeholder:text-slate-400 h-full w-full outline-none"
                                    placeholder="Buscar por Nome, CPF ou Telefone (clique na lupa para listar todos)"
                                    type="text"
                                    value={clientSearch}
                                    onChange={(e) => {
                                        setClientSearch(e.target.value);
                                        setShowClientSuggestions(true);
                                    }}
                                    onFocus={() => setShowClientSuggestions(true)}
                                />
                            </div>
                            {/* Suggestions Dropdown */}
                            {showClientSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredClients.length > 0 ? (
                                        filteredClients.map(client => (
                                            <div
                                                key={client.id}
                                                onClick={() => handleSelectClient(client.id)}
                                                className="p-3 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer border-b border-slate-50 dark:border-neutral-800 last:border-none flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{client.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{client.phone} • {client.cpf}</p>
                                                </div>
                                                <div className="text-primary opacity-0 hover:opacity-100">Selecionar</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Nenhum cliente encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{selectedClient.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedClient.phone} {selectedClient.cpf && `• ${selectedClient.cpf}`}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedClientId(null)}
                                className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                            >
                                Trocar
                            </button>
                        </div>
                    )}
                </section>

                {/* Device Information Section */}
                <section className="bg-white dark:bg-surface-dark p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Smartphone size={20} className="text-primary" />
                        Informações do Aparelho
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Modelo do Aparelho *</label>
                            <input
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                placeholder="Ex: iPhone 13 Pro"
                                type="text"
                                value={deviceModel}
                                onChange={(e) => setDeviceModel(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Número de Série / IMEI</label>
                            <input
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white font-mono"
                                placeholder="Opcional"
                                type="text"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Senha do Aparelho</label>
                            <input
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                placeholder="Gesto ou PIN (Opcional)"
                                type="text"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 min-h-[120px]">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Foto do Aparelho (Opcional)</label>
                            <div className="flex items-center gap-4">
                                {deviceImage && (
                                    <div className="relative group">
                                        <img src={deviceImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                                        <button
                                            type="button"
                                            onClick={() => setDeviceImage('')}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <label className="cursor-pointer bg-slate-50 dark:bg-neutral-900 border border-dashed border-slate-300 dark:border-neutral-700 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-xs font-bold w-full md:w-auto min-w-[120px]">
                                    <Upload size={20} />
                                    <span>Anexar Foto</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Problema Relatado</label>
                            <textarea
                                className="w-full p-4 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white min-h-[100px]"
                                placeholder="Descreva o defeito informado pelo cliente..."
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-surface-dark p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Settings size={20} className="text-primary" />
                            Serviços e Peças
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {/* Product Selection */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Adicionar Peças do Estoque</label>
                            <div className="relative" ref={productSearchRef}>
                                <div className="flex w-full items-stretch rounded-lg h-11 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-primary transition-all">
                                    <div
                                        className="flex items-center justify-center pl-3 text-slate-400 hover:text-primary cursor-pointer transition-colors"
                                        onClick={() => setShowProductSuggestions(true)}
                                    >
                                        <Search size={20} />
                                    </div>
                                    <input
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white px-3 placeholder:text-slate-400 outline-none text-sm"
                                        placeholder="Buscar peça (clique na lupa p/ todos)..."
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            setShowProductSuggestions(true);
                                        }}
                                        onFocus={() => setShowProductSuggestions(true)}
                                    />
                                </div>

                                {showProductSuggestions && (
                                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleAddProduct(product)}
                                                    className="p-3 hover:bg-primary/5 cursor-pointer border-b border-slate-50 dark:border-neutral-800 last:border-none flex items-center justify-between group"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{product.name}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">SKU: {product.sku} • Estoque: {product.quantity} un</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-primary">R$ {product.priceSale.toFixed(2)}</span>
                                                        <Plus size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-slate-500 text-xs italic">Nenhuma peça disponível encontrada.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-neutral-800">
                                <span className="text-xs font-bold text-slate-500 uppercase">Ou Adicione Manualmente (Item Avulso)</span>
                                <div className="flex flex-col lg:flex-row gap-2">
                                    <input
                                        className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-900 dark:text-white min-w-[200px]"
                                        placeholder="Nome do item..."
                                        value={manualName}
                                        onChange={e => setManualName(e.target.value)}
                                    />
                                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                                        <input
                                            className="w-16 h-10 px-3 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-900 dark:text-white text-center"
                                            type="number"
                                            min="1"
                                            placeholder="Qtd"
                                            value={manualQty}
                                            onChange={e => setManualQty(parseInt(e.target.value) || 1)}
                                        />
                                        <div className="relative w-32 shrink-0">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">R$</span>
                                            <input
                                                className="w-full h-10 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-900 dark:text-white"
                                                placeholder="Preço"
                                                value={manualPrice}
                                                onChange={e => setManualPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative w-28 shrink-0">
                                            <input
                                                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-900 dark:text-white"
                                                placeholder="Custo (Op)"
                                                title="Preço de Custo (Opcional)"
                                                value={manualCost}
                                                onChange={e => setManualCost(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddManualItem}
                                            disabled={!manualName || !manualPrice}
                                            className="h-10 px-4 bg-slate-800 dark:bg-neutral-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Products List */}
                        {selectedProducts.length > 0 && (
                            <div className="space-y-2 border-t border-slate-100 dark:border-neutral-800 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peças Selecionadas</span>
                                    <span className="text-xs text-slate-400">Clique no custo para editar</span>
                                </div>
                                {selectedProducts.map((item) => (
                                    <div key={item.productId} className="flex items-center justify-between bg-slate-50 dark:bg-neutral-900 p-3 rounded-lg border border-slate-200 dark:border-neutral-800 group animate-in slide-in-from-top-1 duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                {item.quantity}x
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                                                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider">
                                                    <span className="text-slate-500 dark:text-slate-400 font-bold">Venda: R$ {item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(item.productId)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}


                        {/* Totals and Services */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-neutral-800 pt-6">
                            <div className="space-y-4">
                                {id && (
                                    <></>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Desconto (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">R$</span>
                                        <input
                                            className="w-full h-11 pl-10 pr-3 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white font-bold text-red-600 dark:text-red-400"
                                            inputMode="decimal"
                                            type="number"
                                            value={discount || ''}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-900 dark:bg-black rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl shadow-slate-200 dark:shadow-none border border-slate-800 dark:border-neutral-800">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Subtotal Peças</span>
                                            <span>R$ {priceParts.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Subtotal Serviços</span>
                                            <span>R$ {priceServices.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-xs font-bold text-red-400 uppercase tracking-widest">
                                                <span>Desconto</span>
                                                <span>- R$ {discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-slate-800 dark:border-neutral-800 mt-4 pt-4 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Total da Ordem</span>
                                            <span className="text-3xl font-black">R$ {total.toFixed(2)}</span>
                                        </div>
                                        <Calculator size={32} className="text-slate-700 dark:text-slate-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Checkbox */}
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-xl flex items-center gap-3 mt-4">
                            <input
                                type="checkbox"
                                checked={noWarranty}
                                onChange={(e) => setNoWarranty(e.target.checked)}
                                className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                id="noWarrantyCheck"
                            />
                            <label htmlFor="noWarrantyCheck" className="flex flex-col cursor-pointer">
                                <span className="font-bold text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    Este serviço NÃO POSSUI garantia
                                </span>
                                <span className="text-xs text-red-600/70 dark:text-red-400/70">Marque esta opção apenas para serviços isentos de garantia.</span>
                            </label>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigate('/orders')} className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                        <Save size={18} /> {id ? 'Salvar Alterações' : 'Gerar Ordem de Serviço'}
                    </button>
                </div>
            </form>
        </div >
    );
};