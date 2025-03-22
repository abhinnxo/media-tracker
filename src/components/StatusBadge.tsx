
import React from 'react';
import { MediaStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, Eye, Check, X, Pause } from 'lucide-react';

interface StatusBadgeProps {
  status: MediaStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  showText = true,
}) => {
  const statusConfig = {
    [MediaStatus.TO_CONSUME]: {
      label: 'To Watch/Read',
      icon: Clock,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      iconColor: 'text-amber-500',
    },
    [MediaStatus.IN_PROGRESS]: {
      label: 'In Progress',
      icon: Eye,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      iconColor: 'text-blue-500',
    },
    [MediaStatus.COMPLETED]: {
      label: 'Completed',
      icon: Check,
      color: 'bg-green-100 text-green-700 border-green-200',
      iconColor: 'text-green-500',
    },
    [MediaStatus.DROPPED]: {
      label: 'Dropped',
      icon: X,
      color: 'bg-red-100 text-red-700 border-red-200',
      iconColor: 'text-red-500',
    },
    [MediaStatus.ON_HOLD]: {
      label: 'On Hold',
      icon: Pause,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      iconColor: 'text-purple-500',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-2.5 py-0.5 rounded-md',
    lg: 'text-base px-3 py-1 rounded-lg',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium gap-1',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} className={cn(config.iconColor)} />
      {showText && <span>{config.label}</span>}
    </span>
  );
};

export default StatusBadge;
