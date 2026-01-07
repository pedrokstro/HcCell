
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../../store';
import { User, MapPin, Check, ArrowLeft } from 'lucide-react';
import { Client } from '../../types';

export const ClientForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, addClient, updateClient } = useApp();

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    cpf: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (id) {
      const existing = clients.find(c => c.id === id);
      if (existing) setFormData(existing);
    }
  }, [id, clients]);

  const handleSubmit = () => {
    if (!formData.name) return;

    if (id) {
      updateClient({ ...formData, id } as Client);
    } else {
      addClient({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString().split('T')[0]
      } as Client);
    }
    navigate('/clients');
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/clients" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{id ? 'Editar Cliente' : 'Novo Cliente'}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Cadastre as informações básicas para iniciar uma nova ordem.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <User size={20} className="text-primary" />
          Dados Pessoais
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome Completo <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">CPF</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Telefone / WhatsApp</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="email@exemplo.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 mt-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Endereço (Opcional)
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Endereço Completo</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Ex: Rua das Flores, 123, Bairro Centro, Cidade, Estado"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 mt-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Check size={20} className="text-primary" />
          Observações
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Informações adicionais sobre o cliente..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 mt-6">
        <Link to="/clients" className="px-6 py-3 rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
          Cancelar
        </Link>
        <button type="submit" onClick={handleSubmit} className="px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
          <Check size={18} />
          Salvar Cliente
        </button>
      </div>
    </div>
  );
};