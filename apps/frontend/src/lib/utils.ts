import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Склонение слов в русском языке
 * @param count - число
 * @param forms - формы слова [один, два-четыре, много]
 * @returns правильная форма слова
 * @example pluralize(5, ['значение', 'значения', 'значений']) // 'значений'
 */
export function pluralize(count: number, forms: [string, string, string]): string {
  const absCount = Math.abs(count);
  const mod10 = absCount % 10;
  const mod100 = absCount % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return forms[2];
  }
  if (mod10 === 1) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }
  return forms[2];
}

// Предустановленные склонения
export const PLURALS = {
  value: ['значение', 'значения', 'значений'] as [string, string, string],
  parameter: ['параметр', 'параметра', 'параметров'] as [string, string, string],
} as const;

/**
 * Форматирование даты в короткий формат (день и месяц)
 * @param dateStr - строка даты в ISO формате
 * @returns отформатированная дата, например "15 янв."
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Форматирование даты с временем
 * @param dateStr - строка даты в ISO формате
 * @returns отформатированная дата со временем, например "15 янв. 2024, 14:30"
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
