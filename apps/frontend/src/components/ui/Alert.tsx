'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  variant: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  error: {
    container: 'bg-destructive/10 border-destructive/20 text-destructive',
    Icon: AlertCircle,
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400',
    Icon: CheckCircle,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400',
    Icon: Info,
  },
};

export function Alert({ variant, children, onClose, className }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 border rounded-xl',
        config.container,
        className,
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
