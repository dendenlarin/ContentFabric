'use client';

import { MoreVertical, Trash2, Variable } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Parameter } from '@/lib/api';
import { pluralize, PLURALS } from '@/lib/utils';
import { useClickOutside } from '@/hooks';

interface ParameterCardProps {
  /** Данные параметра */
  parameter: Parameter;
  /** Выбран ли параметр */
  selected?: boolean;
  /** Callback при клике */
  onClick?: () => void;
  /** Callback при удалении */
  onDelete?: () => void;
}

/**
 * Карточка параметра в списке
 * Показывает название {{param}}, теги со значениями и счетчик
 */
export function ParameterCard({
  parameter,
  selected = false,
  onClick,
  onDelete,
}: ParameterCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне
  const handleCloseMenu = useCallback(() => setShowMenu(false), []);
  useClickOutside(menuRef, handleCloseMenu, { enabled: showMenu });

  // Показываем максимум 5 значений, остальные скрываем за "+N"
  const maxVisibleValues = 5;
  const visibleValues = parameter.values.slice(0, maxVisibleValues);
  const hiddenCount = parameter.values.length - maxVisibleValues;

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-4 rounded-xl border cursor-pointer
        transition-all duration-200
        ${selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-border/80 hover:shadow-md'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`
            p-1.5 rounded-lg
            ${selected ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}
          `}>
            <Variable className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate font-mono">
              {`{{${parameter.name}}}`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDate(parameter.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="
              p-1.5 rounded-lg
              text-muted-foreground hover:text-foreground hover:bg-accent
              opacity-0 group-hover:opacity-100
              transition-all
            "
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="
              absolute right-0 top-full mt-1 z-20
              w-40 py-1
              bg-popover rounded-lg shadow-xl border border-border
              animate-in fade-in zoom-in-95 duration-100
            ">
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="
                    w-full px-3 py-2 text-left text-sm
                    text-destructive hover:bg-destructive/10
                    flex items-center gap-2
                  "
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Счетчик значений */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`
          text-xs font-medium px-2 py-0.5 rounded-full
          ${selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
        `}>
          {parameter.values.length} {pluralize(parameter.values.length, PLURALS.value)}
        </span>
      </div>

      {/* Теги значений */}
      {parameter.values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleValues.map((value, index) => (
            <span
              key={index}
              className="
                px-2 py-0.5
                bg-primary/10 text-primary
                text-xs font-medium rounded-md
                truncate max-w-[120px]
              "
              title={value}
            >
              {value}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="
              px-2 py-0.5
              bg-muted text-muted-foreground
              text-xs font-medium rounded-md
            ">
              +{hiddenCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
