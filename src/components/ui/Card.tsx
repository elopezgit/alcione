import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const PADDING: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={`
        bg-white rounded-2xl border border-stone-200/90 shadow-sm
        ${hover ? 'hover:shadow-md hover:border-[#A12C25]/40 transition-all duration-200 cursor-pointer active:scale-[0.99]' : ''}
        ${onClick ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A12C25]/40' : ''}
        ${PADDING[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
