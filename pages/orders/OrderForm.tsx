import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../store';
import {
  Search,
  Save,
  User,
  Package,
  X,
  Plus,
  Calculator,
  Settings,
  Smartphone,
  ShieldAlert,
  Upload,
  UserPlus,
  Wrench,
  DollarSign,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { OrderStatus, ServiceOrder, MovementType } from '../../types';
import { CustomDropdown } from '../../components/CustomDropdown';

export const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addOrder, updateOrder, orders, clients, products, updateProduct, addProductMovement } =
    useApp();

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

  // Selected Products from Inventory or Manual Items
  const [selectedProducts, setSelectedProducts] = useState<
    { productId: string; quantity: number; price: number; cost?: number; name: string }[]
  >([]);

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

    setSelectedProducts([
      ...selectedProducts,
      {
        productId: `manual-${Date.now()}`,
        name: manualName,
        price: price,
        cost: parseFloat(manualCost.replace(',', '.')) || 0,
        quantity: manualQty,
      },
    ]);
    setManualName('');
    setManualPrice('');
    setManualCost('');
    setManualQty(1);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())) &&
      p.quantity > 0
  );

  const priceParts = selectedProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const total = priceServices + priceParts - discount;

  const productSearchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target as Node)
      ) {
        setShowProductSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  useEffect(() => {
    if (id) {
      const orderToEdit = orders.find((o) => o.id === id);
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
    const existing = selectedProducts.find((p) => p.productId === product.id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product.id,
          name: product.name,
          price: product.priceSale,
          cost: product.priceCost || 0,
          quantity: 1,
        },
      ]);
    }
    setProductSearch('');
    setShowProductSuggestions(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productId !== productId));
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
        // EDIT MODE: Calculate differences in stock
        const existingOrder = orders.find((o) => o.id === id);
        if (existingOrder) {
          const oldProducts = existingOrder.selectedProducts || [];
          const newProducts = selectedProducts;

          const allProductIds = new Set([
            ...oldProducts.map((p) => p.productId),
            ...newProducts.map((p) => p.productId),
          ]);

          for (const productId of allProductIds) {
            if (productId.startsWith('manual-')) continue;

            const oldItem = oldProducts.find((p) => p.productId === productId);
            const newItem = newProducts.find((p) => p.productId === productId);

            const oldQty = oldItem ? oldItem.quantity : 0;
            const newQty = newItem ? newItem.quantity : 0;
            const diff = newQty - oldQty;

            if (diff !== 0) {
              const product = products.find((p) => p.id === productId);
              if (product) {
                await updateProduct({
                  ...product,
                  quantity: product.quantity - diff,
                });

                await addProductMovement({
                  productId: product.id,
                  type: diff > 0 ? MovementType.EXIT : MovementType.ENTRY,
                  quantityChange: diff > 0 ? -diff : Math.abs(diff),
                  note: `Atualização de OS (Edição)`,
                });
              }
            }
          }

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
            warrantyEnd: noWarranty ? null : existingOrder.warrantyEnd,
            selectedProducts,
          });
        }
      } else {
        // NEW MODE: Deduct selected products from inventory
        for (const item of selectedProducts) {
          if (item.productId.startsWith('manual-')) continue;

          const product = products.find((p) => p.id === item.productId);
          if (product) {
            await updateProduct({
              ...product,
              quantity: product.quantity - item.quantity,
            });

            await addProductMovement({
              productId: product.id,
              type: MovementType.EXIT,
              quantityChange: -item.quantity,
              note: `Consumido na Ordem de Serviço (Nova)`,
            });
          }
        }

        const createdAt = new Date().toISOString();

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
          warrantyEnd: null,
          selectedProducts,
        } as Partial<ServiceOrder>);
      }
      navigate('/orders');
    } catch (error) {
      console.error('Failed to save order', error);
      alert('Erro ao salvar ordem de serviço.');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-3.5 sm:gap-6 pb-36">
      {/* Clean White SaaS Header (Oculto no Mobile para economizar espaço - Padrão Bancada Mobile Pro) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all"
            title="Voltar para Ordens de Serviço"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                {id ? 'Edição' : 'Entrada de Bancada'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {id
                ? 'Atualize os dados da manutenção e peças da ordem.'
                : 'Preencha o formulário abaixo para registrar a entrada de manutenção.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-6">
        {/* Section 1: Client Selection */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <User size={16} />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Seleção do Cliente
              </h3>
            </div>
            {!id && (
              <button
                type="button"
                onClick={() => navigate('/clients/new')}
                className="flex items-center gap-1 text-primary text-xs font-black hover:underline"
              >
                <UserPlus size={14} />
                <span>+ Novo Cliente</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <CustomDropdown
              label="Buscar Cliente Cadastrado"
              placeholder="Digite o nome, CPF ou telefone do cliente..."
              options={clients.map((c) => ({
                value: c.id,
                label: c.name,
                subLabel: `${c.phone || ''} ${c.cpf ? '• ' + c.cpf : ''}`,
                icon: <User size={16} />,
              }))}
              selectedValue={selectedClientId || ''}
              onSelect={(val) => setSelectedClientId(val)}
              className="w-full"
            />

            {selectedClient && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                    {selectedClient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {selectedClient.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {selectedClient.phone} {selectedClient.cpf && `• CPF: ${selectedClient.cpf}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClientId(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                  title="Limpar seleção"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Section 2: Device & Diagnosis Information */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Smartphone size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Equipamento & Diagnóstico
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Modelo do Aparelho *
              </label>
              <input
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-900 dark:text-white transition-all"
                placeholder="Ex: iPhone 13 Pro Max"
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nº de Série / IMEI
              </label>
              <input
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
                placeholder="Opcional"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Senha / Padrão de Desbloqueio
              </label>
              <input
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-900 dark:text-white transition-all"
                placeholder="PIN ou Gesto (Opcional)"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Defeito Relatado / Problema Constatado *
              </label>
              <textarea
                className="w-full p-3 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900 dark:text-white min-h-[75px] sm:min-h-[90px] transition-all"
                placeholder="Descreva detalhadamente a queixa do cliente ou o defeito observado..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                required
              />
            </div>

            {/* Photo Attachment */}
            <div className="flex flex-col gap-1 md:col-span-3 pt-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Foto do Estado do Aparelho (Opcional)
              </label>
              <div className="flex items-center gap-3 sm:gap-4">
                {deviceImage && (
                  <div className="relative group shrink-0">
                    <img
                      src={deviceImage}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 dark:border-neutral-800"
                    />
                    <button
                      type="button"
                      onClick={() => setDeviceImage('')}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-md hover:scale-105 transition-transform"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer bg-slate-50/70 dark:bg-neutral-900/60 border border-dashed border-slate-300 dark:border-neutral-700 text-slate-500 hover:text-primary hover:border-primary/50 transition-all rounded-xl p-3 sm:p-4 flex items-center justify-center gap-2 text-xs font-bold w-full sm:w-auto">
                  <Upload size={16} />
                  <span>{deviceImage ? 'Trocar Foto' : 'Anexar Foto do Aparelho'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Services & Replacement Parts */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Wrench size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Mão de Obra & Peças Utilizadas
            </h3>
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Valor da Mão de Obra / Serviço (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                R$
              </span>
              <input
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={priceServices || ''}
                onChange={(e) => setPriceServices(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Adicionar Peças / Produtos Usados
              </label>
            </div>

            {/* Inventory Search Input */}
            <div className="relative" ref={productSearchRef}>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar peças por nome ou código SKU..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-900 dark:text-white transition-all"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductSuggestions(true);
                  }}
                  onFocus={() => setShowProductSuggestions(true)}
                />
              </div>

              {/* Suggestions Dropdown */}
              {showProductSuggestions && productSearch.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-800">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-neutral-900 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            SKU: {product.sku} • Estoque: {product.quantity} un
                          </span>
                        </div>
                        <span className="font-mono font-bold text-primary">
                          R$ {product.priceSale.toFixed(2)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhum produto em estoque encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Item Accordion/Form */}
            <div className="bg-slate-50/70 dark:bg-neutral-900/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-neutral-800/80 flex flex-col gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Ou Inserir Item Manualmente (Sem Estoque)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Nome da Peça / Item *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tela Frontal, Bateria..."
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={manualCost}
                    onChange={(e) => setManualCost(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Venda (R$) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    Qtd
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={manualQty}
                    onChange={(e) => setManualQty(parseInt(e.target.value) || 1)}
                    className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleAddManualItem}
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Itens Selecionados ({selectedProducts.length})
                </span>
                {selectedProducts.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between bg-slate-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        {item.quantity}x
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Venda: R$ {item.price.toFixed(2)}</span>
                          {item.cost !== undefined && item.cost > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              • Custo: R$ {item.cost.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black font-mono text-slate-900 dark:text-white">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(item.productId)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Totals, Discounts & Warranty */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <DollarSign size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Resumo Financeiro & Garantia
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Desconto Concedido (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-mono font-bold text-xs">
                    - R$
                  </span>
                  <input
                    className="w-full h-11 pl-12 pr-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 transition-all"
                    type="number"
                    step="0.01"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Warranty Checkbox */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 p-3.5 rounded-2xl flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={noWarranty}
                  onChange={(e) => setNoWarranty(e.target.checked)}
                  className="size-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  id="noWarrantyCheck"
                />
                <label htmlFor="noWarrantyCheck" className="flex flex-col cursor-pointer">
                  <span className="font-extrabold text-rose-700 dark:text-rose-400 text-xs flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    Serviço Isento de Garantia
                  </span>
                  <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70">
                    Marque apenas se este atendimento não incluir garantia.
                  </span>
                </label>
              </div>
            </div>

            {/* Total Financial Card */}
            <div className="bg-slate-900 dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between border border-slate-800 shadow-md">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Mão de Obra:</span>
                  <span>R$ {priceServices.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Peças / Itens:</span>
                  <span>R$ {priceParts.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Desconto:</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 mt-4 pt-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Valor Total da OS
                  </span>
                  <span className="text-2xl font-black font-mono text-white">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <Calculator size={28} className="text-slate-700" />
              </div>
            </div>
          </div>
        </section>

        {/* Action Footer Buttons (Responsivo: sem travar a rolagem no mobile) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs uppercase tracking-wider transition-all active:scale-98 text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black shadow-lg shadow-primary/30 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Save size={16} />
            <span>{id ? 'Salvar Alterações' : 'Gerar Ordem de Serviço'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};