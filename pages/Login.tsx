import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
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
        // Trigger global login transition event
        window.dispatchEvent(new CustomEvent('trigger-login-transition'));
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
    <div className="relative flex min-h-screen w-full overflow-hidden select-none">
      {/* Background Image maintained as requested */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/novofundo.png')" }}
      />

      {/* Clean SaaS Backdrop Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-primary/20 backdrop-blur-[2px]" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Brand Statement */}
      <div className="absolute bottom-0 left-0 p-10 lg:p-16 text-white z-20 hidden lg:block max-w-xl">
        <blockquote className="space-y-4">
          <div className="h-1.5 w-16 bg-primary rounded-full mb-6 shadow-md shadow-primary/40" />
          <p className="text-2xl font-black leading-snug tracking-tight text-white drop-shadow-md">
            "Gestão inteligente para sua assistência técnica com máxima performance e controle."
          </p>
          <div className="flex items-center gap-2 pt-2">
            <ShieldCheck size={18} className="text-primary" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              HcCell  • Assistencia Tecnica
            </span>
          </div>
        </blockquote>
      </div>

      {/* Form Container */}
      <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-end p-0 sm:p-8 lg:pr-16 xl:pr-24 min-h-screen w-full">
        <div className="w-full sm:max-w-md min-h-screen sm:min-h-0 flex flex-col justify-center">
          {/* Clean White SaaS Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full min-h-screen sm:min-h-0 rounded-none sm:rounded-3xl border-0 sm:border border-white/40 dark:border-neutral-800 p-6 sm:p-10 shadow-none sm:shadow-2xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl flex flex-col justify-center"
          >
            {/* Animated Logo Header */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <AnimatedLogo size="md" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase mt-1">
                Assistência Técnica
              </span>
            </div>

            {/* Title Block */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode + '-header'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="text-center mb-6"
              >
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {mode === 'signin' ? 'Bem-vindo de volta' : 'Recuperar Acesso'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  {mode === 'forgot'
                    ? 'Digite seu e-mail para receber o link de redefinição.'
                    : 'Insira suas credenciais para gerenciar o sistema.'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode + '-form'}
                initial={{ opacity: 0, x: mode === 'forgot' ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'forgot' ? -12 : 12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Email Field */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    E-mail de Acesso
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      autoComplete="email"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                {mode === 'signin' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        autoComplete="current-password"
                        className="w-full h-11 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-mono"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300"
                    >
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-bold">Solicitação enviada</span>
                        <span className="text-[11px]">{success}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300"
                    >
                      <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-bold">Erro de Autenticação</span>
                        <span className="text-[11px]">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 flex justify-center items-center gap-2 rounded-2xl sm:rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest shadow-md shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : mode === 'signin' ? (
                    'Entrar no Sistema'
                  ) : (
                    'Enviar Link'
                  )}
                </button>

                {/* Back to Login Button */}
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pt-2"
                  >
                    <ArrowLeft size={14} />
                    <span>Voltar ao Login</span>
                  </button>
                )}
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};