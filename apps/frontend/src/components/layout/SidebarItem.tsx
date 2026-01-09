'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface SidebarItemProps {
  /** Иконка элемента */
  icon: ReactNode;
  /** Текстовая метка */
  label: string;
  /** URL для навигации */
  href: string;
  /** Показывать только иконку (режим collapsed) */
  collapsed?: boolean;
  /** Бейдж с числом */
  badge?: number;
}

/**
 * Элемент навигации сайдбара с поддержкой активного состояния,
 * анимаций и режима свёрнутого отображения
 */
export function SidebarItem({
  icon,
  label,
  href,
  collapsed = false,
  badge,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl
        transition-all duration-200 ease-out
        ${collapsed ? 'justify-center' : ''}
        ${isActive
          ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }
      `}
    >
      {/* Иконка с эффектом свечения при активном состоянии */}
      <span
        className={`
          relative flex-shrink-0 transition-all duration-200
          ${isActive ? 'text-primary' : 'group-hover:text-primary/80'}
        `}
      >
        {/* Эффект свечения */}
        {isActive && (
          <span className="absolute inset-0 blur-md bg-primary/40 rounded-full" />
        )}
        <span className="relative [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      </span>

      {/* Текст метки */}
      <span
        className={`
          font-medium text-sm whitespace-nowrap
          transition-all duration-200
          ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
        `}
      >
        {label}
      </span>

      {/* Бейдж */}
      {badge !== undefined && badge > 0 && !collapsed && (
        <span
          className="
            ml-auto px-2 py-0.5 text-xs font-semibold
            bg-primary/20 text-primary rounded-full
            border border-primary/30
          "
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}

      {/* Tooltip в свёрнутом режиме */}
      {collapsed && (
        <span
          className="
            absolute left-full ml-3 px-3 py-1.5
            bg-popover text-popover-foreground text-sm font-medium rounded-lg
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 z-50
            shadow-xl border border-border
            whitespace-nowrap
          "
        >
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="ml-2 text-primary">({badge})</span>
          )}
        </span>
      )}
    </Link>
  );
}
