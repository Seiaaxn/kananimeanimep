import type { Anime } from '@/lib/types'
import { AnimeCard } from './anime-card'

interface AnimeGridProps {
  animeList: Anime[]
  showEpisode?: boolean
  showScore?: boolean
}

export function AnimeGrid({ animeList, showEpisode = true, showScore = false }: AnimeGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {animeList.map((anime) => (
        <AnimeCard 
          key={anime.animeId || anime.slug || anime.title} 
          anime={anime} 
          showEpisode={showEpisode}
          showScore={showScore}
        />
      ))}
    </div>
  )
}
