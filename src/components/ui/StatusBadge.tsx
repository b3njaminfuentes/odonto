import React from 'react'

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface StatusBadgeProps {
  status: StatusType
  text: string
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-success-soft text-success ring-1 ring-success/20',
  warning: 'bg-warning-soft text-warning ring-1 ring-warning/20',
  danger: 'bg-danger-soft text-danger ring-1 ring-danger/20',
  info: 'bg-info-soft text-info ring-1 ring-info/20',
  default: 'bg-elevated text-muted ring-1 ring-border',
}

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      {text}
    </span>
  )
}
