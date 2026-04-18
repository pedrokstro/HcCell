
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnimatedLogo } from '../components/AnimatedLogo';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        setSuccess('📧 Instruções enviadas! Verifique seu email para redefinir a senha.');
        setMode('signin');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name || formData.email.split('@')[0],
              avatar_url: `https://ui-avatars.com/api/?name=${formData.name || formData.email.split('@')[0]}&background=0D8ABC&color=fff`
            }
          }
        });
        if (signUpError) throw signUpError;
        setSuccess('✅ Conta criada com sucesso! Verifique seu email para confirmar o cadastro e depois faça login.');
        setMode('signin');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* Full-Screen Background Image */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/novofundo.png')" }}
      ></div>
      {/* Subtle Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-slate-900/50"></div>

      {/* Bottom-left Quote (Desktop only) */}
      <div className="absolute bottom-0 left-0 right-0 lg:right-auto p-10 lg:p-16 text-white z-20 hidden lg:block">
        <blockquote className="space-y-4 max-w-lg">
          <div className="h-1.5 w-16 bg-primary rounded-full mb-6 shadow-lg shadow-primary/30"></div>
          <p className="text-xl font-light leading-snug italic text-white/90 drop-shadow-lg">
            "Eficiência em cada reparo. Gerencie seu fluxo de trabalho, estoque e clientes de forma integrada."
          </p>
        </blockquote>
      </div>

      {/* Glassmorphism Form Card */}
      <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-end p-4 sm:p-8 lg:pr-16 xl:pr-24">
        <div className="w-full max-w-md animate-fade-in-up">
          <div
            className="rounded-3xl border border-white/20 p-8 sm:p-10 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <AnimatedLogo size="md" />
                <p className="text-xs font-bold text-white/60 tracking-[0.25em] uppercase">Assistência Técnica</p>
              </div>
            </div>

            <div key={mode} className="animate-fade-in-up mt-6">
              <div className="flex flex-col gap-2 text-center mb-8">
                <h1 className="text-3xl font-black leading-tight tracking-tight text-white">
                  {mode === 'signin' ? 'Bem-vindo de volta' : mode === 'signup' ? 'Comece agora grátis' : 'Recuperar Acesso'}
                </h1>
                <p className="text-sm text-white/60">
                  {mode === 'forgot'
                    ? 'Digite seu email para receber as instruções.'
                    : mode === 'signin'
                      ? 'Acesse sua conta para gerenciar sua assistência.'
                      : 'Crie sua conta em segundos e organize sua loja.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="animate-fade-in-down" style={{ animationDuration: '300ms' }}>
                    <label className="block text-sm font-bold text-white/80 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={mode === 'signup'}
                      className="flex w-full rounded-xl text-white border border-white/20 bg-white/10 h-12 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-white/40 backdrop-blur-sm"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="flex w-full rounded-xl text-white border border-white/20 bg-white/10 h-12 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-white/40 backdrop-blur-sm"
                    placeholder="seu@email.com"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-white/80">Senha</label>
                      {mode === 'signin' && (
                        <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-primary hover:text-primary-light transition-colors">
                          Esqueceu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={mode !== 'forgot'}
                        className="flex w-full rounded-xl text-white border border-white/20 bg-white/10 h-12 pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-white/40 backdrop-blur-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="p-4 text-sm text-green-200 bg-green-500/20 rounded-xl border border-green-400/30 flex items-start gap-3 animate-fade-in text-left backdrop-blur-sm">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-bold mb-1">Sucesso!</p>
                      <p>{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 text-sm text-red-200 bg-red-500/20 rounded-xl border border-red-400/30 flex items-center animate-fade-in text-left backdrop-blur-sm">
                    <span className="font-medium mr-1">Erro:</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white h-12 text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'signin' ? 'Acessar Painel' : mode === 'signup' ? 'Criar Conta Grátis' : 'Enviar Link de Recuperação')}
                </button>

                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="w-full text-center text-sm font-bold text-white/50 hover:text-white/80 transition-colors mt-4"
                  >
                    Voltar para o Login
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};