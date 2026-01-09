import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './lib/supabase';
import { Client, Product, ServiceOrder, OrderStatus, User, Category, ProductMovement, MovementType } from './types';

interface AppContextType {
    clients: Client[];
    products: Product[];
    orders: ServiceOrder[];
    categories: Category[];
    user: User;
    loading: boolean;
    productMovements: ProductMovement[];
    addClient: (client: Partial<Client>) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;
    addProduct: (product: Partial<Product>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addProductMovement: (movement: Partial<ProductMovement>) => Promise<void>;
    addOrder: (order: Partial<ServiceOrder>) => Promise<void>;
    updateOrder: (order: ServiceOrder) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    darkMode: boolean;
    toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default fallback user for UI consistency before profile load
const DEFAULT_USER: User = {
    id: '',
    name: 'Técnico',
    email: '',
    role: 'Staff',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tecnico&background=0D8ABC&color=fff'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User>(DEFAULT_USER);
    const [loading, setLoading] = useState(true);

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productMovements, setProductMovements] = useState<ProductMovement[]>([]);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                // Pass the session user metadata directly to ensure we have the latest data
                fetchUserProfile(session.user);
                fetchAllData();
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                fetchUserProfile(session.user);
                fetchAllData();
            } else {
                setClients([]);
                setProducts([]);
                setOrders([]);
                setCategories([]);
                setUser(DEFAULT_USER);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (sessionUser: any) => {
        const uid = sessionUser.id;
        const email = sessionUser.email;
        const metadata = sessionUser.user_metadata || {};

        try {
            // Priority:
            // 1. Auth Metadata (most recent after update)
            // 2. Profiles table (persistent storage)
            // 3. Fallback to defaults

            const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();

            // Determine avatar URL
            // Check metadata first (from updateUserUrl), then profile table, then default
            const avatarUrl = metadata.avatar_url || data?.avatar_url || `https://ui-avatars.com/api/?name=${metadata.name || data?.name || email?.split('@')[0] || 'User'}`;

            // Determine name
            const name = metadata.name || data?.name || email?.split('@')[0] || 'User';

            // Normalize Role
            let role = data?.role || 'Técnico';
            if (role === 'Technician' || role === 'technician') {
                role = 'Técnico';
                // Auto-migrate role in DB if it's the old value
                supabase.from('profiles').update({ role: 'Técnico' }).eq('id', uid).then(({ error }) => {
                    if (error) console.error("Auto-migrating role failed", error);
                });
            }

            setUser({
                id: uid,
                name: name,
                email: email || '',
                role: role,
                avatarUrl: avatarUrl
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Fallback if fetch fails but we have session data
            setUser({
                id: uid,
                name: metadata.name || email?.split('@')[0] || 'User',
                email: email || '',
                role: 'Técnico',
                avatarUrl: metadata.avatar_url || `https://ui-avatars.com/api/?name=${metadata.name || 'User'}`
            });
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [clientsRes, productsRes, ordersRes, categoriesRes, productMovementsRes] = await Promise.all([
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('products').select('*').order('created_at', { ascending: false }),
                supabase.from('service_orders').select('*').order('created_at', { ascending: false }),
                supabase.from('categories').select('*').order('created_at', { ascending: false }),
                supabase.from('product_movements').select('*').order('created_at', { ascending: false })
            ]);

            if (clientsRes.data) {
                setClients(clientsRes.data.map(c => ({
                    ...c,
                    createdAt: c.created_at
                })));
            }

            if (productsRes.data) {
                setProducts(productsRes.data.map(p => ({
                    ...p,
                    priceSale: p.price_sale,
                    priceCost: p.price_cost,
                    minStockLevel: p.min_stock_level,
                    imageUrl: p.image_url,
                    createdAt: p.created_at
                })));
            }

            if (categoriesRes.data) {
                setCategories(categoriesRes.data.map(c => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    icon: c.icon,
                    color: c.color,
                    createdAt: c.created_at
                })));
            }

            if (ordersRes.data) {
                setOrders(ordersRes.data.map(o => ({
                    ...o,
                    clientId: o.client_id,
                    deviceModel: o.device_model,
                    issueDescription: o.issue_description,
                    priceServices: o.price_services,
                    priceParts: o.price_parts,
                    createdAt: o.created_at,
                    warrantyEnd: o.warranty_end,
                    internalNotes: o.internal_notes,
                    selectedProducts: o.selected_products || [],
                    paymentMethod: o.payment_method,
                    servicePerformed: o.service_performed,
                    noWarranty: o.no_warranty,
                    deviceImage: o.device_image
                })));
            }

            if (productMovementsRes.data) {
                setProductMovements(productMovementsRes.data.map(m => ({
                    id: m.id,
                    productId: m.product_id,
                    type: m.type,
                    quantityChange: m.quantity_change,
                    priceOld: m.price_old,
                    priceNew: m.price_new,
                    note: m.note,
                    createdAt: m.created_at,
                    technicianName: m.technician_name
                })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    // --- Data Actions ---

    const addClient = async (client: Partial<Client>) => {
        const { data, error } = await supabase.from('clients').insert([{
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes
        }]).select();

        if (error) throw error;
        if (data) setClients([data[0], ...clients]);
    };

    const updateClient = async (client: Client) => {
        const { error } = await supabase.from('clients').update({
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes
        }).eq('id', client.id);

        if (error) throw error;
        setClients(clients.map(c => c.id === client.id ? client : c));
    };

    const addProduct = async (product: Partial<Product>) => {
        const dbProduct = {
            name: product.name,
            category: product.category,
            sku: product.sku,
            quantity: product.quantity,
            price_cost: product.priceCost,
            price_sale: product.priceSale,
            supplier: product.supplier,
            image_url: product.imageUrl,
            min_stock_level: product.minStockLevel,
            description: product.description
        };

        const { data, error } = await supabase.from('products').insert([dbProduct]).select();

        if (error) throw error;
        if (data) {
            const newProduct = { ...data[0], priceSale: data[0].price_sale, priceCost: data[0].price_cost, minStockLevel: data[0].min_stock_level, imageUrl: data[0].image_url };
            setProducts([newProduct, ...products]);
        }
    };

    const updateProduct = async (product: Product) => {
        const dbProduct = {
            name: product.name,
            category: product.category,
            sku: product.sku,
            quantity: product.quantity,
            price_cost: product.priceCost,
            price_sale: product.priceSale,
            supplier: product.supplier,
            image_url: product.imageUrl,
            min_stock_level: product.minStockLevel,
            description: product.description
        };

        const { error } = await supabase.from('products').update(dbProduct).eq('id', product.id);

        if (error) throw error;
        setProducts(products.map(p => p.id === product.id ? product : p));
    };

    const deleteProduct = async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
    };

    const addOrder = async (order: Partial<ServiceOrder>) => {
        const dbOrder = {
            client_id: order.clientId,
            device_model: order.deviceModel,
            issue_description: order.issueDescription,
            status: order.status || 'Pendente',
            price_services: order.priceServices || 0,
            price_parts: order.priceParts || 0,
            discount: order.discount || 0,
            total: order.total || 0,
            internal_notes: order.internalNotes,
            created_at: order.createdAt,
            warranty_end: order.warrantyEnd,
            selected_products: order.selectedProducts,
            payment_method: order.paymentMethod,
            service_performed: order.servicePerformed,
            no_warranty: order.noWarranty || false,
            device_image: order.deviceImage
        };

        const { data, error } = await supabase.from('service_orders').insert([dbOrder]).select();

        if (error) throw error;
        if (data) {
            fetchAllData();
        }
    };

    const updateOrder = async (order: ServiceOrder) => {
        const dbOrder = {
            client_id: order.clientId,
            device_model: order.deviceModel,
            issue_description: order.issueDescription,
            status: order.status,
            price_services: order.priceServices,
            price_parts: order.priceParts,
            discount: order.discount,
            total: order.total,
            internal_notes: order.internalNotes,
            warranty_end: order.warrantyEnd,
            selected_products: order.selectedProducts,
            payment_method: order.paymentMethod,
            service_performed: order.servicePerformed,
            no_warranty: order.noWarranty,
            device_image: order.deviceImage
        };

        const { error } = await supabase.from('service_orders').update(dbOrder).eq('id', order.id);
        if (error) throw error;
        // Reload to sync
        fetchAllData();
    };

    const deleteOrder = async (id: string) => {
        // Return parts to stock before deleting, if not already cancelled
        const orderToDelete = orders.find(o => o.id === id);

        if (orderToDelete && orderToDelete.status !== OrderStatus.CANCELLED && orderToDelete.selectedProducts?.length) {
            for (const item of orderToDelete.selectedProducts) {
                // Skip manual items
                if (item.productId.startsWith('manual-')) continue;

                const product = products.find(p => p.id === item.productId);
                if (product) {
                    // Update product quantity
                    await supabase.from('products').update({
                        quantity: product.quantity + item.quantity
                    }).eq('id', product.id);

                    // Log movement
                    await supabase.from('product_movements').insert([{
                        product_id: product.id,
                        type: MovementType.ENTRY,
                        quantity_change: item.quantity,
                        price_old: product.priceSale,
                        price_new: product.priceSale,
                        note: `Estoque devolvido (Exclusão da OS #${id.slice(0, 8)})`,
                        technician_name: user?.name || 'Sistema',
                        created_at: new Date().toISOString()
                    }]);
                }
            }
        }

        const { error } = await supabase.from('service_orders').delete().eq('id', id);
        if (error) throw error;

        // Reload all data to ensure products match DB and order is gone
        fetchAllData();
    };

    const addProductMovement = async (movement: Partial<ProductMovement>) => {
        const dbMovement = {
            product_id: movement.productId,
            type: movement.type,
            quantity_change: movement.quantityChange,
            price_old: movement.priceOld,
            price_new: movement.priceNew,
            note: movement.note,
            technician_name: user.name,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('product_movements').insert([dbMovement]);
        if (error) throw error;
        fetchAllData();
    };

    return (
        <AppContext.Provider value={{
            clients, products, orders, categories, user, loading, productMovements,
            addClient, updateClient,
            addProduct, updateProduct, deleteProduct, addProductMovement,
            addOrder, updateOrder, deleteOrder,
            isAuthenticated, login, logout,
            darkMode, toggleTheme
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};