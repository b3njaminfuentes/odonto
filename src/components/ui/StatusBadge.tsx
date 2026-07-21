import React from 'react'

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface StatusBadgeProps {
  status: StatusType
  text: string
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-successLight text-success border border-success/20',
  warning: 'bg-warningLight text-warning border border-warning/20',
  danger: 'bg-dangerLight text-danger border border-danger/20',
  info: 'bg-infoLight text-info border border-info/20',
  default: 'bg-gray-100 text-gray-700 border border-gray-200',
}

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusStyles[status]} ${className}`}
    >
      {text}
    </span>
  )
}
