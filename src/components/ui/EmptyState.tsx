import React from 'react';
import { PackageOpen, Search, ShoppingBag, Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: 'search' | 'cart' | 'package' | 'inbox' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const ICON_MAP = {
  search: Search,
  cart: ShoppingBag,
  package: PackageOpen,
  inbox: Inbox,
};

export default function EmptyState({
  icon = 'package',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? ICON_MAP[icon as keyof typeof ICON_MAP] : null;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-4">
        {IconComponent ? (
          <IconComponent size={32} className="text-stone-400" />
        ) : (
          <>{icon}</>
        )}
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
