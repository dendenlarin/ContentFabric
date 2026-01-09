'use client';

import { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import { X, Plus, Tag, Variable, ArrowRight } from 'lucide-react';
import { Parameter } from '@/lib/api';
import { pluralize, PLURALS } from '@/lib/utils';
import { useClickOutside } from '@/hooks';

interface ParameterPopoverProps {
  /** Имя параметра */
  parameterName: string;
  /** Текущие значения параметра */
  values: string[];
  /** Доступные глобальные параметры */
  availableParameters?: Parameter[];
  /** Callback при добавлении значения */
  onAddValue: (value: string) => void;
  /** Callback при удалении значения */
  onRemoveValue: (value: string) => void;
  /** Callback при выборе глобального параметра */
  onSelectParameter?: (param: Parameter) => void;
  /** Callback при закрытии */
  onClose: () => void;
  /** Позиция popup */
  position: { x: number; y: number };
  /** Открыт ли popup */
  open: boolean;
}

/**
 * Popup для добавления и управления значениями параметра
 * Появляется при клике на параметр в редакторе
 */
export function ParameterPopover({
  parameterName,
  values,
  availableParameters,
  onAddValue,
  onRemoveValue,
  onSelectParameter,
  onClose,
  position,
  open,
}: ParameterPopoverProps) {
  const [newValue, setNewValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокус на input при открытии
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Закрытие при клике вне popover или нажатии Escape
  const handleClosePopover = useCallback(() => onClose(), [onClose]);
  useClickOutside(popoverRef, handleClosePopover, { enabled: open, handleEscape: true });

  const handleAddValue = () => {
    const trimmed = newValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      onAddValue(trimmed);
      setNewValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
  };

  if (!open) return null;

  // Корректировка позиции чтобы не выходить за границы экрана
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.min(position.y, window.innerHeight - 350),
  };

  return (
    <div
      ref={popoverRef}
      className="
        fixed z-50 w-80
        bg-popover rounded-xl
        shadow-2xl shadow-black/10
        border border-border
        overflow-hidden
        animate-in fade-in zoom-in-95 duration-150
      "
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-muted/50 to-popover border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <code className="text-sm font-semibold text-foreground">
            {`{{${parameterName}}}`}
          </code>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Выбор из глобальных параметров */}
        {availableParameters && availableParameters.length > 0 && values.length === 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Variable className="w-3.5 h-3.5" />
              <span>Использовать глобальный параметр:</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {availableParameters.map((param) => (
                <button
                  key={param.id}
                  onClick={() => {
                    onSelectParameter?.(param);
                    onClose();
                  }}
                  className="
                    w-full flex items-center justify-between
                    px-3 py-2 rounded-lg
                    bg-muted/50 hover:bg-primary/10
                    border border-border hover:border-primary/30
                    text-sm text-foreground hover:text-primary
                    transition-colors group
                  "
                >
                  <span className="font-mono font-medium">{param.name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground group-hover:text-primary">
                    <span className="text-xs">{param.values.length} знач.</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-muted-foreground">Или добавьте значения вручную:</p>
            </div>
          </div>
        )}

        {/* Статус */}
        <div className="flex items-center gap-2">
          <span
            className={`
              w-2 h-2 rounded-full
              ${values.length > 0 ? 'bg-emerald-500' : 'bg-red-500'}
            `}
          />
          <span className="text-sm text-muted-foreground">
            {values.length > 0
              ? `Определено ${values.length} ${pluralize(values.length, PLURALS.value)}`
              : 'Параметр не определён'
            }
          </span>
        </div>

        {/* Список значений */}
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted/50 rounded-lg">
            {values.map((value, index) => (
              <span
                key={index}
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-1
                  bg-card text-foreground text-sm
                  rounded-lg border border-border
                  shadow-sm
                  group
                "
              >
                {value}
                <button
                  onClick={() => onRemoveValue(value)}
                  className="
                    p-0.5 -mr-1
                    text-muted-foreground hover:text-destructive hover:bg-destructive/10
                    rounded transition-colors
                    opacity-60 group-hover:opacity-100
                  "
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Добавление нового значения */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Добавить значение..."
            className="
              flex-1 px-3 py-2
              bg-muted/50 border border-border rounded-lg
              text-sm text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring
              transition-all
            "
          />
          <button
            onClick={handleAddValue}
            disabled={!newValue.trim()}
            className="
              px-3 py-2
              bg-primary hover:bg-primary/90
              disabled:bg-muted disabled:cursor-not-allowed
              text-primary-foreground disabled:text-muted-foreground
              rounded-lg
              transition-colors
              flex items-center gap-1
            "
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Подсказка */}
        <p className="text-xs text-muted-foreground">
          Нажмите Enter для добавления. Все значения будут использованы для генерации промптов.
        </p>
      </div>
    </div>
  );
}
