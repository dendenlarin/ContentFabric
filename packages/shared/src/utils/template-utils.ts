/**
 * Извлекает уникальные имена параметров из текста шаблона
 *
 * @param template - текст шаблона с {{param}} синтаксисом
 * @returns массив уникальных имён параметров
 * @example extractParameterNames("Hello {{name}}, you are {{age}} years old")
 * // returns ['name', 'age']
 */
export function extractParameterNames(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const names = new Set<string>();
  let match;

  while ((match = regex.exec(template)) !== null) {
    names.add(match[1]);
  }

  return Array.from(names);
}
