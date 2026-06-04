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

        // Marca a transição de login como ativa globalmente
        (window as any).isLoginTransitionActive = true;

        // Anima o preenchimento de 0% a 100% em ~1.8s
        const startTime = Date.now();
        const duration = 1800;

        const animateFill = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing suave: ease-in-out
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            setFillProgress(eased * 100);

            if (progress < 1) {
                requestAnimationFrame(animateFill);
            } else {
                // Quando chega a 100%, espera 300ms e inicia revelação (fade-out do overlay)
                setTimeout(() => {
                    // Desmarca o status de transição ativa e sinaliza para a Sidebar
                    (window as any).isLoginTransitionActive = false;
                    window.dispatchEvent(new CustomEvent('login-transition-finished'));

                    setSlideUp(true);
                    // Após a animação de fade (800ms), chama o callback para desmontar tudo
                    setTimeout(() => {
                        onComplete();
                    }, 900);
                }, 300);
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
                    transition={
                        slideUp
                            ? { duration: 0.8, ease: 'easeInOut' }
                            : { duration: 0 }
                    }
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

                    {/* Container da Logo com efeito de preenchimento */}
                    <div className="relative flex flex-col items-center gap-8">
                        {/* Logo com máscara de fill ciano */}
                        <AnimatePresence>
                            {!slideUp && (
                                <motion.div
                                    key="preloading-logo"
                                    layoutId={isDesktop ? "app-logo" : undefined}
                                    className="relative"
                                    style={{ width: 220, height: 'auto' }}
                                    exit={{ 
                                        opacity: isDesktop ? 1 : 0, 
                                        scale: isDesktop ? 1 : 0.9,
                                        filter: isDesktop ? 'none' : 'blur(4px)'
                                    }}
                                    transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                                >
                                    {/* Camada Base: logo em cinza escuro (fundo apagado) */}
                                    <img
                                        src="/base-celular.png"
                                        alt="HC CELL"
                                        className="w-full h-auto"
                                        style={{ filter: 'brightness(0) invert(1) opacity(0.08)' }}
                                    />

                                    {/* Engrenagem Pequena — versão escura */}
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
                                    {/* Engrenagem Grande — versão escura */}
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

                                    {/* Camada de preenchimento: clipa a logo colorida de baixo para cima */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            clipPath: `inset(${100 - fillProgress}% 0% 0% 0%)`,
                                            transition: 'clip-path 0.05s linear',
                                        }}
                                    >
                                        {/* Logo colorida (ciano/branco) */}
                                        <img
                                            src="/base-celular.png"
                                            alt=""
                                            className="w-full h-auto"
                                            style={{
                                                filter: 'brightness(0) invert(1)',
                                                WebkitFilter: 'brightness(0) invert(1)',
                                            }}
                                        />
                                        {/* Engrenagem Pequena — versão iluminada */}
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
                                        {/* Engrenagem Grande — versão iluminada */}
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
                            )}
                        </AnimatePresence>

                        {/* Barra de progresso e label */}
                        <AnimatePresence>
                            {!slideUp && (
                                <motion.div 
                                    initial={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="flex flex-col items-center gap-3 w-48"
                                >
                                    {/* Track da barra */}
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
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
