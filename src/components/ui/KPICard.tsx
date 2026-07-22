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

export function KPICard({ title, value, icon: Icon, description, trend, colorClass = "clinical-card bg-white" }: KPICardProps) {
  return (
    <div className={`${colorClass} p-6 flex flex-col group border border-slate-100`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-medium tracking-wide">{title}</h3>
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        
        {trend && (
          <span
            className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
              trend.isPositive ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {description && (
        <p className="mt-3 text-sm text-slate-500">{description}</p>
      )}
    </div>
  )
}
