export interface Client {
    id: string;
    name: string;
    cpf: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    quantity: number;
    priceCost: number;
    priceSale: number;
    supplier?: string;
    imageUrl?: string;
    minStockLevel?: number;
    description?: string;
    createdAt: string;
}

export enum MovementType {
    ENTRY = 'Entrada',
    EXIT = 'Saída',
    PRICE_UPDATE = 'Ajuste de Preço',
    MANUAL_ADJUSTMENT = 'Ajuste Manual'
}

export interface ProductMovement {
    id: string;
    productId: string;
    type: MovementType;
    quantityChange?: number;
    priceOld?: number;
    priceNew?: number;
    note?: string;
    createdAt: string;
    technicianName?: string;
}

export enum OrderStatus {
    PENDING = 'Pendente',
    IN_PROGRESS = 'Em Andamento',
    WAITING_WITHDRAWAL = 'Aguardando Retirada',
    COMPLETED = 'Concluído',
    CANCELLED = 'Cancelado'
}

export interface PaymentEntry {
    method: PaymentMethod;
    amount: number;
    installments?: number;
}

export interface ServiceOrder {
    id: string;
    clientId?: string | null;
    deviceModel: string;
    serialNumber?: string;
    passcode?: string;
    deviceImage?: string; // Foto do aparelho
    issueDescription: string;
    serviceType?: string;
    status: OrderStatus;
    executionDate?: string;
    warrantyEnd?: string | null;
    noWarranty?: boolean; // Sem garantia
    priceServices: number;
    priceParts: number;
    discount: number;
    total: number;
    technician?: string;
    createdAt: string;
    internalNotes?: string;
    selectedProducts?: { productId: string; quantity: number; price: number; cost?: number; name: string }[];
    paymentMethod?: PaymentMethod;
    payments?: PaymentEntry[]; // Hybrid payments
    servicePerformed?: string;
}

export type PaymentMethod = 'Cartão de Crédito' | 'Cartão de Débito' | 'PIX' | 'Dinheiro' | 'Múltiplo';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    productCount?: number;
    createdAt?: string;
}

export interface WarrantyRecord {
    id: string;
    orderId: string;
    clientId?: string;
    expiryDate: string;
    notified: boolean;
    dismissed: boolean;
    dismissedAt?: string;
    notes?: string;
    createdAt: string;
}