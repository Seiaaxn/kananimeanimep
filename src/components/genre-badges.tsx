import Link from 'next/link'
import type { Genre } from '@/lib/types'

interface GenreBadgesProps {
  genres: Genre[]
}

const genreColors: Record<string, string> = {
  action: 'bg-red-500/20 text-red-400 border-red-500/30',
  adventure: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  comedy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  demons: 'bg-red-700/20 text-red-500 border-red-700/30',
  drama: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ecchi: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  fantasy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  game: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  harem: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
  historical: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  horror: 'bg-gray-700/20 text-gray-400 border-gray-700/30',
  isekai: 'bg-green-500/20 text-green-400 border-green-500/30',
  josei: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  magic: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'martial-arts': 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  mecha: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  military: 'bg-green-700/20 text-green-500 border-green-700/30',
  music: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  mystery: 'bg-blue-700/20 text-blue-400 border-blue-700/30',
  psychological: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  romance: 'bg-rose-400/20 text-rose-300 border-rose-400/30',
  school: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'sci-fi': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  seinen: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  shoujo: 'bg-pink-300/20 text-pink-200 border-pink-300/30',
  shounen: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'slice-of-life': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  sports: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'super-power': 'bg-red-600/20 text-red-400 border-red-600/30',
  supernatural: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  thriller: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
  vampire: 'bg-red-900/20 text-red-300 border-red-900/30',
}

export function GenreBadges({ genres }: GenreBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const colorClass = genreColors[genre.genreId] || 'bg-muted text-muted-foreground border-border'
        
        return (
          <Link
            key={genre.genreId}
            href={`/genre/${genre.genreId}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-opacity hover:opacity-80 ${colorClass}`}
          >
            {genre.title}
          </Link>
        )
      })}
    </div>
  )
}
