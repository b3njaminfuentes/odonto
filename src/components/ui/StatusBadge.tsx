import React from 'react'

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface StatusBadgeProps {
  status: StatusType
  text: string
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10',
  default: 'bg-slate-50 text-slate-600 ring-1 ring-slate-500/10',
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
