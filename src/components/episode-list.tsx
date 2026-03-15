'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import type { Episode } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EpisodeListProps {
  episodes: Episode[]
  animeId: string
  animeTitle: string
  poster: string
}

export function EpisodeList({ episodes, animeId, animeTitle, poster }: EpisodeListProps) {
  const [expanded, setExpanded] = useState(false)
  const sortedEpisodes = [...episodes].sort((a, b) => a.eps - b.eps)
  const displayedEpisodes = expanded ? sortedEpisodes : sortedEpisodes.slice(0, 10)

  return (
    <div className="space-y-2">
      {displayedEpisodes.map((episode) => (
        <Link
          key={episode.episodeId}
          href={`/watch/${episode.episodeId}`}
          className="flex items-center gap-3 p-3 bg-card hover:bg-card/80 rounded-lg transition-colors group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {episode.eps}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Episode {episode.eps}
            </p>
            {episode.date && (
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{episode.date}</span>
              </div>
            )}
          </div>
          
          <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      ))}
      
      {sortedEpisodes.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full py-2 text-sm text-primary hover:underline"
        >
          {expanded ? (
            <>
              Tampilkan Lebih Sedikit
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Lihat Semua Episode ({sortedEpisodes.length - 10} lagi)
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}
