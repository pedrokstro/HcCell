import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
    to?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    label?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    to,
    onClick,
    icon,
    label
}) => {
    const buttonContent = (
        <>
            {icon || <Plus size={24} strokeWidth={2.5} />}
            {label && <span className="hidden">{label}</span>}
        </>
    );

    const className = `
        fixed bottom-24 right-4 z-40 md:hidden
        flex items-center justify-center
        w-14 h-14 
        bg-primary text-white 
        rounded-full 
        shadow-xl shadow-primary/40
        active:scale-90 
        transition-all duration-200
        hover:bg-primary-dark
    `;

    if (to) {
        return (
            <Link to={to} className={className} title={label}>
                {buttonContent}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className} title={label}>
            {buttonContent}
        </button>
    );
};
