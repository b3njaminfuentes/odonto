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
}

export function KPICard({ title, value, icon: Icon, description, trend }: KPICardProps) {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-gray-100 card-hover transition-all group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
    </div>
  )
}
