
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorRetryProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  className?: string;
}

export default function ErrorRetry({
  message,
  onRetry,
  fullScreen = false,
  className = '',
}: ErrorRetryProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${fullScreen ? 'min-h-screen p-4' : 'py-16 px-6'} ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-1">Ops! Algo salió mal</h3>
      <p className="text-sm text-stone-500 max-w-xs mb-6 break-words">{message}</p>
      {onRetry && (
        <Button variant="primary" size="md" icon={<RefreshCw size={16} />} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
