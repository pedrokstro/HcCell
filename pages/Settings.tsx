import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import {
    User, Mail, Phone, BadgeCheck, Shield, Palette, Bell,
    FileText, LogOut, Camera, History, Eye, EyeOff, Sun, Moon,
    Info, ChevronRight, ArrowLeft, Upload, Lock
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

    // Estado e manipulação de notificações com localStorage e feedback visual imediato
    const [notifications, setNotifications] = useState({
        emailAlerts: localStorage.getItem('hccell_notif_email') !== 'false',
        lowStockAlerts: localStorage.getItem('hccell_notif_stock') === 'true',
        whatsappAlerts: localStorage.getItem('hccell_notif_whatsapp') !== 'false'
    });

    const handleToggleNotification = (key: 'emailAlerts' | 'lowStockAlerts' | 'whatsappAlerts', label: string) => {
        const newValue = !notifications[key];
        const updated = { ...notifications, [key]: newValue };
        setNotifications(updated);
        
        const storageKeys = {
            emailAlerts: 'hccell_notif_email',
            lowStockAlerts: 'hccell_notif_stock',
            whatsappAlerts: 'hccell_notif_whatsapp'
        };
        localStorage.setItem(storageKeys[key], String(newValue));
        showToast(`${label} ${newValue ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    };

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: '',
        bio: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    // Sync form data when user profile loads
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
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
                const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, imageFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
                avatarUrl = publicUrl;
            }
            const { error: updateError } = await supabase.auth.updateUser({
                data: { name: formData.name, avatar_url: avatarUrl }
            });
            if (updateError) throw updateError;
            await supabase.from('profiles').upsert({
                id: user.id, name: formData.name, email: formData.email,
                avatar_url: avatarUrl, updated_at: new Date().toISOString()
            });
            showToast('Perfil atualizado!', 'success');
            setImageFile(null);
        } catch (error: any) {
            showToast(error.message || 'Erro ao salvar.', 'error');
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
            showToast('Senha atualizada!', 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showToast(error.message || 'Erro ao atualizar senha.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Sidebar menu items ───
    const sidebarItems = [
        { id: 'profile', icon: <User size={20} />, label: 'Perfil' },
        { id: 'account', icon: <Shield size={20} />, label: 'Conta' },
        { id: 'appearance', icon: <Palette size={20} />, label: 'Aparência' },
        { id: 'notifications', icon: <Bell size={20} />, label: 'Notificações' },
    ];

    // ─── Content titles ───
    const contentTitles: Record<string, { title: string; subtitle: string }> = {
        profile: { title: 'Informações de Perfil', subtitle: 'Gerencie seu perfil público e detalhes pessoais.' },
        account: { title: 'Segurança da Conta', subtitle: 'Atualize sua senha e mantenha sua conta segura.' },
        appearance: { title: 'Aparência', subtitle: 'Personalize sua experiência visual.' },
        notifications: { title: 'Notificações', subtitle: 'Gerencie suas preferências de notificação.' },
        about: { title: 'Sobre', subtitle: `${APP_NAME} v${APP_VERSION}` },
    };

    const currentTitle = contentTitles[subView] || contentTitles.profile;

    // ─── RENDER: Profile Skeleton ───
    const renderProfileSkeleton = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* Profile Form Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>

            {/* Permissions Preview Skeleton */}
            <div className="mt-8 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <Skeleton key={i} className="h-8 w-full" />
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
        </div>
    );

    // ─── RENDER: Profile ───
    const renderProfile = () => (
        <div className="space-y-4 flex flex-col">
            {/* Card 1: Avatar */}
            <div className="bg-white dark:bg-surface-dark rounded-[24px] p-5 border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                    <div className="size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800 ring-4 ring-primary/10 shadow-md">
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${profileImage})` }} />
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-[0_4px_12px_rgba(4,157,174,0.4)] border-2 border-white dark:border-surface-dark hover:scale-105 active:scale-95 transition-all"
                    >
                        <Camera size={15} />
                    </button>
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5">
                    <h4 className="text-sm font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">Foto de Perfil</h4>
                    <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-md shadow-primary/15 active:scale-95">
                            Enviar Nova
                        </button>
                        <button onClick={() => { setProfileImage(user.avatarUrl); setImageFile(null); }} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors active:scale-95">
                            Remover
                        </button>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">JPG, GIF ou PNG. Máx 5MB.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {/* Card 2: Form Grid */}
            <div className="bg-white dark:bg-surface-dark rounded-[24px] p-5 border border-slate-200/50 dark:border-white/5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-neutral-800/40 pb-2">Informações de Perfil</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <User size={18} />
                            </span>
                            <input
                                className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-sm py-3 outline-none transition-colors"
                                placeholder="Seu primeiro nome"
                                value={formData.name.split(' ')[0] || ''}
                                onChange={e => {
                                    const parts = formData.name.split(' ');
                                    parts[0] = e.target.value;
                                    setFormData({ ...formData, name: parts.join(' ') });
                                }}
                            />
                        </div>
                    </div>
                    {/* Last Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sobrenome</label>
                        <input
                            className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-sm py-3 px-3.5 outline-none transition-colors"
                            placeholder="Seu sobrenome"
                            value={formData.name.split(' ').slice(1).join(' ')}
                            onChange={e => {
                                const first = formData.name.split(' ')[0] || '';
                                setFormData({ ...formData, name: first + ' ' + e.target.value });
                            }}
                        />
                    </div>
                    {/* Email */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço de E-mail</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Mail size={18} />
                            </span>
                            <input
                                className="w-full rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-slate-400 dark:text-slate-500 pl-10 shadow-sm text-sm py-3 cursor-not-allowed"
                                value={formData.email}
                                disabled
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Este e-mail será usado para notificações e redefinição de senha.</p>
                    </div>
                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Phone size={18} />
                            </span>
                            <input
                                className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-sm py-3 outline-none transition-colors"
                                placeholder="+55 (00) 00000-0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Role (Read Only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <BadgeCheck size={18} />
                            </span>
                            <input
                                className="w-full rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-slate-400 dark:text-slate-500 pl-10 cursor-not-allowed text-sm py-3"
                                disabled
                                value={user.role}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: Bio */}
            <div className="bg-white dark:bg-surface-dark rounded-[24px] p-5 border border-slate-200/50 dark:border-white/5 shadow-sm space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-neutral-800/40 pb-2 block w-full">Bio / Observações</label>
                <textarea
                    className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-sm py-3 px-3.5 outline-none resize-none transition-all"
                    placeholder="Escreva uma breve descrição sobre você..."
                    rows={3}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
            </div>
        </div>
    );

    // ─── RENDER: Account/Security ───
    const renderAccount = () => (
        <div className="bg-white dark:bg-surface-dark rounded-[24px] p-5 border border-slate-200/50 dark:border-white/5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-neutral-800/40 pb-2">Segurança da Conta</h4>
            <div className="grid grid-cols-1 gap-4 max-w-lg">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nova Senha</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Lock size={18} />
                        </span>
                        <input
                            className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-sm py-3 outline-none transition-colors"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Shield size={18} />
                        </span>
                        <input
                            className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-sm py-3 outline-none transition-colors"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Dica: A senha deve conter pelo menos 6 caracteres e incluir letras e números para manter sua conta segura.
                </p>
            </div>
        </div>
    );

    const renderAppearance = () => (
        <div className="bg-white dark:bg-surface-dark rounded-[24px] p-5 border border-slate-200/50 dark:border-white/5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-neutral-800/40 pb-2">Tema Visual</h4>
            <div className="space-y-4">
                <p className="text-xs text-slate-400 dark:text-slate-500">Escolha a aparência geral do sistema de acordo com sua preferência.</p>
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                    {/* Tema Claro */}
                    <button
                        onClick={() => darkMode && toggleTheme()}
                        className={`group relative flex flex-col items-center p-3 rounded-3xl border-2 transition-all text-left ${
                            !darkMode 
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                                : 'border-slate-100 dark:border-neutral-800 hover:border-slate-200 dark:hover:border-neutral-700 bg-transparent'
                        }`}
                    >
                        {/* Mini Preview Claro */}
                        <div className="w-full aspect-[4/3] rounded-2xl bg-slate-50 border border-slate-200 p-2 flex flex-col gap-1.5 overflow-hidden select-none mb-3">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-2 bg-primary/20 rounded-full" />
                                <div className="w-2.5 h-2.5 bg-primary/30 rounded-full" />
                            </div>
                            <div className="flex-1 bg-white rounded-xl border border-slate-100 p-1.5 flex flex-col gap-1 shadow-sm">
                                <div className="w-12 h-1.5 bg-slate-300 rounded" />
                                <div className="w-8 h-1 bg-slate-200 rounded" />
                                <div className="w-full flex justify-end gap-1 mt-auto">
                                    <div className="w-5 h-2 bg-primary/10 rounded" />
                                    <div className="w-5 h-2 bg-primary rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider ${!darkMode ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                Claro
                            </span>
                            {!darkMode && (
                                <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center p-0.5">
                                    <BadgeCheck size={12} className="stroke-[3]" />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Tema Escuro */}
                    <button
                        onClick={() => !darkMode && toggleTheme()}
                        className={`group relative flex flex-col items-center p-3 rounded-3xl border-2 transition-all text-left ${
                            darkMode 
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                                : 'border-slate-100 dark:border-neutral-800 hover:border-slate-200 dark:hover:border-neutral-700 bg-transparent'
                        }`}
                    >
                        {/* Mini Preview Escuro */}
                        <div className="w-full aspect-[4/3] rounded-2xl bg-[#091113] border border-neutral-800 p-2 flex flex-col gap-1.5 overflow-hidden select-none mb-3">
                            <div className="flex items-center justify-between">
                                <div className="w-8 h-2 bg-primary/20 rounded-full" />
                                <div className="w-2.5 h-2.5 bg-primary/30 rounded-full" />
                            </div>
                            <div className="flex-1 bg-surface-dark rounded-xl border border-neutral-800 p-1.5 flex flex-col gap-1 shadow-sm">
                                <div className="w-12 h-1.5 bg-neutral-700 rounded" />
                                <div className="w-8 h-1 bg-neutral-800 rounded" />
                                <div className="w-full flex justify-end gap-1 mt-auto">
                                    <div className="w-5 h-2 bg-neutral-850 rounded" />
                                    <div className="w-5 h-2 bg-primary rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                Escuro
                            </span>
                            {darkMode && (
                                <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center p-0.5">
                                    <BadgeCheck size={12} className="stroke-[3]" />
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="bg-white dark:bg-surface-dark rounded-[24px] p-5 border border-slate-200/50 dark:border-white/5 shadow-sm space-y-1 divide-y divide-slate-100 dark:divide-neutral-800/40">
            {/* Alertas por E-mail */}
            <div className="flex items-center justify-between py-4 first:pt-0">
                <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Alertas de Novas Ordens (E-mail)</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Receba e-mails informativos ao criar ou atualizar ordens de serviço.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.emailAlerts}
                        onChange={() => handleToggleNotification('emailAlerts', 'Alertas por e-mail')}
                    />
                    <div className="w-11 h-6 bg-slate-100 dark:bg-neutral-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
            </div>
            
            {/* Alertas de Estoque Baixo */}
            <div className="flex items-center justify-between py-4">
                <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Alertas de Estoque Baixo</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Receba avisos instantâneos quando um produto atingir o limite mínimo de estoque.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.lowStockAlerts}
                        onChange={() => handleToggleNotification('lowStockAlerts', 'Alerta de estoque baixo')}
                    />
                    <div className="w-11 h-6 bg-slate-100 dark:bg-neutral-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
            </div>

            {/* Envio de WhatsApp */}
            <div className="flex items-center justify-between py-4 last:pb-0">
                <div className="pr-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Disparo de WhatsApp Automático</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Notificar os clientes via WhatsApp automaticamente ao alterar status de ordens.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.whatsappAlerts}
                        onChange={() => handleToggleNotification('whatsappAlerts', 'Disparo de WhatsApp')}
                    />
                    <div className="w-11 h-6 bg-slate-100 dark:bg-neutral-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
            </div>
        </div>
    );

    const renderAbout = () => (
        <div className="flex flex-col gap-4">
            <div className="bg-white/80 dark:bg-surface-dark/60 backdrop-blur-md rounded-[28px] p-6 border border-slate-200/60 dark:border-primary/10 shadow-lg shadow-black/5 flex flex-col items-center text-center relative overflow-hidden">
                {/* Efeitos de gradiente ciano decorativo */}
                <div className="absolute top-[-50px] right-[-50px] w-28 h-28 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-[-30px] left-[-30px] w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="size-20 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mb-4 shadow-lg shadow-primary/10 border border-primary/20 animate-pulse relative z-10">
                    <FileText size={36} className="drop-shadow-[0_0_8px_rgba(4,157,174,0.4)]" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{APP_NAME}</h2>
                <p className="text-xs font-black text-primary mt-1.5 uppercase tracking-widest bg-primary/5 px-4.5 py-1.5 rounded-full border border-primary/10 relative z-10 shadow-sm shadow-primary/5">
                    Versão {APP_VERSION}
                </p>
            </div>

            {/* Grid de Cards Tecnicos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-surface-dark rounded-[20px] p-4 border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col justify-between gap-1">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Desenvolvedor</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-neutral-200">pedrokstro</span>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-[20px] p-4 border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col justify-between gap-1">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Licença do App</span>
                    <span className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Comercial / Ativa
                    </span>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-[20px] p-4 border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col justify-between gap-1">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Suporte Técnico</span>
                    <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline transition-all">
                        WhatsApp Suporte
                    </a>
                </div>
            </div>
            <button
                onClick={() => setShowChangelog(true)}
                className="w-full h-12 flex items-center justify-center gap-2 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs font-black uppercase tracking-wider shadow-sm border border-slate-200/30 dark:border-neutral-800"
            >
                <History size={16} /> Notas da Versão
            </button>
        </div>
    );

    // ─── RENDER: Content switch ───
    const renderContent = () => {
        if (dataLoading) return renderProfileSkeleton();

        switch (subView) {
            case 'profile': return renderProfile();
            case 'account': return renderAccount();
            case 'appearance': return renderAppearance();
            case 'notifications': return renderNotifications();
            case 'about': return renderAbout();
            default: return renderProfile();
        }
    };

    // ─── Save handler for footer ───
    const handleSave = () => {
        if (subView === 'account') {
            handleUpdatePassword();
        } else {
            handleSaveProfile();
        }
    };

    const showFooter = !dataLoading && (subView === 'profile' || subView === 'account');

    // ─── MOBILE: Menu Row ───
    const MenuRow = ({ icon, color, title, sub, onClick, danger = false }: any) => (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors active:scale-[0.99]"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${color}`}>
                    {icon}
                </div>
                <div className="flex flex-col items-start">
                    <span className={`font-bold text-sm ${danger ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{sub}</span>
                </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-neutral-700" />
        </button>
    );

    return (
        <div className="max-w-2xl md:max-w-[1400px] mx-auto min-h-screen pb-24 md:pb-12 animate-fade-in px-4">

            {/* ═══════ DESKTOP VIEW ═══════ */}
            <div className="hidden md:block py-8">
                <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="sticky top-24">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                                    Configurações
                                </h2>
                                <div className="space-y-1">
                                    {sidebarItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSubView(item.id)}
                                            className={`flex items-center gap-3 w-full rounded-lg px-4 py-2.5 transition-all ${subView === item.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <span className={subView === item.id ? 'text-primary' : ''}>{item.icon}</span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    ))}
                                    <div className="my-2 border-t border-gray-200 dark:border-gray-800 mx-4" />
                                    <button
                                        onClick={() => setSubView('about')}
                                        className={`flex items-center gap-3 w-full rounded-lg px-4 py-2.5 transition-all ${subView === 'about'
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <FileText size={20} />
                                        <span className="text-sm font-medium">Atualizações</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Card */}
                    <main className="flex-1">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
                                            {currentTitle.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {currentTitle.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 border-b border-gray-100 dark:border-gray-800" />
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={subView + '-' + dataLoading}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Footer Actions */}
                            {showFooter && (
                                <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-gray-800 rounded-b-xl flex justify-end gap-3">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md transition-colors"
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* ═══════ MOBILE VIEW ═══════ */}
            <div className="md:hidden">
                <AnimatePresence mode="wait">
                    {!subView || subView === 'menu' ? (
                        <motion.div
                            key="mobile-main"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col items-center pt-8 pb-4">
                                <div className="relative mb-4 group">
                                    <div className="size-28 rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-800 ring-4 ring-white dark:ring-neutral-900 shadow-xl border-4 border-primary/20">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatarUrl})` }} />
                                    </div>
                                    <button
                                        onClick={() => setSubView('profile')}
                                        className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg border-2 border-white dark:border-neutral-900"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {dataLoading ? <Skeleton className="h-8 w-32 mx-auto rounded" /> : user.name}
                                </h2>
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                    {dataLoading ? <Skeleton className="h-4 w-48 rounded" /> : user.email} • <span className="opacity-70 uppercase text-[10px] tracking-widest">{user.role}</span>
                                </p>
                            </div>

                            <div className="bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden divide-y divide-slate-100 dark:divide-neutral-800/50 mx-4 sm:mx-0">
                                <MenuRow icon={<User size={20} />} color="bg-blue-500" title="Informações Pessoais" sub="Nome, Email, Foto e Perfil" onClick={() => setSubView('profile')} />
                                <MenuRow icon={<Shield size={20} />} color="bg-indigo-500" title="Segurança e Acesso" sub="Alterar senha e proteção" onClick={() => setSubView('account')} />
                                <MenuRow icon={<Palette size={20} />} color="bg-amber-500" title="Aparência" sub="Interface, Tema e Cores" onClick={() => setSubView('appearance')} />
                                <MenuRow icon={<Bell size={20} />} color="bg-purple-500" title="Notificações" sub="Sons, Alertas e WhatsApp" onClick={() => setSubView('notifications')} />
                                <MenuRow icon={<Info size={20} />} color="bg-slate-500" title="Sobre o Sistema" sub={`Versão ${APP_VERSION}`} onClick={() => setSubView('about')} />
                                <MenuRow icon={<LogOut size={20} />} color="bg-red-500" title="Encerrar Sessão" sub="Sair de todos os dispositivos" onClick={() => { logout(); navigate('/'); }} danger />
                            </div>

                            <div className="flex justify-center pt-4">
                                <p className="text-[10px] font-black text-slate-300 dark:text-neutral-700 uppercase tracking-[0.2em]">{APP_NAME} © 2026</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mobile-sub"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            className="bg-slate-50 dark:bg-[#091113] flex-1 min-h-0 w-full flex flex-col"
                        >
                            {/* Mobile SubView Header */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-primary/10 sticky top-0 bg-white/80 dark:bg-[#091113]/80 backdrop-blur-md z-20 shrink-0">
                                <button onClick={() => setSubView('menu')} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors shrink-0">
                                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider text-center flex-1 truncate px-4">
                                    {currentTitle.title}
                                </h3>
                                <div className="w-9 h-9 shrink-0" /> {/* Spacer para manter o titulo perfeitamente centralizado */}
                            </div>
                            
                            <div className="p-4 space-y-4 flex-grow overflow-y-auto pb-32">
                                {renderContent()}
                            </div>
                            
                            {showFooter && (
                                <div className="sticky bottom-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#091113] dark:via-[#091113]/95 dark:to-transparent border-t border-slate-100 dark:border-neutral-800/60 z-20 backdrop-blur-sm">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full h-12 bg-primary text-white rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-110"
                                    >
                                        {isSaving ? 'SALVANDO...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
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