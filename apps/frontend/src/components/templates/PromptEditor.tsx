'use client';

import { useRef, useMemo, useCallback, useState, MouseEvent } from 'react';
import { parseTemplateSegments, extractParameterNames } from '@/lib/template-utils';
import { ParameterHighlight } from './ParameterHighlight';
import { ParameterPopover } from './ParameterPopover';
import { Parameter } from '@/lib/api';

interface PromptEditorProps {
  /** Текст шаблона */
  value: string;
  /** Callback при изменении текста */
  onChange: (value: string) => void;
  /** Карта параметров: имя -> массив значений */
  parameters: Record<string, string[]>;
  /** Callback при изменении параметров */
  onParametersChange: (parameters: Record<string, string[]>) => void;
  /** Доступные глобальные параметры */
  availableParameters?: Parameter[];
  /** Placeholder текст */
  placeholder?: string;
  /** Отключить редактирование */
  disabled?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Редактор шаблона промпта с inline подсветкой параметров
 * Использует overlay архитектуру для синхронизации textarea и подсветки
 */
export function PromptEditor({
  value,
  onChange,
  parameters,
  onParametersChange,
  availableParameters,
  placeholder = 'Введите текст шаблона. Используйте {{param}} для параметров...',
  disabled = false,
  className = '',
}: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Состояние для popover
  const [activeParam, setActiveParam] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // Парсинг сегментов для подсветки
  const segments = useMemo(() => {
    return parseTemplateSegments(value, parameters);
  }, [value, parameters]);

  // Список всех параметров в шаблоне
  const parameterNames = useMemo(() => {
    return extractParameterNames(value);
  }, [value]);

  // Синхронизация скролла
  const handleScroll = useCallback(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Обработка клика на параметр
  const handleParameterClick = useCallback((e: MouseEvent, paramName: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      x: rect.left,
      y: rect.bottom + 8,
    });
    setActiveParam(paramName);
  }, []);

  // Добавление значения параметра
  const handleAddValue = useCallback((value: string) => {
    if (!activeParam) return;
    const currentValues = parameters[activeParam] || [];
    if (!currentValues.includes(value)) {
      onParametersChange({
        ...parameters,
        [activeParam]: [...currentValues, value],
      });
    }
  }, [activeParam, parameters, onParametersChange]);

  // Удаление значения параметра
  const handleRemoveValue = useCallback((value: string) => {
    if (!activeParam) return;
    const currentValues = parameters[activeParam] || [];
    onParametersChange({
      ...parameters,
      [activeParam]: currentValues.filter((v) => v !== value),
    });
  }, [activeParam, parameters, onParametersChange]);

  // Закрытие popover
  const handleClosePopover = useCallback(() => {
    setActiveParam(null);
  }, []);

  // Выбор глобального параметра
  const handleSelectGlobalParameter = useCallback((param: Parameter) => {
    if (!activeParam) return;
    onParametersChange({
      ...parameters,
      [activeParam]: param.values,
    });
    setActiveParam(null);
  }, [activeParam, parameters, onParametersChange]);

  // Статистика параметров
  const definedCount = parameterNames.filter(
    (name) => parameters[name]?.length > 0
  ).length;
  const totalCount = parameterNames.length;

  return (
    <div className={`relative ${className}`}>
      {/* Wrapper для overlay архитектуры */}
      <div className="relative min-h-[200px] rounded-xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all">
        {/* Overlay для подсветки (позади textarea) */}
        <div
          ref={overlayRef}
          className="
            absolute inset-0 p-4
            font-mono text-sm leading-relaxed
            whitespace-pre-wrap break-words
            overflow-auto
            pointer-events-none
          "
          aria-hidden="true"
        >
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              // Сохраняем пробелы и переносы строк
              return (
                <span key={index} className="text-foreground">
                  {segment.value}
                </span>
              );
            }
            return (
              <ParameterHighlight
                key={index}
                name={segment.paramName}
                status={segment.isDefined ? 'defined' : 'undefined'}
                onClick={(e) => handleParameterClick(e, segment.paramName)}
              />
            );
          })}
          {/* Placeholder когда пусто */}
          {value === '' && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>

        {/* Textarea (поверх overlay, с прозрачным текстом) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          disabled={disabled}
          className="
            relative z-10 w-full min-h-[200px] p-4
            font-mono text-sm leading-relaxed
            bg-transparent resize-y
            text-transparent caret-foreground selection:bg-primary/20
            focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
          "
        />
      </div>

      {/* Статус параметров */}
      {totalCount > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Параметров: <span className="font-medium text-foreground">{totalCount}</span>
            </span>
            <span className={definedCount === totalCount ? 'text-emerald-600' : 'text-amber-600'}>
              Определено: <span className="font-medium">{definedCount}/{totalCount}</span>
            </span>
          </div>

          {/* Легенда */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              Определён
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
              Не определён
            </span>
          </div>
        </div>
      )}

      {/* Popover для редактирования параметра */}
      <ParameterPopover
        parameterName={activeParam || ''}
        values={activeParam ? parameters[activeParam] || [] : []}
        availableParameters={availableParameters}
        onAddValue={handleAddValue}
        onRemoveValue={handleRemoveValue}
        onSelectParameter={handleSelectGlobalParameter}
        onClose={handleClosePopover}
        position={popoverPosition}
        open={activeParam !== null}
      />
    </div>
  );
}
