'use client';

import { Badge, BadgeProps } from './Badge';
import { GenerationStatus, TaskStatus } from '@content-fabric/shared';

type StatusType = GenerationStatus | TaskStatus | string;

interface StatusConfig {
  variant: BadgeProps['variant'];
  label: string;
}

const statusConfig: Record<string, StatusConfig> = {
  // GenerationStatus
  draft: { variant: 'default', label: 'Черновик' },
  pending: { variant: 'default', label: 'Ожидание' },
  running: { variant: 'info', label: 'Выполняется' },
  processing: { variant: 'info', label: 'Обработка' },
  completed: { variant: 'success', label: 'Завершено' },
  failed: { variant: 'error', label: 'Ошибка' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
