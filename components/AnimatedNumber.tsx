import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'integer' | 'decimal' | 'percent';
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = 'currency',
  duration = 0.8,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const valueObj = useRef<{ val: number }>({ val: value });

  const formatValue = (n: number): string => {
    if (isNaN(n)) return '0';
    switch (format) {
      case 'currency':
        return n.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case 'integer':
        return Math.round(n).toLocaleString('pt-BR');
      case 'decimal':
        return n.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        });
      case 'percent':
        return n.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }) + '%';
      default:
        return n.toString();
    }
  };

  useGSAP(() => {
    if (!spanRef.current) return;

    // Se preferir movimento reduzido, atualiza direto
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      valueObj.current.val = value;
      spanRef.current.textContent = `${prefix}${formatValue(value)}${suffix}`;
      return;
    }

    gsap.to(valueObj.current, {
      val: value,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current) {
          spanRef.current.textContent = `${prefix}${formatValue(valueObj.current.val)}${suffix}`;
        }
      },
    });
  }, { dependencies: [value, format, prefix, suffix], scope: spanRef });

  return (
    <span ref={spanRef} className={className}>
      {prefix}{formatValue(value)}{suffix}
    </span>
  );
};
