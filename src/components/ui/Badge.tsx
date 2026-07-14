import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-700 border-stone-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  primary: 'bg-[#A12C25]/10 text-[#A12C25] border-[#A12C25]/25',
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  dot = false,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase tracking-wider rounded-md border
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            pulse ? 'animate-pulse' : ''
          } ${
            variant === 'success' ? 'bg-green-500' :
            variant === 'warning' ? 'bg-amber-500' :
            variant === 'danger' ? 'bg-red-500' :
            variant === 'info' ? 'bg-blue-500' :
            variant === 'primary' ? 'bg-[#A12C25]' :
            'bg-stone-500'
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
