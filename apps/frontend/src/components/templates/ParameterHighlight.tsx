'use client';

import { MouseEvent } from 'react';

interface ParameterHighlightProps {
  /** Имя параметра (без фигурных скобок) */
  name: string;
  /** Статус: определён ли параметр */
  status: 'defined' | 'undefined';
  /** Callback при клике */
  onClick?: (event: MouseEvent) => void;
}

/**
 * Подсвеченный параметр в тексте шаблона
 * Красный = не определён, Зелёный = определён
 *
 * ВАЖНО: Этот компонент используется в overlay архитектуре,
 * поэтому он НЕ должен изменять размеры текста.
 * Текст должен точно совпадать с textarea.
 */
export function ParameterHighlight({
  name,
  status,
  onClick,
}: ParameterHighlightProps) {
  const isDefined = status === 'defined';

  return (
    <mark
      onClick={onClick}
      data-param={name}
      className={`
        rounded-sm cursor-pointer
        pointer-events-auto
        transition-colors duration-150
        ${isDefined
          ? 'bg-emerald-200/70 text-emerald-800 hover:bg-emerald-300/70'
          : 'bg-red-200/70 text-red-800 hover:bg-red-300/70'
        }
      `}
      title={isDefined ? `Параметр определён: ${name}` : `Нажмите чтобы определить: ${name}`}
    >
      {`{{${name}}}`}
    </mark>
  );
}
