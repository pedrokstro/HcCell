import React from 'react';

interface AnimatedLogoProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ size = 'md', className = '' }) => {
    // Tamanhos responsivos
    const sizeClasses = {
        xs: 'w-24',
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64'
    };

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Base: Celular + Texto HC CELL */}
            <img
                src="/base-celular.png"
                alt="HC CELL"
                className="w-full h-auto relative z-10 dark:brightness-0 dark:invert"
            />

            {/* Engrenagem Grande - Gira no sentido horário */}
            <img
                src="/gear-big.png"
                alt=""
                className="absolute z-20 animate-spin-slow dark:brightness-0 dark:invert"
                style={{
                    top: '45%',
                    left: '2%',
                    width: '22%',
                    transformOrigin: 'center center'
                }}
            />

            {/* Engrenagem Pequena com Chave - Gira no sentido anti-horário */}
            <img
                src="/gear-small.png"
                alt=""
                className="absolute z-20 animate-spin-slow-reverse dark:brightness-0 dark:invert"
                style={{
                    top: '35%',
                    left: '18%',
                    width: '18%',
                    transformOrigin: 'center center'
                }}
            />
        </div>
    );
};
