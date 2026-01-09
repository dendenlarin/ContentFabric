'use client';

import { MoreVertical, Trash2, Copy, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PromptTemplate } from '@/lib/api';
import { extractParameterNames } from '@/lib/template-utils';

interface TemplateCardProps {
  /** Данные шаблона */
  template: PromptTemplate;
  /** Выбран ли шаблон */
  selected?: boolean;
  /** Callback при клике */
  onClick?: () => void;
  /** Callback при удалении */
  onDelete?: () => void;
  /** Callback при дублировании */
  onDuplicate?: () => void;
}

/**
 * Карточка шаблона в списке
 * Показывает название, preview текста и параметры
 */
export function TemplateCard({
  template,
  selected = false,
  onClick,
  onDelete,
  onDuplicate,
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Извлекаем параметры из текста шаблона
  const parameterNames = extractParameterNames(template.template);

  // Preview текста (первые 100 символов)
  const preview = template.template.length > 100
    ? template.template.slice(0, 100) + '...'
    : template.template;

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
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`
            p-1.5 rounded-lg
            ${selected ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}
          `}>
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDate(template.createdAt)}
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
              {onDuplicate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="
                    w-full px-3 py-2 text-left text-sm
                    text-foreground hover:bg-accent
                    flex items-center gap-2
                  "
                >
                  <Copy className="w-4 h-4" />
                  Дублировать
                </button>
              )}
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

      {/* Preview */}
      <div className="mb-3 p-2 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground font-mono line-clamp-2">
          {preview}
        </p>
      </div>

      {/* Parameters */}
      {parameterNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {parameterNames.map((name) => (
            <span
              key={name}
              className="
                px-2 py-0.5
                bg-primary/10 text-primary
                text-xs font-medium rounded-md
              "
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
