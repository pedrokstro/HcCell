import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../../store';
import { useToast } from '../../components/Toast';
import {
  User,
  MapPin,
  Check,
  ChevronLeft,
  Phone,
  Mail,
  FileText,
  Save,
  Building
} from 'lucide-react';
import { Client } from '../../types';
import { motion } from 'framer-motion';

export const ClientForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, addClient, updateClient } = useApp();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      const existing = clients.find((c) => c.id === id);
      if (existing) setFormData(existing);
    }
  }, [id, clients]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name || !formData.name.trim()) {
      showToast('O nome completo é obrigatório.', 'error');
      return;
    }

    const normalizedNewName = formData.name.trim().toLowerCase();

    // 1. Validação de Unicidade de CPF
    if (formData.cpf && formData.cpf.trim() !== '') {
      const duplicateCpf = clients.find(
        (c) =>
          c.id !== id &&
          c.cpf &&
          c.cpf.trim() !== '' &&
          c.cpf.trim() === formData.cpf?.trim()
      );
      if (duplicateCpf) {
        showToast(
          `Já existe um cliente cadastrado com este CPF: "${duplicateCpf.name}".`,
          'error'
        );
        return;
      }
    }

    // 2. Validação de Unicidade de Telefone
    if (formData.phone && formData.phone.trim() !== '') {
      const cleanNumber = (val: string) => val.replace(/[^\d]/g, '');
      const newCleanPhone = cleanNumber(formData.phone);

      const duplicatePhone = clients.find((c) => {
        if (c.id === id || !c.phone || c.phone.trim() === '') return false;
        return c.phone.trim() === formData.phone?.trim() || cleanNumber(c.phone) === newCleanPhone;
      });

      if (duplicatePhone) {
        showToast(
          `Já existe um cliente cadastrado com este telefone/WhatsApp: "${duplicatePhone.name}".`,
          'error'
        );
        return;
      }
    }

    // 3. Validação de Nome e Telefone combinados
    const normalizedNewPhone = (formData.phone || '').trim();
    const isDuplicateNamePhone = clients.some(
      (c) =>
        c.id !== id &&
        c.name.trim().toLowerCase() === normalizedNewName &&
        c.phone.trim() === normalizedNewPhone
    );

    if (isDuplicateNamePhone) {
      showToast('Já existe um cliente cadastrado com este mesmo nome e telefone.', 'error');
      return;
    }

    try {
      if (id) {
        await updateClient({ ...formData, id } as Client);
        showToast('Cliente atualizado com sucesso!', 'success');
      } else {
        await addClient({
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString().split('T')[0],
        } as Client);
        showToast('Cliente cadastrado com sucesso!', 'success');
      }
      navigate('/clients');
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      if (error.code === '23505') {
        showToast('Erro: O CPF ou telefone informado já pertence a outro cliente.', 'error');
      } else {
        showToast(error.message || 'Erro ao salvar cliente. Tente novamente.', 'error');
      }
    }
  };

  const nameInitials = (formData.name || 'NC').substring(0, 2).toUpperCase();

  return (
    <div className="max-w-[1000px] mx-auto flex flex-col gap-3.5 sm:gap-6 pb-36 md:pb-20">
      {/* Clean White SaaS Header (Oculto no Mobile para economizar espaço - Padrão Bancada Mobile Pro) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/clients"
            className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all"
            title="Voltar para Clientes"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                {id ? 'Edição' : 'Novo Cadastro'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {id ? 'Editar Cadastro de Cliente' : 'Novo Cliente'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cadastre e mantenha os dados de contato e identificação do cliente atualizados.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-6">
        {/* Section 1: Personal Info & Contact */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3.5 sm:gap-5">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-sm border border-primary/20 shrink-0">
              {nameInitials}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Informações Pessoais & Contato
              </h3>
              <span className="text-[11px] text-slate-400">
                Campos marcados com * são obrigatórios.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nome Completo *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-900 dark:text-white transition-all"
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                CPF / Documento
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={15} />
                </span>
                <input
                  type="text"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
                  placeholder="(00) 90000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                E-mail (Opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900 dark:text-white transition-all"
                  placeholder="cliente@exemplo.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Address */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <MapPin size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Endereço Residencial / Comercial (Opcional)
            </h3>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Endereço Completo
            </label>
            <input
              type="text"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900 dark:text-white transition-all"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </section>

        {/* Section 3: Notes */}
        <section className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileText size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Observações Adicionais (Opcional)
            </h3>
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900 dark:text-white resize-none transition-all"
              placeholder="Anotações internas, preferências ou históricos sobre o cliente..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </section>

        {/* Action Footer Buttons (Responsivo: sem travar a rolagem no mobile) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <Link
            to="/clients"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs uppercase tracking-wider transition-all active:scale-98 text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black shadow-lg shadow-primary/30 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Save size={16} />
            <span>{id ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};