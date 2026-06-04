
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(formData.email, formData.password);
        // Disparar a transição global de login
        window.dispatchEvent(new CustomEvent('trigger-login-transition'));
        // Navegar para o dashboard imediatamente para que ele monte em segundo plano
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        setSuccess('Instruções enviadas! Verifique seu e-mail para redefinir a senha.');
        setMode('signin');
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro inesperado.');
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'forgot') => {
    setError(null);
    setSuccess(null);
    setMode(newMode);
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">

      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/novofundo.png')" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-primary/10" />

      {/* Partículas decorativas de brilho */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Quote Desktop */}
      <div className="absolute bottom-0 left-0 right-0 lg:right-auto p-10 lg:p-16 text-white z-20 hidden lg:block">
        <blockquote className="space-y-4 max-w-lg">
          <div className="h-1.5 w-16 bg-primary rounded-full mb-6 shadow-lg shadow-primary/40" />
          <p className="text-xl font-light leading-snug italic text-white/85 drop-shadow-lg">
            "Eficiência em cada reparo. Gerencie seu fluxo de trabalho, estoque e clientes de forma integrada."
          </p>
        </blockquote>
      </div>

      {/* Form Container */}
      <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-end p-4 sm:p-8 lg:pr-16 xl:pr-24">
        <div className="w-full max-w-md">
          {/* Card Glassmorphism com Neon Glow */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-3xl border border-white/20 p-6 sm:p-10 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.11)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(4,157,174,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Logo e Subtítulo */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <AnimatedLogo size="md" />
              <p className="text-xs font-bold text-white/55 tracking-[0.28em] uppercase mt-1">
                Assistência Técnica
              </p>
            </div>

            {/* Título e Subtítulo com transição */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode + '-header'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="text-center mb-7"
              >
                <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                  {mode === 'signin' ? 'Bem-vindo de volta' : 'Recuperar Acesso'}
                </h1>
                <p className="text-sm text-white/55 mt-2">
                  {mode === 'forgot'
                    ? 'Digite seu e-mail para receber as instruções de redefinição.'
                    : 'Acesse sua conta para gerenciar sua assistência técnica.'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Formulário com transição */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode + '-form'}
                initial={{ opacity: 0, x: mode === 'forgot' ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'forgot' ? -16 : 16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Campo E-mail */}
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">E-mail</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40 pointer-events-none">
                      <Mail size={17} />
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      autoComplete="email"
                      className="flex w-full rounded-xl text-white border border-white/20 bg-white/10 h-12 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/70 transition-all placeholder:text-white/30 backdrop-blur-sm hover:bg-white/15 hover:border-white/35 focus:shadow-[0_0_18px_rgba(4,157,174,0.2)] duration-200"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Campo Senha (apenas no modo signin) */}
                {mode === 'signin' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-white/80">Senha</label>
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs font-bold text-primary hover:text-cyan-300 transition-colors underline-offset-2 hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40 pointer-events-none">
                        <Lock size={17} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        autoComplete="current-password"
                        className="flex w-full rounded-xl text-white border border-white/20 bg-white/10 h-12 pl-10 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/70 transition-all placeholder:text-white/30 backdrop-blur-sm hover:bg-white/15 hover:border-white/35 focus:shadow-[0_0_18px_rgba(4,157,174,0.2)] duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-white/35 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Alerta de Sucesso Premium */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-400/30 text-sm text-emerald-200 backdrop-blur-sm"
                      style={{ background: 'rgba(52, 211, 153, 0.12)' }}
                    >
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-300 mb-0.5">Sucesso!</p>
                        <p className="text-white/70 text-xs leading-relaxed">{success}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Alerta de Erro Premium */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-3 p-4 rounded-2xl border border-red-400/30 text-sm backdrop-blur-sm"
                      style={{ background: 'rgba(239, 68, 68, 0.12)' }}
                    >
                      <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-300 mb-0.5">Erro de acesso</p>
                        <p className="text-white/70 text-xs leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botão Principal */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white h-12 text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.97] hover:scale-[1.01] hover:brightness-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : mode === 'signin' ? (
                    'Acessar Painel'
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </button>

                {/* Botão Voltar (apenas na recuperação) */}
                {mode === 'forgot' && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="flex w-full items-center justify-center gap-2 text-sm font-bold text-white/45 hover:text-white/75 transition-colors mt-1 group"
                  >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Voltar para o Login
                  </motion.button>
                )}
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};