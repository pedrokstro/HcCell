import React from 'react';
import { AnimatedLogo } from '../components/AnimatedLogo';

export const LogoStudio: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 z-[9999]">
            {/* Efeito Neon na Logo (Brilho Intenso sobre Fundo Preto) */}
            <div className="flex flex-col items-center gap-12">
                <div className="relative animate-pulse" style={{ filter: 'drop-shadow(0 0 10px #00CCFF) drop-shadow(0 0 20px #00CCFF)' }}>
                    {/* Camada Base: Tudo Branco Neon */}
                    <div className="brightness-0 invert">
                        <AnimatedLogo size="lg" forceLight />
                    </div>

                    {/* Camada Superior: Apenas o 'HC' em Azul Original com Brilho */}
                    {/* Aumentamos o recuo da esquerda para 43.5% para não encostar na borda branca do celular */}
                    <div className="absolute inset-0 pointer-events-none select-none" 
                         style={{ clipPath: 'inset(0% 0% 33% 43.5%)' }}>
                        <AnimatedLogo size="lg" forceLight />
                    </div>
                </div>

                <p 
                    className="text-[12px] font-black text-white uppercase tracking-[0.4em] px-6 py-2 border-2 border-[#00CCFF] rounded-lg animate-pulse"
                    style={{ 
                        boxShadow: '0 0 15px #00CCFF, inset 0 0 5px #00CCFF',
                        textShadow: '0 0 10px #00CCFF'
                    }}
                >
                    Assistência Técnica
                </p>
            </div>
        </div>
    );
};
