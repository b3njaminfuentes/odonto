import React from 'react'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  colorClass?: string
}

export function KPICard({ title, value, icon: Icon, description, trend, colorClass = "" }: KPICardProps) {
  return (
    <div className={`card-interactive p-6 flex flex-col group ${colorClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-muted text-sm font-medium tracking-wide">{title}</h3>
        <div className="p-2 bg-elevated border border-border rounded-lg text-faint group-hover:bg-brand-soft group-hover:text-brand transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-text tracking-tight">{value}</span>

        {trend && (
          <span
            className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
              trend.isPositive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm text-muted">{description}</p>
      )}
    </div>
  )
}
