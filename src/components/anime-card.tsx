import Image from 'next/image'
import Link from 'next/link'
import type { Anime } from '@/lib/types'

interface AnimeCardProps {
  anime: Anime
  showEpisode?: boolean
  showScore?: boolean
}

export function AnimeCard({ anime, showEpisode = true, showScore = false }: AnimeCardProps) {
  const animeId = anime.animeId || anime.slug || ''
  
  return (
    <Link 
      href={`/anime/${animeId}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
        />
        
        {/* Episode badge */}
        {showEpisode && anime.episodes && (
          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
            Ep {anime.episodes}
          </div>
        )}
        
        {/* Score badge */}
        {showScore && anime.score && (
          <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <span>★</span>
            <span>{anime.score}</span>
          </div>
        )}
        
        {/* Release date */}
        {anime.latestReleaseDate && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <span className="text-[10px] text-white/80">{anime.latestReleaseDate}</span>
          </div>
        )}
      </div>
      
      <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {anime.title}
      </h3>
    </Link>
  )
}
