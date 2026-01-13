import React, { useState, useRef } from 'react';
import { useApp } from '../store';
import { User, Mail, Phone, BadgeCheck, Save, Upload, X, Lock, Bell, Trash2, Eye, EyeOff, Shield, Info, FileText } from 'lucide-react';
import { APP_VERSION, APP_NAME } from '../constants';
import { ChangeLogModal } from '../components/ChangeLogModal';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';

export const Settings: React.FC = () => {
    const { user } = useApp();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = React.useState('profile');
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Por favor, selecione apenas arquivos de imagem.', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('A imagem deve ter no máximo 5MB.', 'error');
                return;
            }

            setImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setProfileImage(user.avatarUrl);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let avatarUrl = user.avatarUrl;

            // Upload image to Supabase Storage if a new image was selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                // Upload file to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;

                // Delete old avatar if it exists and is from our storage
                if (user.avatarUrl && user.avatarUrl.includes('supabase')) {
                    try {
                        const oldPath = user.avatarUrl.split('/').slice(-2).join('/');
                        await supabase.storage
                            .from('profiles')
                            .remove([oldPath]);
                    } catch (deleteError) {
                        console.warn('Could not delete old avatar:', deleteError);
                    }
                }
            }

            // Update user profile in the database (Auth Metadata)
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    name: formData.name,
                    avatar_url: avatarUrl
                }
            });

            if (updateError) {
                throw updateError;
            }

            // Sync with public.profiles table (Persistent Storage)
            // This ensures data persists across sessions if auth metadata is not loaded correctly
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                name: formData.name,
                email: formData.email,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            });

            if (profileError) {
                console.warn('Error syncing profile table:', profileError);
                // We don't throw here to avoid blocking UI if Auth update succeeded
            }

            showToast('Perfil atualizado com sucesso!', 'success');

            // Reset image file state after successful save
            setImageFile(null);

            // Update local state to reflect changes without reloading
            // The user object will be updated on next auth state change
            // For immediate visual feedback, update the profile image
            setProfileImage(avatarUrl);

        } catch (error: any) {
            console.error('Error saving profile:', error);
            showToast(error.message || 'Erro ao salvar perfil. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdatePassword = async () => {
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            showToast('Preencha os campos de senha.', 'error');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            showToast('Senha atualizada com sucesso!', 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error('Error updating password:', error);
            showToast(error.message || 'Erro ao atualizar senha.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[600px] animate-fade-in">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 shrink-0">
                <div className="lg:sticky lg:top-24 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-neutral-800 lg:border-none p-4 lg:p-0">
                    <div className="lg:px-3 lg:py-2">
                        <h2 className="mb-2 lg:px-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white hidden lg:block">Configurações</h2>
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 whitespace-nowrap w-full text-left transition-colors ${activeTab === 'profile'
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <User size={18} /> <span className="text-sm font-medium">Perfil</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 whitespace-nowrap w-full text-left transition-colors ${activeTab === 'account'
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <BadgeCheck size={18} /> <span className="text-sm font-medium">Conta</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 whitespace-nowrap w-full text-left transition-colors ${activeTab === 'about'
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <Info size={18} /> <span className="text-sm font-medium">Sobre</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Form */}
            <main className="flex-1">
                {activeTab === 'profile' && (
                    <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-surface-dark shadow-sm animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Informações do Perfil</h3>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <div className="relative group">
                                    <div className="size-24 rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800 ring-4 ring-slate-100 dark:ring-neutral-700">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${profileImage})` }}></div>
                                    </div>
                                    {imageFile && (
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            title="Remover foto"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Foto de Perfil</h4>
                                    <div className="flex gap-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={handleUploadClick}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md shadow-sm hover:bg-primary-dark transition-colors"
                                        >
                                            <Upload size={16} />
                                            Enviar Nova
                                        </button>
                                        {imageFile && (
                                            <button
                                                onClick={handleRemoveImage}
                                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">JPG, PNG ou WebP. Máximo 5MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white">Nome</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User size={16} /></span>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white">Email</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail size={16} /></span>
                                        <input
                                            type="email"
                                            className="w-full rounded-lg border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-white">Função</label>
                                    <input type="text" className="w-full rounded-lg border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800 text-sm text-slate-500 dark:text-slate-400" disabled defaultValue={user.role} />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-900 rounded-b-xl flex justify-end gap-3 border-t border-slate-100 dark:border-neutral-800">
                            <button
                                onClick={() => {
                                    setFormData({ name: user.name, email: user.email });
                                    setProfileImage(user.avatarUrl);
                                    setImageFile(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Security Section - Password */}
                        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Segurança</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-white">Nova Senha</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={16} /></span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full rounded-lg border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 pr-10 text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
                                                placeholder="••••••••"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-white">Confirmar Senha</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={16} /></span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full rounded-lg border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pl-10 text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
                                                placeholder="••••••••"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-slate-50 dark:border-neutral-800 pt-4">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={loading || !passwordData.newPassword}
                                        className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? 'Atualizando...' : 'Atualizar Senha'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <Bell size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notificações</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie como você recebe alertas.</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-500 dark:text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Notificações por Email</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Receba atualizações sobre ordens e estoque.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-500 dark:text-slate-400">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Mensagens WhatsApp</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Integração para envio de mensagens automáticas.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                                    <Trash2 size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Zona de Perigo</h3>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Excluir Conta</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Essa ação é irreversível e excluirá todos os dados.</p>
                                </div>
                                <button className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-white dark:bg-surface-dark border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-colors shadow-sm">
                                    Solicitar Exclusão
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-surface-dark shadow-sm overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Info size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sobre o Sistema</h3>
                        </div>
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="size-20 bg-slate-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                                <FileText size={40} className="text-slate-400" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{APP_NAME}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Versão instalada: <span className="text-primary font-bold">v{APP_VERSION}</span></p>

                            <button
                                onClick={() => setShowChangelog(true)}
                                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/20 flex items-center gap-2"
                            >
                                <FileText size={18} />
                                Ver Notas da Versão (Changelog)
                            </button>

                            <p className="mt-12 text-xs text-slate-400">
                                © 2026 Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                )}
            </main>



            <ChangeLogModal
                isOpen={showChangelog}
                onClose={() => setShowChangelog(false)}
                onConfirm={() => setShowChangelog(false)}
                showHistory={true}
            />
        </div>
    );
};