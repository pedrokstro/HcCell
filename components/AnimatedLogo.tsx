import React from 'react';

interface AnimatedLogoProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    forceLight?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ size = 'md', className = '', forceLight = false }) => {
    // Tamanhos responsivos
    const sizeClasses = {
        xs: 'w-24',
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64'
    };

    const darkClasses = forceLight ? '' : 'dark:brightness-0 dark:invert';

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Base: Celular + Texto HC CELL */}
            <img
                src="/base-celular.png"
                alt="HC CELL"
                className={`w-full h-auto relative z-10 ${darkClasses}`}
            />

            {/* Engrenagem Pequena - Agora em Cima */}
            <img
                src="/engrenagem-pequena.png"
                alt=""
                className={`absolute z-20 animate-spin-slow ${darkClasses}`}
                style={{
                    top: '32%',
                    left: '18%',
                    width: '18%',
                    transformOrigin: 'center center'
                }}
            />
 
            {/* Engrenagem Grande (com Chave) - Agora em Baixo */}
            <img
                src="/engrenagem-grande.png"
                alt=""
                className={`absolute z-20 animate-spin-slow-reverse ${darkClasses}`}
                style={{
                    top: '50%',
                    left: '2%',
                    width: '24%',
                    transformOrigin: 'center center'
                }}
            />
        </div>
    );
};
