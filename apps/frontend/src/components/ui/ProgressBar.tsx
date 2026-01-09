interface ProgressBarProps {
  /** Прогресс от 0 до 100 */
  value: number;
  /** Показывать процент */
  showLabel?: boolean;
  /** Размер */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Высота для каждого размера
 */
const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

/**
 * Компонент прогресс-бара для отображения процесса выполнения
 */
export function ProgressBar({
  value,
  showLabel = false,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  // Ограничиваем значение от 0 до 100
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {normalizedValue.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
