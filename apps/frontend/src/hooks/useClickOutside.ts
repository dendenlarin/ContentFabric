import { useEffect, RefObject, useCallback } from 'react';

interface UseClickOutsideOptions {
  /** Включен ли обработчик */
  enabled?: boolean;
  /** Обрабатывать ли нажатие Escape */
  handleEscape?: boolean;
}

/**
 * Хук для обработки кликов вне элемента
 * @param ref - React ref элемента
 * @param handler - функция, вызываемая при клике вне элемента
 * @param options - дополнительные опции
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true, handleEscape = false } = options;

  // Мемоизируем handler чтобы избежать лишних подписок
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        stableHandler();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stableHandler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    if (handleEscape) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (handleEscape) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [ref, stableHandler, enabled, handleEscape]);
}
