import React from 'react';
import { Smartphone, Settings } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', showText = true, light = false }) => {
  // Size mapping for the image
  const imgSizeClass = size === 'sm' ? 'h-8' : size === 'md' ? 'h-10' : 'h-16';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="HC Cell Logo"
        className={`${imgSizeClass} w-auto object-contain ${light ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'}`}
      />
    </div>
  );
};