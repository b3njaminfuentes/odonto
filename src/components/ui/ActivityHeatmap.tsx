'use client'

import React from 'react'
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar'

export interface ActivityHeatmapProps {
  data: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]
}

const customTheme: ThemeInput = {
  light: ['var(--color-elevated)', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
  dark: ['var(--color-elevated)', '#064e3b', '#047857', '#10b981', '#34d399']
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
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
              onClick: () => alert(`${activity.count} pacientes atendidos el ${activity.date}`)
            })
          }}
        />
      </div>
    </div>
  )
}
