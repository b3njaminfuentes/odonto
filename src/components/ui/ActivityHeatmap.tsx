'use client'

import React, { useState, useEffect } from 'react'
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { intlBO, toBO } from '@/lib/datetime'

export interface ActivityHeatmapProps {
  data: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]
}

const customTheme: ThemeInput = {
  light: ['var(--color-elevated)', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
  dark: ['var(--color-elevated)', '#064e3b', '#047857', '#10b981', '#34d399']
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [activeDay, setActiveDay] = useState<{ date: string; count: number } | null>(null)

  // Auto-close popup after 4 seconds
  useEffect(() => {
    if (activeDay) {
      const timer = setTimeout(() => setActiveDay(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [activeDay])

  // If data is empty (no appointments in 6 months), mock an empty array up to today so the calendar renders
  const safeData = data.length > 0 ? data : [{
    date: new Date().toISOString().split('T')[0],
    count: 0,
    level: 0
  }]

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm overflow-x-auto scrollbar-hide">
      <div className="min-w-[700px] flex justify-center">
        <ActivityCalendar
          data={safeData}
          theme={customTheme}
          labels={{
            months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            totalCount: '{{count}} pacientes atendidos',
            legend: {
              less: 'Menos',
              more: 'Más'
            }
          }}
          colorScheme="light"
          showWeekdayLabels={true}
          hideColorLegend={false}
          hideMonthLabels={false}
          renderBlock={(block, activity) => {
            return React.cloneElement(block as React.ReactElement, {
              title: `${activity.count} pacientes atendidos el ${activity.date}`,
              onClick: () => setActiveDay(activity),
              className: 'cursor-pointer hover:opacity-80 transition-opacity'
            })
          }}
        />
      </div>

      {/* Pop-up elegante inferior */}
      {activeDay && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border shadow-2xl p-4 rounded-2xl z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-4 ring-1 ring-brand/20">
          <div className="bg-brand-soft p-3 rounded-xl border border-brand/10">
            <CalendarIcon className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="font-bold text-text text-base">
              {activeDay.count} {activeDay.count === 1 ? 'paciente atendido' : 'pacientes atendidos'}
            </p>
            <p className="text-sm text-muted capitalize">
              {intlBO({ dateStyle: 'full' }).format(toBO(activeDay.date + 'T12:00:00'))}
            </p>
          </div>
          <button onClick={() => setActiveDay(null)} className="p-2 text-muted hover:text-text hover:bg-elevated rounded-xl transition-all ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
