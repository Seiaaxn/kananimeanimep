import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCompletedAnime } from '@/lib/api'
import { BottomNav } from '@/components/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { AnimeListLoadMore } from '@/components/anime-list-load-more'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

async function CompletedContent({ page }: { page: number }) {
  const data = await getCompletedAnime(page)
  const animeList = data.animeList || []
  const totalPages = data.pagination?.totalPages || 1

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <Link 
            href="/"
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Anime Selesai</h1>
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
            apiEndpoint="/api/anime/completed"
            showScore
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

export default async function CompletedPage({ searchParams }: PageProps) {
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <CompletedContent page={currentPage} />
      </Suspense>
      <BottomNav />
    </main>
  )
}
