import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
    size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    forceLight?: boolean;
    layoutId?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
    size = 'md',
    className = '',
    forceLight = false,
    layoutId
}) => {
    // Tamanhos responsivos
    const sizeClasses = {
        xxs: 'w-12',
        xs: 'w-24',
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64'
    };

    const darkClasses = forceLight ? '' : 'dark:brightness-0 dark:invert';

    return (
        <motion.div
            layoutId={layoutId}
            className={`relative ${sizeClasses[size] || 'w-48'} ${className}`}
        >
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
        </motion.div>
    );
};
