import { Suspense } from 'react'
import Link from 'next/link'
import { getGenres } from '@/lib/api'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { SectionTitle } from '@/components/section-title'
import { AlertCircle } from 'lucide-react'

const genreColors: Record<string, string> = {
  action: 'border-l-red-500',
  adventure: 'border-l-orange-500',
  comedy: 'border-l-yellow-500',
  demons: 'border-l-red-700',
  drama: 'border-l-purple-500',
  ecchi: 'border-l-pink-500',
  fantasy: 'border-l-emerald-500',
  game: 'border-l-cyan-500',
  harem: 'border-l-pink-400',
  historical: 'border-l-stone-500',
  horror: 'border-l-gray-700',
  isekai: 'border-l-green-500',
  josei: 'border-l-rose-500',
  magic: 'border-l-violet-500',
  'martial-arts': 'border-l-amber-600',
  mecha: 'border-l-slate-500',
  military: 'border-l-green-700',
  music: 'border-l-indigo-500',
  mystery: 'border-l-blue-700',
  psychological: 'border-l-fuchsia-500',
  parody: 'border-l-lime-500',
  police: 'border-l-blue-600',
  romance: 'border-l-rose-400',
  samurai: 'border-l-red-800',
  school: 'border-l-blue-500',
  'sci-fi': 'border-l-teal-500',
  seinen: 'border-l-zinc-500',
  shoujo: 'border-l-pink-300',
  'shoujo-ai': 'border-l-pink-500',
  shounen: 'border-l-amber-500',
  'slice-of-life': 'border-l-lime-500',
  sports: 'border-l-sky-500',
  space: 'border-l-indigo-600',
  'super-power': 'border-l-red-600',
  supernatural: 'border-l-purple-600',
  thriller: 'border-l-gray-600',
  vampire: 'border-l-red-900',
}

const genreTranslations: Record<string, string> = {
  action: 'Aksi',
  adventure: 'Petualangan',
  comedy: 'Komedi',
  demons: 'Iblis',
  drama: 'Drama',
  ecchi: 'Ecchi',
  fantasy: 'Fantasi',
  game: 'Game',
  harem: 'Harem',
  historical: 'Sejarah',
  horror: 'Horor',
  josei: 'Josei',
  magic: 'Sihir',
  'martial-arts': 'Seni Bela Diri',
  mecha: 'Mecha',
  military: 'Militer',
  music: 'Musik',
  mystery: 'Misteri',
  psychological: 'Psikologis',
  parody: 'Parodi',
  police: 'Polisi',
  romance: 'Romansa',
  samurai: 'Samurai',
  school: 'Sekolah',
  'sci-fi': 'Sci-Fi',
  seinen: 'Seinen',
  shoujo: 'Shoujo',
  'shoujo-ai': 'Shoujo Ai',
  shounen: 'Shounen',
  'slice-of-life': 'Kehidupan Sehari-hari',
  sports: 'Olahraga',
  space: 'Luar Angkasa',
  'super-power': 'Kekuatan Super',
  supernatural: 'Supernatural',
  thriller: 'Thriller',
  vampire: 'Vampir',
}

async function GenreContent() {
  let genres: { genreId: string; title: string; href: string }[] = []
  let hasError = false
  
  try {
    const genreData = await getGenres()
    genres = genreData.genreList || []
  } catch (error) {
    console.error('Failed to load genres:', error)
    hasError = true
  }

  if (hasError || genres.length === 0) {
    return (
      <div className="px-4 pb-24">
        <SectionTitle title="Jelajahi Genre" />
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Tidak dapat memuat genre
          </p>
          <p className="text-sm text-muted-foreground/70 text-center">
            Silakan coba lagi nanti
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-24">
      <SectionTitle title="Jelajahi Genre" />
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {genres.map((genre) => {
          const borderColor = genreColors[genre.genreId] || 'border-l-primary'
          const displayName = genreTranslations[genre.genreId] || genre.title
          
          return (
            <Link
              key={genre.genreId}
              href={`/genre/${genre.genreId}`}
              className={`flex items-center p-4 bg-card hover:bg-card/80 rounded-lg border-l-4 ${borderColor} transition-colors`}
            >
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner className="w-8 h-8 text-primary" />
    </div>
  )
}

export default function GenrePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-4">
        <Suspense fallback={<LoadingState />}>
          <GenreContent />
        </Suspense>
      </div>
      <BottomNav />
    </main>
  )
}
