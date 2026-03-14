import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Tag, Package, Edit2, Trash2, X, CheckCircle, ChevronRight, BarChart3, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { useToast } from '../../components/Toast';


const ICON_OPTIONS = [
    { name: 'cases', label: 'Capas' },
    { name: 'screen_lock_portrait', label: 'Películas' },
    { name: 'battery_charging_full', label: 'Carregadores' },
    { name: 'cable', label: 'Cabos' },
    { name: 'headphones', label: 'Fones/Audio' },
    { name: 'build', label: 'Peças/Reparo' },
    { name: 'battery_alert', label: 'Baterias' },
    { name: 'smartphone', label: 'Smartphones' },
    { name: 'tablet_mac', label: 'Tablets' },
    { name: 'watch', label: 'Relógios/Smartwatch' },
    { name: 'laptop', label: 'Notebooks/PC' },
    { name: 'print', label: 'Impressoras' },
    { name: 'router', label: 'Rede/Wifi' },
    { name: 'memory', label: 'Armazenamento' },
    { name: 'sim_card', label: 'Chips/SIM' },
    { name: 'videogame_asset', label: 'Games' },
    { name: 'speaker', label: 'Caixas de Som' },
    { name: 'mouse', label: 'Periféricos' },
    { name: 'security', label: 'Segurança' },
    { name: 'settings_remote', label: 'Controles' },
    { name: 'usb', label: 'USB/Pendrive' },
    { name: 'sd_card', label: 'Cartão SD' }
];

