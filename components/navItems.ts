import {
    LayoutDashboard,
    Users,
    Wrench,
    Package,
    Tag,
    BarChart3,
    Settings,
} from 'lucide-react';

export const navItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Wrench, label: 'Ordens de Serviço', path: '/orders' },
    { icon: Package, label: 'Estoque', path: '/inventory' },
    { icon: Tag, label: 'Categorias', path: '/inventory/categories' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];
