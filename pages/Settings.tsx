import React, { useState, useRef } from 'react';
import { useApp } from '../store';
import { 
    User, Mail, Phone, BadgeCheck, Save, Upload, X, Lock, 
    Bell, Trash2, Eye, EyeOff, Shield, Info, FileText, 
    Palette, LogOut, Sun, Moon, ChevronRight, Camera,
    ArrowLeft, History
} from 'lucide-react';
import { APP_VERSION, APP_NAME } from '../constants';
import { ChangeLogModal } from '../components/ChangeLogModal';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings: React.FC = () => {
    const { user, darkMode, toggleTheme, logout } = useApp();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [subView, setSubView] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState(user.avatarUrl);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);

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
        setLoading(true);
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
            setSubView(null);
        } catch (error: any) {
            showToast(error.message || 'Erro ao salvar.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('As senhas não coincidem ou estão vazias.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (error) throw error;
            showToast('Senha atualizada!', 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setSubView(null);
        } catch (error: any) {
            showToast(error.message || 'Erro ao atualizar senha.', 'error');
        } finally {
            setLoading(false);
        }
    };

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

    const SubViewHeader = ({ title, onBack }: any) => (
        <div className="p-4 flex items-center border-b border-slate-100 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md z-10 w-full relative">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors relative z-20">
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            
            {/* Mobile Centered Title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden">
                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
            </div>

            {/* Desktop Title (Exactly like original) */}
            <h3 className="hidden md:block font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter ml-4">{title}</h3>
        </div>
    );
    const renderProfile = () => (
        <div className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative group">
                    <div className="size-24 rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-800 ring-2 ring-primary">
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${profileImage})` }}></div>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
                    >
                        <Upload size={20} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[11px] md:text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase ml-1 tracking-wider">Seu Nome Completo</label>
                    <input
                        type="text"
                        className="w-full h-16 md:h-14 px-5 md:px-4 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm shadow-inner md:shadow-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] md:text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase ml-1 tracking-wider">Endereço de E-mail</label>
                    <input
                        type="email"
                        className="w-full h-16 md:h-14 px-5 md:px-4 bg-slate-50/50 dark:bg-neutral-900/10 rounded-2xl border-none text-slate-400 font-bold text-sm disabled:opacity-50"
                        value={formData.email}
                        disabled
                    />
                </div>
            </div>

            <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full h-16 md:h-14 bg-primary text-white rounded-2xl font-black text-sm shadow-xl md:shadow-none shadow-primary/20 active:scale-[0.98] transition-all"
            >
                {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </button>
        </div>
    );

    const renderSecurity = () => (
        <div className="p-6 space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                    <Shield size={16} /> Senha da Conta
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400/80 mt-1 leading-relaxed">
                    Recomendamos trocar sua senha periodicamente para manter seu acesso seguro.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[11px] md:text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase ml-1 tracking-wider">Nova Senha de Acesso</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full h-16 md:h-14 pr-14 px-5 md:px-4 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm shadow-inner md:shadow-none"
                            placeholder="••••••••"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-5 md:top-4 text-slate-400"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] md:text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase ml-1 tracking-wider">Confirmar Nova Senha</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        className="w-full h-16 md:h-14 px-5 md:px-4 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 dark:text-white font-bold text-sm shadow-inner md:shadow-none"
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                </div>
            </div>

            <button
                onClick={handleUpdatePassword}
                disabled={loading || !passwordData.newPassword}
                className="w-full h-16 md:h-14 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl md:shadow-none shadow-indigo-600/20 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
                {loading ? 'ATUALIZANDO...' : 'ATUALIZAR SENHA AGORA'}
            </button>
        </div>
    );

    const renderAppearance = () => (
        <div className="p-6 space-y-6">
            <div className="p-1.5 bg-slate-100 dark:bg-neutral-900 rounded-[28px] flex gap-1">
                <button
                    onClick={() => darkMode && toggleTheme()}
                    className={`flex-1 py-4 rounded-[22px] font-bold text-sm flex items-center justify-center gap-2 transition-all ${!darkMode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-white'}`}
                >
                    <Sun size={18} /> Modo Claro
                </button>
                <button
                    onClick={() => !darkMode && toggleTheme()}
                    className={`flex-1 py-4 rounded-[22px] font-bold text-sm flex items-center justify-center gap-2 transition-all ${darkMode ? 'bg-neutral-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    <Moon size={18} /> Modo Escuro
                </button>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-900/50 p-5 rounded-3xl border border-slate-100 dark:border-neutral-800">
                <h4 className="text-sm font-black uppercase text-slate-400 mb-3 tracking-widest">Preview de Cores</h4>
                <div className="grid grid-cols-4 gap-3">
                    <div className="h-10 rounded-xl bg-primary"></div>
                    <div className="h-10 rounded-xl bg-blue-500"></div>
                    <div className="h-10 rounded-xl bg-emerald-500"></div>
                    <div className="h-10 rounded-xl bg-amber-500"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                    As cores do sistema se adaptam automaticamente ao seu tema escolhido para garantir melhor legibilidade.
                </p>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Alertas por Email</span>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Novas Ordens</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Relatórios Semanais</span>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Estatísticas</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
            </div>
        </div>
    );

    const renderAbout = () => (
        <div className="p-8 flex flex-col items-center text-center">
            <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm border-2 border-primary/20">
                <FileText size={48} className="text-primary" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 uppercase">{APP_NAME}</h2>
            <p className="text-sm font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-full mb-8">v{APP_VERSION}</p>

            <button
                onClick={() => setShowChangelog(true)}
                className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
                <History size={18} /> NOTAS DA VERSÃO
            </button>

            <div className="mt-12 p-4 border border-red-100 dark:border-red-900/30 rounded-2xl w-full">
                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Zona de Risco</h4>
                <button className="w-full py-3 text-red-600 dark:text-red-400 font-bold text-xs bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 transition-colors">
                    SOLICITAR EXCLUSÃO DE CONTA
                </button>
            </div>
        </div>
    );

    const renderSubViewContent = () => {
        switch (subView || 'profile') {
            case 'profile': return renderProfile();
            case 'security': return renderSecurity();
            case 'appearance': return renderAppearance();
            case 'notifications': return renderNotifications();
            case 'about': return renderAbout();
            default: return renderProfile();
        }
    };

    return (
        <div className="max-w-2xl md:max-w-screen-xl mx-auto min-h-screen pb-24 md:pb-12 animate-fade-in px-4">
            {/* DESKTOP REFINED VIEW */}
            <div className="hidden md:grid md:grid-cols-[300px,1fr] md:gap-8 pt-8 items-start">
                <aside className="space-y-6 sticky top-8">
                    {/* Desktop Profile Card */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-200 dark:border-neutral-800 shadow-sm text-center">
                        <div className="relative inline-block mb-4">
                            <div className="size-20 rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-800 ring-4 ring-white dark:ring-neutral-900 shadow-lg border-2 border-primary/20 mx-auto">
                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatarUrl})` }}></div>
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{user.name}</h2>
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-3">{user.role}</span>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate px-2">{user.email}</p>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden p-2">
                        {[
                            { id: 'profile', icon: <User size={18} />, title: "Perfil", color: "text-blue-500" },
                            { id: 'security', icon: <Shield size={18} />, title: "Segurança", color: "text-indigo-500" },
                            { id: 'appearance', icon: <Palette size={18} />, title: "Aparência", color: "text-amber-500" },
                            { id: 'notifications', icon: <Bell size={18} />, title: "Notificações", color: "text-purple-500" },
                            { id: 'about', icon: <Info size={18} />, title: "Sobre", color: "text-slate-500" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSubView(item.id)}
                                className={`flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all duration-200 group relative ${subView === item.id || (!subView && item.id === 'profile') ? 'bg-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}
                            >
                                {(subView === item.id || (!subView && item.id === 'profile')) && (
                                    <motion.div 
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-primary rounded-2xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className={`${subView === item.id || (!subView && item.id === 'profile') ? 'text-white' : item.color} transition-colors z-10`}>{item.icon}</div>
                                <span className="font-bold text-sm uppercase tracking-tight z-10">{item.title}</span>
                                <ChevronRight size={14} className={`ml-auto opacity-40 group-hover:translate-x-0.5 transition-transform z-10 ${subView === item.id || (!subView && item.id === 'profile') ? 'block' : 'hidden'}`} />
                            </button>
                        ))}

                        <div className="h-px bg-slate-100 dark:bg-neutral-800 my-2 mx-2"></div>

                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm uppercase tracking-tight"
                        >
                            <LogOut size={18} />
                            <span>Sair</span>
                        </button>
                    </nav>

                    <div className="text-center opacity-30 pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{APP_NAME} © 2026</p>
                    </div>
                </aside>

                <main className="bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-neutral-800 shadow-sm min-h-[660px] flex flex-col overflow-hidden relative">
                    <div className="p-8 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/30 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-1 block">Configurações</span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {subView === 'profile' || !subView ? 'Meu Perfil' :
                                 subView === 'security' ? 'Segurança da Conta' :
                                 subView === 'appearance' ? 'Aparência do Sistema' :
                                 subView === 'notifications' ? 'Ajustes de Notificação' :
                                 'Sobre o HcCell'}
                            </h3>
                        </div>
                        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                             {subView === 'profile' || !subView ? <User size={20} /> :
                              subView === 'security' ? <Shield size={20} /> :
                              subView === 'appearance' ? <Palette size={20} /> :
                              subView === 'notifications' ? <Bell size={20} /> :
                              <Info size={20} />}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={subView || 'profile'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {renderSubViewContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Decorative element for premium feel */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                </main>
            </div>

            {/* MOBILE VIEW (Identical to original) */}
            <div className="md:hidden">
                <AnimatePresence mode="wait">
                    {!subView ? (
                        <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col items-center pt-8 pb-4">
                                <div className="relative mb-4 group">
                                    <div className="size-28 rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-800 ring-4 ring-white dark:ring-neutral-900 shadow-xl border-4 border-primary/20 transition-transform group-hover:scale-105 duration-300">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatarUrl})` }}></div>
                                    </div>
                                    <button
                                        onClick={() => setSubView('profile')}
                                        className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg border-2 border-white dark:border-neutral-900 transition-transform active:scale-90"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                    {user.email} • <span className="opacity-70 uppercase text-[10px] tracking-widest">{user.role}</span>
                                </p>
                            </div>

                            <div className="bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden divide-y divide-slate-100 dark:divide-neutral-800/50 mx-4 sm:mx-0">
                                <MenuRow icon={<User size={20} />} color="bg-blue-500" title="Informações Pessoais" sub="Nome, Email, Foto e Perfil" onClick={() => setSubView('profile')} />
                                <MenuRow icon={<Shield size={20} />} color="bg-indigo-500" title="Segurança e Acesso" sub="Alterar senha e proteção de conta" onClick={() => setSubView('security')} />
                                <MenuRow icon={<Palette size={20} />} color="bg-amber-500" title="Aparência" sub="Interface, Tema e Cores" onClick={() => setSubView('appearance')} />
                                <MenuRow icon={<Bell size={20} />} color="bg-purple-500" title="Notificações" sub="Sons, Alertas e WhatsApp" onClick={() => setSubView('notifications')} />
                                <MenuRow icon={<Info size={20} />} color="bg-slate-500" title="Sobre o Sistema" sub={`Versão ${APP_VERSION} e Novidades`} onClick={() => setSubView('about')} />
                                <MenuRow icon={<LogOut size={20} />} color="bg-red-500" title="Encerrar Sessão" sub="Sair de todos os dispositivos" onClick={() => { logout(); navigate('/'); }} danger />
                            </div>

                            <div className="flex justify-center pt-4">
                                <p className="text-[10px] font-black text-slate-300 dark:text-neutral-700 uppercase tracking-[0.2em]">{APP_NAME} © 2026</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="subkey"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white dark:bg-surface-dark min-h-[calc(100vh-220px)] md:min-h-[60vh] rounded-[32px] shadow-xl md:shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden mx-4 sm:mx-0 flex flex-col"
                        >
                            <SubViewHeader
                                title={subView === 'profile' ? 'Perfil' : subView === 'security' ? 'Segurança' : subView === 'appearance' ? 'Aparência' : subView === 'notifications' ? 'Notificações' : 'Sobre'}
                                onBack={() => setSubView(null)}
                            />
                            {renderSubViewContent()}
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