import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginTransitionProps {
    isVisible: boolean;
    onComplete: () => void;
}

export const LoginTransition: React.FC<LoginTransitionProps> = ({ isVisible, onComplete }) => {
    const [fillProgress, setFillProgress] = useState(0);
    const [slideUp, setSlideUp] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isVisible) {
            setFillProgress(0);
            setSlideUp(false);
            return;
        }

        (window as any).isLoginTransitionActive = true;

        const startTime = Date.now();
        const duration = 1800;

        const animateFill = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            setFillProgress(eased * 100);

            if (progress < 1) {
                requestAnimationFrame(animateFill);
            } else {
                // Ao atingir 100%, aguarda 250ms para mostrar "Pronto!" e a logo 100% preenchida
                setTimeout(() => {
                    // Sinaliza para a Sidebar montar o logo no DOM (espaço já pré-alocado na sidebar)
                    (window as any).isLoginTransitionActive = false;
                    window.dispatchEvent(new CustomEvent('login-transition-finished'));

                    // Inicia o voo suave da logo e o fade-out do fundo simultaneamente
                    setSlideUp(true);

                    // Desmonta o preloader após a conclusão perfeita da animação (850ms)
                    setTimeout(() => {
                        onComplete();
                    }, 850);
                }, 250);
            }
        };

        requestAnimationFrame(animateFill);
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="login-transition"
                    className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black ${
                        slideUp ? 'pointer-events-none' : ''
                    }`}
                    initial={{ opacity: 1 }}
                    animate={slideUp ? { opacity: 0 } : { opacity: 1 }}
                    transition={{
                        duration: 0.75,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                >
                    {/* Partículas de fundo */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div
                            className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse"
                            style={{
                                background: 'radial-gradient(circle, rgba(4,157,174,0.4) 0%, transparent 70%)',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }}
                        />
                    </div>

                    {/* Container da Logo */}
                    <div className="relative flex flex-col items-center gap-8">
                        <motion.div
                            layoutId={isDesktop ? "app-logo" : undefined}
                            transition={{
                                duration: 0.75,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="relative"
                            style={{ width: 220, height: 'auto' }}
                        >
                            {/* Camada Base: silhueta apagada */}
                            <img
                                src="/base-celular.png"
                                alt="HC CELL"
                                className="w-full h-auto"
                                style={{ filter: 'brightness(0) invert(1) opacity(0.08)' }}
                            />
                            <img
                                src="/engrenagem-pequena.png"
                                alt=""
                                className="absolute animate-spin-slow"
                                style={{
                                    top: '32%',
                                    left: '18%',
                                    width: '18%',
                                    transformOrigin: 'center center',
                                    filter: 'brightness(0) invert(1) opacity(0.08)',
                                }}
                            />
                            <img
                                src="/engrenagem-grande.png"
                                alt=""
                                className="absolute animate-spin-slow-reverse"
                                style={{
                                    top: '50%',
                                    left: '2%',
                                    width: '24%',
                                    transformOrigin: 'center center',
                                    filter: 'brightness(0) invert(1) opacity(0.08)',
                                }}
                            />

                            {/* Camada de preenchimento: clipa de baixo para cima */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    clipPath: `inset(${100 - fillProgress}% 0% 0% 0%)`,
                                    transition: 'clip-path 0.05s linear',
                                }}
                            >
                                <img
                                    src="/base-celular.png"
                                    alt=""
                                    className="w-full h-auto"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                />
                                <img
                                    src="/engrenagem-pequena.png"
                                    alt=""
                                    className="absolute animate-spin-slow"
                                    style={{
                                        top: '32%',
                                        left: '18%',
                                        width: '18%',
                                        transformOrigin: 'center center',
                                        filter: 'brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(500%) hue-rotate(155deg) brightness(110%)',
                                    }}
                                />
                                <img
                                    src="/engrenagem-grande.png"
                                    alt=""
                                    className="absolute animate-spin-slow-reverse"
                                    style={{
                                        top: '50%',
                                        left: '2%',
                                        width: '24%',
                                        transformOrigin: 'center center',
                                        filter: 'brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(500%) hue-rotate(155deg) brightness(110%)',
                                    }}
                                />
                            </div>

                            {/* Brilho neon na linha de preenchimento */}
                            <div
                                className="absolute left-0 right-0 h-1 pointer-events-none"
                                style={{
                                    bottom: `${fillProgress}%`,
                                    background: 'linear-gradient(90deg, transparent, rgba(4,157,174,0.8), rgba(0,220,255,1), rgba(4,157,174,0.8), transparent)',
                                    boxShadow: '0 0 12px rgba(0,220,255,0.9), 0 0 24px rgba(4,157,174,0.5)',
                                    opacity: fillProgress > 0 && fillProgress < 100 ? 1 : 0,
                                    transition: 'opacity 0.2s',
                                }}
                            />
                        </motion.div>

                        {/* Barra de progresso e label */}
                        <motion.div 
                            animate={{ opacity: slideUp ? 0 : 1, y: slideUp ? 10 : 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="flex flex-col items-center gap-3 w-48"
                        >
                            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${fillProgress}%`,
                                        background: 'linear-gradient(90deg, rgba(4,157,174,0.7), rgba(0,220,255,1))',
                                        boxShadow: '0 0 8px rgba(0,220,255,0.6)',
                                    }}
                                />
                            </div>

                            <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em]">
                                {fillProgress < 100 ? 'Carregando...' : 'Pronto!'}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
