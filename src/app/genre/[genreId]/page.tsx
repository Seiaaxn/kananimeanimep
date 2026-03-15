import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getGenreAnime } from '@/lib/api'
import { BottomNav } from '@/components/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { AnimeListLoadMore } from '@/components/anime-list-load-more'

interface PageProps {
  params: Promise<{ genreId: string }>
  searchParams: Promise<{ page?: string }>
}

const genreNames: Record<string, string> = {
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

async function GenreAnimeContent({ genreId, page }: { genreId: string; page: number }) {
  const data = await getGenreAnime(genreId, page)
  const animeList = data.animeList || []
  const totalPages = data.pagination?.totalPages || 1
  const genreName = genreNames[genreId] || genreId.charAt(0).toUpperCase() + genreId.slice(1)

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <Link 
            href="/genre"
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Genre: {genreName}</h1>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {animeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Tidak ada anime ditemukan.</p>
          </div>
        ) : (
          <AnimeListLoadMore
            initialAnimeList={animeList}
            initialPage={page}
            totalPages={totalPages}
            apiEndpoint="/api/anime/genre"
            genreId={genreId}
            showScore
            showEpisode
          />
        )}
      </div>
    </>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="w-8 h-8 text-primary" />
    </div>
  )
}

export default async function GenreDetailPage({ params, searchParams }: PageProps) {
  const { genreId } = await params
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <GenreAnimeContent genreId={genreId} page={currentPage} />
      </Suspense>
      <BottomNav />
    </main>
  )
}
