import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
    const variantClasses = {
        text: 'h-4 w-full rounded',
        rect: 'rounded-xl',
        circle: 'rounded-full'
    };

    return (
        <div 
            className={`
                bg-slate-200/60 dark:bg-neutral-800/60 
                animate-shimmer 
                bg-[length:200%_100%] 
                ${variantClasses[variant]} 
                ${className}
            `}
            style={{ 
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' 
            }}
        />
    );
};
