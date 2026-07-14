import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

function SkeletonBlock({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-stone-200 rounded-lg ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-stone-200 p-4 space-y-3 ${className}`}>
            <SkeletonBlock className="w-full h-32 rounded-xl" />
            <SkeletonBlock className="w-3/4 h-4" />
            <SkeletonBlock className="w-1/2 h-3" />
            <div className="flex justify-between items-center pt-2">
              <SkeletonBlock className="w-20 h-6" />
              <SkeletonBlock className="w-8 h-8 rounded-xl" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'circle') {
    return (
      <SkeletonBlock
        className={`rounded-full ${className}`}
        style={{ width: width || 48, height: height || 48 }}
      />
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <SkeletonBlock
          key={i}
          className={variant === 'rect' ? `rounded-xl ${className}` : `h-4 rounded ${className}`}
          style={{
            width: width || '100%',
            height: variant === 'rect' ? height || 120 : height || undefined,
          }}
        />
      ))}
    </>
  );
}

/* ─── Product Card Skeleton (reusable) ─── */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 flex gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-full" />
        <div className="h-5 bg-stone-200 rounded w-1/3 mt-3" />
      </div>
      <div className="w-28 h-28 sm:w-32 sm:h-32 bg-stone-200 rounded-xl shrink-0" />
    </div>
  );
}

/* ─── Table Row Skeleton ─── */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-stone-200 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}
