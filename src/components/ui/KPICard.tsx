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

export function KPICard({ title, value, icon: Icon, description, trend, colorClass = "neo-card" }: KPICardProps) {
  return (
    <div className={`${colorClass} p-6 flex flex-col group`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black text-sm font-bold uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-white border-2 border-black rounded-lg shadow-neo-sm group-hover:-translate-y-1 transition-transform">
          <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-black tracking-tight">{value}</span>
        
        {trend && (
          <span
            className={`text-sm font-bold border-b-2 border-black ${
              trend.isPositive ? 'text-black' : 'text-danger'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {description && (
        <p className="mt-2 text-sm text-black font-medium opacity-80">{description}</p>
      )}
    </div>
  )
}