const COLOR_OPTIONS = [
    { value: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    { value: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    { value: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    { value: 'indigo', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    { value: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
    { value: 'slate', bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' },
    { value: 'red', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    { value: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { value: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
    { value: 'teal', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    { value: 'lime', bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-600 dark:text-lime-400' },
    { value: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
    { value: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    { value: 'fuchsia', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    { value: 'sky', bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    { value: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' }
];

export const CategoriesList: React.FC = () => {
    const { showToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'cases',
        color: 'purple'
    });

    useEffect(() => {
        fetchCategories();
        fetchUserPreference();
    }, []);

    const fetchUserPreference = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('category_view_mode')
                .eq('id', user.id)
                .single();

            if (data?.category_view_mode) {
                setViewMode(data.category_view_mode as 'grid' | 'list');
            }
        }
    };

    const toggleViewMode = async (mode: 'grid' | 'list') => {
        setViewMode(mode);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('profiles')
                .update({ category_view_mode: mode })
                .eq('id', user.id);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoriesError) throw categoriesError;

            // Fetch products to count (just category field)
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('category');

            if (productsError) throw productsError;

            // Calculate counts
            const productCounts = productsData?.reduce((acc: { [key: string]: number }, product) => {
                const catName = product.category || 'Uncategorized';
                acc[catName] = (acc[catName] || 0) + 1;
                return acc;
            }, {}) || {};

            const categoriesWithCount = categoriesData?.map(cat => ({
                id: cat.id,
                name: cat.name,
                description: cat.description,
                icon: cat.icon,
                color: cat.color,
                // Match by name since we store category as string in products table
                productCount: productCounts[cat.name] || 0,
                createdAt: cat.created_at
            })) || [];

            setCategories(categoriesWithCount);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            showToast('Erro ao carregar categorias', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showToast('Nome da categoria é obrigatório', 'error');
            return;
        }

        try {
            if (editingCategory) {
                // Update
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        icon: formData.icon,
                        color: formData.color
                    })
                    .eq('id', editingCategory.id);

                if (error) throw error;
                showToast('Categoria atualizada com sucesso!', 'success');
            } else {
                // Create
                const { error } = await supabase
                    .from('categories')
                    .insert([{
                        name: formData.name,
                        description: formData.description,
                        icon: formData.icon,
                        color: formData.color
                    }]);

                if (error) throw error;
                showToast('Categoria criada com sucesso!', 'success');
            }

            fetchCategories();
            closeModal();
        } catch (error: any) {
            console.error('Error saving category:', error);
            showToast(`Erro ao salvar categoria: ${error.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Categoria excluída com sucesso!', 'success');
            fetchCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            showToast(`Erro ao excluir categoria: ${error.message}`, 'error');
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                icon: category.icon || 'cases',
                color: category.color || 'purple'
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                icon: 'cases',
                color: 'purple'
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: 'cases',
            color: 'purple'
        });
    };

    const getColorClasses = (color?: string) => {
        const colorOption = COLOR_OPTIONS.find(c => c.value === color);
        return colorOption || COLOR_OPTIONS[0];
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

    return (
        <>
            <div className="flex flex-col gap-6 animate-fade-in">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Link to="/dashboard" className="hover:text-primary">Início</Link>
                    <span>/</span>
                    <Link to="/inventory" className="hover:text-primary">Estoque</Link>
                    <span>/</span>
                    <span className="text-primary font-medium">Categorias</span>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Categorias</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie as categorias de produtos do estoque</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Categories Grid */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Categorias</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{categories.length}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Produtos</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{totalProducts}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Categorias Ativas</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{categories.filter(c => (c.productCount || 0) > 0).length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="text-slate-400" size={18} />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-transparent focus:bg-white dark:focus:bg-neutral-800 focus:border-primary border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white transition-all outline-none placeholder-slate-400"
                                    placeholder="Buscar categorias..."
                                />
                            </div>

                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg">
                                <button
                                    onClick={() => toggleViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    title="Visualização em Grade"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => toggleViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-neutral-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    title="Visualização em Lista"
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => openModal()}
                                className="hidden sm:flex bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-medium items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all whitespace-nowrap"
                            >
                                <Plus size={18} />
                                Nova Categoria
                            </button>
                        </div>

                        {/* Categories Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-slate-500">Carregando categorias...</p>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                <Tag className="mx-auto text-slate-300" size={48} />
                                <p className="mt-4 text-slate-500">Nenhuma categoria encontrada</p>
                                <button onClick={() => openModal()} className="mt-2 text-primary font-medium hover:underline">Criar nova</button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
                                {/* Add New Card Mini */}
                                <button
                                    onClick={() => openModal()}
                                    className="group bg-slate-50 dark:bg-neutral-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-neutral-800 p-4 flex items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all h-full min-h-[140px]"
                                >
                                    <div>
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 mb-2 group-hover:text-primary group-hover:border-primary transition-colors mx-auto">
                                            <Plus size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary">Adicionar</span>
                                    </div>
                                </button>

                                {filteredCategories.map((category) => {
                                    const colorClasses = getColorClasses(category.color);
                                    return (
                                        <div
                                            key={category.id}
                                            className="group bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 relative flex flex-col justify-between h-full min-h-[140px]"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center ${colorClasses.text}`}>
                                                    <span className="material-icons-round text-xl">{category.icon || 'category'}</span>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button
                                                        onClick={() => openModal(category)}
                                                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1" title={category.name}>{category.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{category.description || 'Sem descrição'}</p>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full bg-slate-100 dark:bg-neutral-800">
                                                    {category.productCount || 0} itens
                                                </span>
                                                <Link
                                                    to={`/inventory?category=${category.name}`}
                                                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                                >
                                                    Ver estoque
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-x-auto animate-fade-in-up">
                                    <table className="w-full min-w-[700px] text-left">
                                        <thead className="bg-slate-50 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Produtos</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex justify-end">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                            {filteredCategories.map((category) => {
                                                const colorClasses = getColorClasses(category.color);
                                                return (
                                                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-lg ${colorClasses.bg} flex items-center justify-center ${colorClasses.text}`}>
                                                                    <span className="material-icons-round text-lg">{category.icon || 'category'}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{category.name}</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium">Criado em {new Date(category.createdAt || '').toLocaleDateString('pt-BR')}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">{category.description || '-'}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
                                                                {category.productCount || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <Link
                                                                    to={`/inventory?category=${category.name}`}
                                                                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                                    title="Ver Estoque"
                                                                >
                                                                    <ChevronRight size={18} />
                                                                </Link>
                                                                <button
                                                                    onClick={() => openModal(category)}
                                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(category.id)}
                                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Excluir"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card List View (when in list mode) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {filteredCategories.map((category) => {
                                        const colorClasses = getColorClasses(category.color);
                                        return (
                                            <div key={category.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 p-4 shadow-sm flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center ${colorClasses.text} shrink-0`}>
                                                            <span className="material-icons-round text-2xl">{category.icon || 'category'}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{category.name}</h3>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{category.description || 'Sem descrição'}</p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/inventory?category=${category.name}`}
                                                        className="p-2 text-primary bg-primary/5 dark:bg-primary/10 rounded-lg"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </Link>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                        {category.productCount || 0} Produtos
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openModal(category)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column: Sidebar Widgets */}
                    <div className="flex flex-col gap-6">
                        {/* Distribution Widget */}
                        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 size={18} className="text-slate-400" />
                                    Top Categorias
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {[...categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0)).slice(0, 5).map((cat, index) => {
                                    const percentage = totalProducts > 0 ? ((cat.productCount || 0) / totalProducts) * 100 : 0;
                                    const colorClasses = getColorClasses(cat.color);
                                    return (
                                        <div key={cat.id}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                                <span className="text-slate-500 dark:text-slate-400">{cat.productCount} ({Math.round(percentage)}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${cat.color === 'purple' ? 'bg-purple-500' :
                                                        cat.color === 'blue' ? 'bg-blue-500' :
                                                            cat.color === 'amber' ? 'bg-amber-500' :
                                                                cat.color === 'indigo' ? 'bg-indigo-500' :
                                                                    cat.color === 'pink' ? 'bg-pink-500' :
                                                                        cat.color === 'red' ? 'bg-red-500' :
                                                                            cat.color === 'emerald' ? 'bg-emerald-500' :
                                                                                cat.color === 'cyan' ? 'bg-cyan-500' :
                                                                                    cat.color === 'teal' ? 'bg-teal-500' :
                                                                                        cat.color === 'lime' ? 'bg-lime-500' :
                                                                                            cat.color === 'rose' ? 'bg-rose-500' :
                                                                                                cat.color === 'violet' ? 'bg-violet-500' :
                                                                                                    cat.color === 'fuchsia' ? 'bg-fuchsia-500' :
                                                                                                        cat.color === 'sky' ? 'bg-sky-500' :
                                                                                                            cat.color === 'orange' ? 'bg-orange-500' :
                                                                                                                'bg-slate-500'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {categories.length === 0 && <p className="text-sm text-slate-400 py-2">Nenhuma categoria para exibir.</p>}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
                                <p className="text-xs text-slate-400 text-center">Baseado na quantidade de itens em estoque</p>
                            </div>
                        </div>

                        {/* Empty Categories Widget */}
                        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <AlertCircle size={18} className="text-slate-400" />
                                Categorias Vazias
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.filter(c => (c.productCount || 0) === 0).length > 0 ? (
                                    categories.filter(c => (c.productCount || 0) === 0).slice(0, 10).map(cat => (
                                        <span key={cat.id} className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 flex items-center gap-1 group">
                                            {cat.name}
                                            <button onClick={() => handleDelete(cat.id)} className="hover:text-red-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                        <CheckCircle size={16} /> Sem categorias vazias
                                    </p>
                                )}
                            </div>
                            {categories.filter(c => (c.productCount || 0) === 0).length > 10 && (
                                <p className="text-xs text-slate-400 mt-2">+ mais {categories.filter(c => (c.productCount || 0) === 0).length - 10}...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {
                    showModal && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-neutral-800">
                                <div className="p-6 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Nome da Categoria <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Ex: Capas, Películas..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Descrição
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            rows={3}
                                            placeholder="Descrição opcional..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Ícone
                                        </label>
                                        <div className="max-h-[160px] overflow-y-auto border border-slate-100 dark:border-neutral-800 rounded-lg p-1">
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                {ICON_OPTIONS.map((icon) => (
                                                    <button
                                                        key={icon.name}
                                                        onClick={() => setFormData({ ...formData, icon: icon.name })}
                                                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${formData.icon === icon.name
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-neutral-800'
                                                            }`}
                                                        title={icon.label}
                                                    >
                                                        <span className="material-icons-round text-slate-700 dark:text-slate-300 text-2xl">{icon.name}</span>
                                                        <span className="text-[10px] text-slate-500 truncate w-full text-center">{icon.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Cor
                                        </label>
                                        <div className="max-h-[120px] overflow-y-auto border border-slate-100 dark:border-neutral-800 rounded-lg p-1">
                                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                                {COLOR_OPTIONS.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                                        className={`p-1.5 rounded-lg border-2 transition-all ${formData.color === color.value
                                                            ? 'border-primary'
                                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-neutral-800'
                                                            }`}
                                                    >
                                                        <div className={`w-full h-8 rounded ${color.bg}`}></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-200 dark:border-neutral-800 flex gap-3 justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>

            {/* FAB Mobile removed */}
        </>
    );
};
