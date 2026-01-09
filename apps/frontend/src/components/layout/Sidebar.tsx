'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Variable,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  /** Состояние свёрнутости сайдбара */
  collapsed?: boolean;
  /** Callback при изменении состояния свёрнутости */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** Основные секции навигации */
const navItems = [
  { href: '/parameters', label: 'Параметры', icon: Variable },
  { href: '/templates', label: 'Шаблоны', icon: FileText },
  { href: '/generations', label: 'Генерации', icon: Sparkles },
  { href: '/history', label: 'История', icon: History },
];

/**
 * Левый сайдбар навигации с тёмной темой,
 * анимацией сворачивания и красивыми переходами
 */
export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Поддержка как controlled, так и uncontrolled режимов
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

  // Сохранение состояния в localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null && controlledCollapsed === undefined) {
      setInternalCollapsed(saved === 'true');
    }
  }, [controlledCollapsed]);

  const handleToggle = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    localStorage.setItem('sidebar-collapsed', String(newValue));
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        flex flex-col
        bg-card border-r border-border
        transition-all duration-300 ease-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Декоративный градиент сверху */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Header с логотипом */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-border">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-0' : 'w-full'}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
          <span
            className={`
              font-bold text-foreground whitespace-nowrap
              transition-all duration-200
              ${collapsed ? 'opacity-0' : 'opacity-100'}
            `}
          >
            ContentFabric
          </span>
        </div>

        {/* Кнопка в свёрнутом режиме */}
        {collapsed && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={<item.icon />}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer с Settings и кнопкой сворачивания */}
      <div className="relative border-t border-border py-4 space-y-1">
        <SidebarItem
          href="/settings"
          label="Настройки"
          icon={<Settings />}
          collapsed={collapsed}
        />

        {/* Кнопка сворачивания */}
        <button
          onClick={handleToggle}
          className={`
            flex items-center gap-3 px-3 py-2.5 mx-2 w-[calc(100%-1rem)]
            rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          <span className="flex-shrink-0">
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </span>
          <span
            className={`
              text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
            `}
          >
            Свернуть
          </span>
        </button>
      </div>

      {/* Декоративная линия снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </aside>
  );
}
