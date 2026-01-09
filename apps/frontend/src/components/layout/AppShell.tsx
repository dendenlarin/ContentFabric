'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  /** Содержимое основной области */
  children: ReactNode;
  /** Заголовок страницы (для header) */
  title?: string;
  /** Подзаголовок или описание */
  subtitle?: string;
  /** Дополнительные действия в header */
  headerActions?: ReactNode;
}

/**
 * Основной layout приложения: сайдбар слева + контентная область справа
 * с липким header и плавными анимациями
 */
export function AppShell({
  children,
  title,
  subtitle,
  headerActions,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Отслеживание скролла для эффекта тени header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Загрузка состояния сайдбара из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />

      {/* Main content area */}
      <div
        className={`
          min-h-screen transition-all duration-300 ease-out
          ${collapsed ? 'ml-16' : 'ml-60'}
        `}
      >
        {/* Header */}
        {(title || headerActions) && (
          <header
            className={`
              sticky top-0 z-30 h-16
              bg-background/80 backdrop-blur-xl
              border-b transition-all duration-200
              ${scrolled ? 'border-border shadow-sm' : 'border-transparent'}
            `}
          >
            <div className="h-full px-6 flex items-center justify-between">
              {/* Title section */}
              <div className="flex flex-col justify-center">
                {title && (
                  <h1 className="text-lg font-semibold text-foreground leading-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground leading-tight">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Actions */}
              {headerActions && (
                <div className="flex items-center gap-3">
                  {headerActions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
