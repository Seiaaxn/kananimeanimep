import { Suspense } from 'react'
import { getHome } from '@/lib/api'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { SearchBar } from '@/components/search-bar'
import { SectionTitle } from '@/components/section-title'
import { AnimeGrid } from '@/components/anime-grid'
import { HeroPoster } from '@/components/hero-poster'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Anime } from '@/lib/types'

async function HomeContent() {
  let ongoingAnime: Anime[] = []
  let completedAnime: Anime[] = []
  let hasError = false

  try {
    const homeData = await getHome()
    
    ongoingAnime = homeData.ongoing?.animeList || []
    completedAnime = homeData.completed?.animeList || []
  } catch (error) {
    console.error('Failed to load home data:', error)
    hasError = true
  }

  if (hasError) {
    return (
      <div className="px-4 pb-24 pt-8">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Tidak dapat memuat data
          </p>
          <p className="text-sm text-muted-foreground/70 text-center mb-4">
            Silakan coba lagi nanti
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Muat Ulang
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 space-y-6 pb-24">
      {/* Hero Poster - New Anime */}
      {ongoingAnime.length > 0 && (
        <HeroPoster animeList={ongoingAnime.slice(0, 5)} />
      )}

      {/* Search Bar */}
      <SearchBar />

      {/* Episode Terbaru */}
      {ongoingAnime.length > 0 && (
        <section>
          <SectionTitle title="Episode Terbaru" href="/ongoing" showMore />
          <AnimeGrid animeList={ongoingAnime.slice(0, 12)} showEpisode />
        </section>
      )}

      {/* Anime Selesai */}
      {completedAnime.length > 0 && (
        <section>
          <SectionTitle title="Selesai Tayang" href="/completed" showMore />
          <AnimeGrid animeList={completedAnime.slice(0, 6)} showScore showEpisode={false} />
        </section>
      )}

      {/* Empty State */}
      {ongoingAnime.length === 0 && completedAnime.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            Tidak ada anime tersedia
          </p>
          <p className="text-sm text-muted-foreground/70 text-center">
            Silakan coba lagi nanti
          </p>
        </div>
      )}
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<LoadingState />}>
        <HomeContent />
      </Suspense>
      <BottomNav />
    </main>
  )
}
