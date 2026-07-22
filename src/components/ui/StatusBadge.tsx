import React from 'react'

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface StatusBadgeProps {
  status: StatusType
  text: string
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-neoGreen text-black border-2 border-black',
  warning: 'bg-neoYellow text-black border-2 border-black',
  danger: 'bg-neoPink text-black border-2 border-black',
  info: 'bg-neoBlue text-black border-2 border-black',
  default: 'bg-white text-black border-2 border-black',
}

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-neo-sm ${statusStyles[status]} ${className}`}
    >
      {text}
    </span>
  )
}
