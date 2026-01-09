/**
 * Утилиты для парсинга и работы с шаблонами промптов
 */

import { extractParameterNames } from '@content-fabric/shared';

// Реэкспорт из shared пакета
export { extractParameterNames };

/** Сегмент обычного текста */
interface TextSegment {
  type: 'text';
  value: string;
}

/** Сегмент параметра {{param}} */
interface ParameterSegment {
  type: 'parameter';
  /** Полный match: {{param}} */
  value: string;
  /** Только имя параметра: param */
  paramName: string;
  /** Определён ли параметр (есть ли значения) */
  isDefined: boolean;
  /** Начальный индекс в строке */
  startIndex: number;
  /** Конечный индекс в строке */
  endIndex: number;
}

export type Segment = TextSegment | ParameterSegment;

/**
 * Парсит текст шаблона и возвращает массив сегментов
 * (текст и параметры) для рендеринга с подсветкой
 *
 * @param template - текст шаблона с {{param}} синтаксисом
 * @param definedParameters - карта определённых параметров (имя -> значения)
 * @returns массив сегментов для рендеринга
 */
export function parseTemplateSegments(
  template: string,
  definedParameters: Record<string, string[]>
): Segment[] {
  const regex = /\{\{(\w+)\}\}/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    // Текст до параметра
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: template.slice(lastIndex, match.index),
      });
    }

    // Параметр
    const paramName = match[1];
    const values = definedParameters[paramName];
    segments.push({
      type: 'parameter',
      value: match[0],
      paramName,
      isDefined: values !== undefined && values.length > 0,
      startIndex: match.index,
      endIndex: regex.lastIndex,
    });

    lastIndex = regex.lastIndex;
  }

  // Оставшийся текст после последнего параметра
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      value: template.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Проверяет, все ли параметры в шаблоне определены
 *
 * @param template - текст шаблона
 * @param definedParameters - карта определённых параметров
 * @returns true если все параметры определены
 */
export function areAllParametersDefined(
  template: string,
  definedParameters: Record<string, string[]>
): boolean {
  const paramNames = extractParameterNames(template);
  return paramNames.every(
    (name) => definedParameters[name] && definedParameters[name].length > 0
  );
}

/**
 * Возвращает список неопределённых параметров в шаблоне
 *
 * @param template - текст шаблона
 * @param definedParameters - карта определённых параметров
 * @returns массив имён неопределённых параметров
 */
export function getUndefinedParameters(
  template: string,
  definedParameters: Record<string, string[]>
): string[] {
  const paramNames = extractParameterNames(template);
  return paramNames.filter(
    (name) => !definedParameters[name] || definedParameters[name].length === 0
  );
}

/**
 * Подсчитывает количество возможных комбинаций промптов
 * на основе значений параметров
 *
 * @param definedParameters - карта параметров со значениями
 * @param paramNames - имена параметров для подсчёта (опционально)
 * @returns количество комбинаций
 */
export function countCombinations(
  definedParameters: Record<string, string[]>,
  paramNames?: string[]
): number {
  const names = paramNames ?? Object.keys(definedParameters);

  if (names.length === 0) return 0;

  return names.reduce((total, name) => {
    const values = definedParameters[name];
    if (!values || values.length === 0) return 0;
    return total * values.length;
  }, 1);
}
