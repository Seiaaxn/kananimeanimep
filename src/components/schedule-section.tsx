'use client'

import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ScheduleDay } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScheduleSectionProps {
  schedule: ScheduleDay[]
}

const dayNames: Record<string, string> = {
  'Senin': 'Sen',
  'Selasa': 'Sel',
  'Rabu': 'Rab',
  'Kamis': 'Kam',
  'Jumat': 'Jum',
  'Sabtu': 'Sab',
  'Minggu': 'Min',
  'Random': 'Acak'
}

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Random']

// Helper to get today's day
function getTodayDay(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const today = new Date()
  return days[today.getDay()]
}

// Create a simple store for today's day
let todayCache: string | null = null
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getTodaySnapshot(): string | null {
  if (todayCache === null && typeof window !== 'undefined') {
    todayCache = getTodayDay()
  }
  return todayCache
}

function getServerSnapshot(): string | null {
  return null
}

export function ScheduleSection({ schedule }: ScheduleSectionProps) {
  const [activeDay, setActiveDay] = useState<string>(schedule[0]?.day || 'Senin')
  
  // Use sync external store to avoid hydration mismatch
  const today = useSyncExternalStore(subscribe, getTodaySnapshot, getServerSnapshot)
  
  // Sort schedule by day order
  const sortedSchedule = [...schedule].sort((a, b) => {
    const aIndex = dayOrder.indexOf(a.day)
    const bIndex = dayOrder.indexOf(b.day)
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
  })
  
  // Auto-select today if available (only when today is known)
  const currentActiveDay = today && sortedSchedule.find(s => s.day === today) 
    ? (activeDay === (schedule[0]?.day || 'Senin') && sortedSchedule.find(s => s.day === today) ? today : activeDay)
    : activeDay
  
  const activeSchedule = sortedSchedule.find(s => s.day === currentActiveDay)
  const animeList = activeSchedule?.anime_list || []

  if (!schedule || schedule.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Tidak ada jadwal tersedia
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {sortedSchedule.map((day) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(day.day)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors relative',
              currentActiveDay === day.day
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
              today && day.day === today && 'ring-1 ring-primary/50'
            )}
          >
            {dayNames[day.day] || day.day}
            {today && day.day === today && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Anime list */}
      {animeList.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {animeList.map((anime, index) => (
            <Link
              key={`${anime.slug}-${index}`}
              href={`/anime/${anime.slug}`}
              className="flex-shrink-0 w-28 group"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted ring-1 ring-border/50 group-hover:ring-primary/50 transition-all">
                <Image
                  src={anime.poster}
                  alt={anime.title || 'Anime'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="112px"
                />
              </div>
              <h4 className="mt-2 text-[11px] font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {anime.title}
              </h4>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Tidak ada anime untuk hari ini
        </div>
      )}
    </div>
  )
}
