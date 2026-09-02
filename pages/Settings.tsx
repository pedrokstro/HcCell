import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Shield,
  Palette,
  Bell,
  FileText,
  LogOut,
  Camera,
  History,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Lock,
  Sparkles,
  CheckCircle2,
  Sliders,
  Smartphone,
  Check,
  MessageSquare,
  Save
} from 'lucide-react';
import { APP_VERSION, APP_NAME } from '../constants';
import { ChangeLogModal } from '../components/ChangeLogModal';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';

export const Settings: React.FC = () => {
  const { user, darkMode, toggleTheme, logout, loading: dataLoading } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [subView, setSubView] = useState<string>('profile');
  const [profileImage, setProfileImage] = useState(user.avatarUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState({
    emailAlerts: localStorage.getItem('hccell_notif_email') !== 'false',
    lowStockAlerts: localStorage.getItem('hccell_notif_stock') === 'true',
    whatsappAlerts: localStorage.getItem('hccell_notif_whatsapp') !== 'false',
  });

  const handleToggleNotification = (
    key: 'emailAlerts' | 'lowStockAlerts' | 'whatsappAlerts',
    label: string
  ) => {
    const newValue = !notifications[key];
    const updated = { ...notifications, [key]: newValue };
    setNotifications(updated);

    const storageKeys = {
      emailAlerts: 'hccell_notif_email',
      lowStockAlerts: 'hccell_notif_stock',
      whatsappAlerts: 'hccell_notif_whatsapp',
    };
    localStorage.setItem(storageKeys[key], String(newValue));
    showToast(`${label} ${newValue ? 'ativado' : 'desativado'} com sucesso!`, 'success');
  };

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
      setProfileImage(user.avatarUrl);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione apenas arquivos de imagem.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB.', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = user.avatarUrl;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from('profiles').getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: formData.name, avatar_url: avatarUrl },
      });
      if (updateError) throw updateError;
      await supabase.from('profiles').upsert({
        id: user.id,
        name: formData.name,
        email: formData.email,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      showToast('Perfil atualizado com sucesso!', 'success');
      setImageFile(null);
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar perfil.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('As senhas não coincidem ou estão vazias.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      showToast('Senha atualizada com sucesso!', 'success');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar senha.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarItems = [
    { id: 'profile', icon: <User size={18} />, label: 'Perfil de Usuário', desc: 'Dados pessoais e avatar' },
    { id: 'account', icon: <Shield size={18} />, label: 'Segurança & Conta', desc: 'Senha e proteção' },
    { id: 'appearance', icon: <Palette size={18} />, label: 'Aparência & Tema', desc: 'Modo Claro / Escuro' },
    { id: 'notifications', icon: <Bell size={18} />, label: 'Notificações', desc: 'Alertas e canais' },
    { id: 'about', icon: <FileText size={18} />, label: 'Sobre o Sistema', desc: `HcCell v${APP_VERSION}` },
  ];

  const contentTitles: Record<string, { title: string; subtitle: string }> = {
    profile: {
      title: 'Perfil de Usuário',
      subtitle: 'Gerencie sua foto de perfil, nome e dados cadastrais.',
    },
    account: {
      title: 'Segurança da Conta',
      subtitle: 'Atualize sua senha de acesso e credenciais do sistema.',
    },
    appearance: {
      title: 'Aparência & Tema Visual',
      subtitle: 'Escolha a paleta de cores entre Clean White e SaaS Dark.',
    },
    notifications: {
      title: 'Preferências de Notificações',
      subtitle: 'Configure os alertas de e-mail, estoque e disparos de WhatsApp.',
    },
    about: {
      title: 'Informações do Sistema',
      subtitle: `${APP_NAME} • Versão ${APP_VERSION}`,
    },
  };

  const currentTitle = contentTitles[subView] || contentTitles.profile;

  // Profile View
  const renderProfile = () => (
    <div className="flex flex-col gap-6">
      {/* Avatar Box */}
      <div className="bg-slate-50/70 dark:bg-neutral-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="size-20 sm:size-24 rounded-full overflow-hidden bg-slate-200 dark:bg-neutral-800 ring-4 ring-primary/20 shadow-md">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${profileImage})` }}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-primary text-white rounded-full shadow-md hover:scale-105 transition-all"
            title="Alterar Foto"
          >
            <Camera size={14} />
          </button>
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 w-full sm:w-auto">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Foto de Perfil</h4>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-xs active:scale-95 text-center"
            >
              Enviar Nova Foto
            </button>
            <button
              type="button"
              onClick={() => {
                setProfileImage(user.avatarUrl);
                setImageFile(null);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-neutral-800 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all border border-slate-200 dark:border-neutral-700 active:scale-95 text-center"
            >
              Remover
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Formatos JPG, PNG ou GIF. Máximo de 5MB.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Primeiro Nome
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <User size={16} />
            </span>
            <input
              type="text"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-900 dark:text-white transition-all"
              placeholder="Nome"
              value={formData.name.split(' ')[0] || ''}
              onChange={(e) => {
                const parts = formData.name.split(' ');
                parts[0] = e.target.value;
                setFormData({ ...formData, name: parts.join(' ') });
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Sobrenome
          </label>
          <input
            type="text"
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-slate-900 dark:text-white transition-all"
            placeholder="Sobrenome"
            value={formData.name.split(' ').slice(1).join(' ')}
            onChange={(e) => {
              const first = formData.name.split(' ')[0] || '';
              setFormData({ ...formData, name: first + ' ' + e.target.value });
            }}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Endereço de E-mail (Verificado)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              disabled
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-100/70 dark:bg-neutral-900/30 border border-slate-200/60 dark:border-neutral-800 text-slate-400 font-medium text-xs cursor-not-allowed"
              value={formData.email}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Telefone de Contato
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Phone size={16} />
            </span>
            <input
              type="text"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
              placeholder="+55 (00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Função / Permissão
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary">
              <BadgeCheck size={16} />
            </span>
            <input
              type="text"
              disabled
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-100/70 dark:bg-neutral-900/30 border border-slate-200/60 dark:border-neutral-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase cursor-not-allowed"
              value={user.role}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Bio / Observações Pessoais
          </label>
          <textarea
            rows={3}
            className="w-full p-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900 dark:text-white resize-none transition-all"
            placeholder="Breve descrição sobre suas atribuições..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  // Account / Security View
  const renderAccount = () => (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="bg-slate-50/70 dark:bg-neutral-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
          <Shield size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
            Credenciais de Acesso
          </span>
          <span className="text-[11px] text-slate-400">
            Recomendamos utilizar uma senha forte contendo pelo menos 6 caracteres.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Nova Senha
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-bold text-slate-900 dark:text-white transition-all"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Appearance View
  const renderAppearance = () => (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Modo de Exibição do Sistema
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Escolha entre o visual Clean White SaaS ou o tema escuro de alta performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Light Theme Option */}
        <button
          type="button"
          onClick={() => darkMode && toggleTheme()}
          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-left ${
            !darkMode
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-surface-dark'
          }`}
        >
          <div className="w-full aspect-[16/10] rounded-xl bg-slate-100 border border-slate-200 p-2.5 flex flex-col gap-2 overflow-hidden mb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-2.5 bg-primary/30 rounded-md" />
              <div className="size-3 bg-primary/40 rounded-full" />
            </div>
            <div className="flex-1 bg-white rounded-lg border border-slate-200 p-2 flex flex-col gap-1.5 shadow-xs">
              <div className="w-16 h-2 bg-slate-300 rounded" />
              <div className="w-10 h-1.5 bg-slate-200 rounded" />
              <div className="w-full flex justify-end gap-1 mt-auto">
                <div className="w-6 h-2.5 bg-primary rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              Clean White SaaS
            </span>
            {!darkMode && <CheckCircle2 size={18} className="text-primary" />}
          </div>
        </button>

        {/* Dark Theme Option */}
        <button
          type="button"
          onClick={() => !darkMode && toggleTheme()}
          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-left ${
            darkMode
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-surface-dark'
          }`}
        >
          <div className="w-full aspect-[16/10] rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 flex flex-col gap-2 overflow-hidden mb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-2.5 bg-primary/30 rounded-md" />
              <div className="size-3 bg-primary/40 rounded-full" />
            </div>
            <div className="flex-1 bg-surface-dark rounded-lg border border-neutral-800 p-2 flex flex-col gap-1.5 shadow-xs">
              <div className="w-16 h-2 bg-neutral-700 rounded" />
              <div className="w-10 h-1.5 bg-neutral-800 rounded" />
              <div className="w-full flex justify-end gap-1 mt-auto">
                <div className="w-6 h-2.5 bg-primary rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              SaaS Dark Mode
            </span>
            {darkMode && <CheckCircle2 size={18} className="text-primary" />}
          </div>
        </button>
      </div>
    </div>
  );

  // Notifications View
  const renderNotifications = () => (
    <div className="flex flex-col gap-3">
      {/* Email Notifications */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Mail size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              Alertas por E-mail
            </span>
            <span className="text-[11px] text-slate-400">
              Receber e-mails de confirmação ao criar e atualizar ordens de serviço.
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={notifications.emailAlerts}
            onChange={() => handleToggleNotification('emailAlerts', 'Alertas por e-mail')}
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* Stock Alerts */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Bell size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              Alertas de Estoque Mínimo
            </span>
            <span className="text-[11px] text-slate-400">
              Notificar quando a quantidade de um produto em estoque atingir o limite.
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={notifications.lowStockAlerts}
            onChange={() => handleToggleNotification('lowStockAlerts', 'Alerta de estoque baixo')}
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* WhatsApp Automation */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <MessageSquare size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              Automação de Disparo WhatsApp
            </span>
            <span className="text-[11px] text-slate-400">
              Habilitar botão de notificação via WhatsApp ao concluir reparos.
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={notifications.whatsappAlerts}
            onChange={() => handleToggleNotification('whatsappAlerts', 'Disparo de WhatsApp')}
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>
    </div>
  );

  // About System View
  const renderAbout = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-50/70 dark:bg-neutral-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 flex flex-col items-center text-center">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20">
          <FileText size={30} />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {APP_NAME}
        </h3>
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mt-1">
          Versão {APP_VERSION}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase text-slate-400">Desenvolvedor</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">pedrokstro</span>
        </div>
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase text-slate-400">Licença do App</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Comercial Ativa
          </span>
        </div>
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase text-slate-400">Suporte Técnico</span>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-primary hover:underline"
          >
            Atendimento WhatsApp
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowChangelog(true)}
        className="w-full py-3 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all active:scale-95"
      >
        <History size={16} />
        <span>Ver Histórico de Atualizações</span>
      </button>
    </div>
  );

  const renderContent = () => {
    switch (subView) {
      case 'profile':
        return renderProfile();
      case 'account':
        return renderAccount();
      case 'appearance':
        return renderAppearance();
      case 'notifications':
        return renderNotifications();
      case 'about':
        return renderAbout();
      default:
        return renderProfile();
    }
  };

  const handleSave = () => {
    if (subView === 'account') {
      handleUpdatePassword();
    } else {
      handleSaveProfile();
    }
  };

  const showFooter = !dataLoading && (subView === 'profile' || subView === 'account');

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-3.5 sm:gap-6 pb-36 md:pb-12">
      {/* SaaS Header & User Banner (Desktop Only - Padrão Bancada Mobile Pro) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-800 ring-2 ring-primary/20 shrink-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider shrink-0">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white transition-all active:scale-95 self-start sm:self-auto"
        >
          <LogOut size={16} />
          <span>Encerrar Sessão</span>
        </button>
      </div>

      {/* Main Settings Container */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        {/* Navigation Sidebar / Horizontal Tabs on Mobile */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 p-2.5 sm:p-4 shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2.5 hidden md:block mb-2">
            Menu de Ajustes
          </span>
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            {sidebarItems.map((item) => {
              const isSelected = subView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSubView(item.id)}
                  className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-3.5 md:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap md:whitespace-normal text-left active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs shadow-primary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 bg-white/70 dark:bg-neutral-800/40 md:bg-transparent md:dark:bg-transparent border border-slate-200/60 dark:border-neutral-700/50 md:border-0'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.label}</span>
                    <span
                      className={`text-[10px] font-normal truncate hidden lg:block ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-6">
            <div className="border-b border-slate-100 dark:border-neutral-800 pb-3 sm:pb-4">
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentTitle.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentTitle.subtitle}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={subView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Footer (Responsivo) */}
          {showFooter && (
            <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100 dark:border-neutral-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs uppercase tracking-wider transition-all active:scale-98 text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black shadow-lg shadow-primary/30 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <ChangeLogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
        onConfirm={() => setShowChangelog(false)}
        showHistory={true}
      />
    </div>
  );
};