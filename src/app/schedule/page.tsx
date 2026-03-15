'use client'

import { useState, useSyncExternalStore, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Calendar } from 'lucide-react'
import { getSchedule } from '@/lib/api'
import { BottomNav } from '@/components/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { ScheduleDay } from '@/lib/types'

const dayNames: Record<string, string> = {
  'Minggu': 'Min',
  'Senin': 'Sen',
  'Selasa': 'Sel',
  'Rabu': 'Rab',
  'Kamis': 'Kam',
  'Jumat': 'Jum',
  'Sabtu': 'Sab',
  'Random': 'Acak'
}

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Random']
const dayMapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function getTodayDay(): string {
  const today = new Date()
  return dayMapping[today.getDay()]
}

// Get date for each day of current week
function getWeekDates(): Record<string, number> {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Minggu
  const dates: Record<string, number> = {}
  
  dayMapping.forEach((day, index) => {
    const diff = index - currentDay
    const date = new Date(today)
    date.setDate(today.getDate() + diff)
    dates[day] = date.getDate()
  })
  
  return dates
}

// Simple store for hydration-safe values
let todayCache: string | null = null
let weekDatesCache: Record<string, number> | null = null
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

function getWeekDatesSnapshot(): Record<string, number> {
  if (weekDatesCache === null && typeof window !== 'undefined') {
    weekDatesCache = getWeekDates()
  }
  return weekDatesCache || {}
}

function getWeekDatesServerSnapshot(): Record<string, number> {
  return {}
}

function AnimeCard({ anime }: { anime: { title: string; slug: string; poster: string } }) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className="flex items-center gap-3 p-3 bg-card rounded-xl border-l-4 border-l-primary/60 transition-all active:scale-[0.98] hover:bg-card/80"
    >
      {/* Poster */}
      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={anime.poster}
          alt={anime.title || 'Anime'}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {anime.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {anime.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </Link>
  )
}

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string>('Senin')
  
  const today = useSyncExternalStore(subscribe, getTodaySnapshot, getServerSnapshot)
  const weekDates = useSyncExternalStore(subscribe, getWeekDatesSnapshot, getWeekDatesServerSnapshot)

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const data = await getSchedule()
        setScheduleData(data)
        // Set active day to today if available
        if (today && data.find(d => d.day === today)) {
          setActiveDay(today)
        } else if (data.length > 0) {
          setActiveDay(data[0].day)
        }
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [today])

  // Sort schedule by day order
  const sortedSchedule = [...scheduleData].sort((a, b) => {
    const aIndex = dayOrder.indexOf(a.day)
    const bIndex = dayOrder.indexOf(b.day)
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
  })

  const activeSchedule = sortedSchedule.find(s => s.day === activeDay)
  const animeList = activeSchedule?.anime_list || []

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-center h-14 px-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Jadwal Tayang</h1>
          </div>
        </div>
      </header>

      {/* Day Selector */}
      <div className="sticky top-14 z-30 bg-background border-b border-border/50 px-2 py-3">
        <div className="flex justify-between gap-1">
          {sortedSchedule.slice(0, 7).map((day) => {
            const isActive = activeDay === day.day
            const isToday = today === day.day
            const date = weekDates[day.day]
            
            return (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={cn(
                  "flex-1 flex flex-col items-center py-2 rounded-xl transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-transparent text-muted-foreground hover:bg-muted",
                  isToday && !isActive && "ring-1 ring-primary/50"
                )}
              >
                <span className="text-[10px] font-medium">
                  {dayNames[day.day] || day.day}
                </span>
                <span className={cn(
                  "text-sm font-bold mt-0.5",
                  isActive ? "text-primary-foreground" : isToday ? "text-primary" : "text-foreground"
                )}>
                  {date || ''}
                </span>
                {isToday && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1",
                    isActive ? "bg-primary-foreground" : "bg-primary"
                  )} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Anime List */}
      <div className="px-4 py-4 space-y-3">
        {animeList.length > 0 ? (
          animeList.map((anime, index) => (
            <AnimeCard key={`${anime.slug}-${index}`} anime={anime} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              Tidak ada jadwal untuk hari ini
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
