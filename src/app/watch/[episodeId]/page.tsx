import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, List } from 'lucide-react'
import { getEpisode } from '@/lib/api'
import { BottomNav } from '@/components/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { VideoPlayer } from '@/components/video-player'
import { ServerSelector } from '@/components/server-selector'
import { DownloadSection } from '@/components/download-section'


interface PageProps {
  params: Promise<{ episodeId: string }>
}

async function WatchContent({ episodeId }: { episodeId: string }) {
  let episodeData
  
  try {
    episodeData = await getEpisode(episodeId)
  } catch {
    notFound()
  }

  if (!episodeData) {
    notFound()
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link 
            href={`/anime/${episodeData.animeId}`}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium truncate max-w-[200px]">Kembali</span>
          </Link>
        </div>
      </header>

      {/* Video Player */}
      <VideoPlayer 
        defaultUrl={episodeData.defaultStreamingUrl}
        episodeId={episodeId}
        episodeTitle={episodeData.title}
        animeId={episodeData.animeId}
      />

      {/* Episode Info & Navigation */}
      <div className="px-4 py-4 space-y-4">
        <h1 className="text-lg font-bold text-foreground line-clamp-2">
          {episodeData.title}
        </h1>

        {/* Episode Navigation */}
        <div className="flex gap-2">
          {episodeData.hasPrevEpisode && episodeData.prevEpisode && (
            <Link
              href={`/watch/${episodeData.prevEpisode.episodeId}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </Link>
          )}
          
          {episodeData.hasNextEpisode && episodeData.nextEpisode && (
            <Link
              href={`/watch/${episodeData.nextEpisode.episodeId}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium text-primary-foreground transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Server Selection */}
        {episodeData.server?.qualities && (
          <ServerSelector 
            qualities={episodeData.server.qualities}
            episodeId={episodeId}
          />
        )}

        {/* Download Section */}
        {episodeData.downloadUrl?.qualities && (
          <DownloadSection qualities={episodeData.downloadUrl.qualities} />
        )}

        {/* Episode List */}
        {episodeData.info?.episodeList && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Episode Lainnya</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {episodeData.info.episodeList.map((ep) => (
                <Link
                  key={ep.episodeId}
                  href={`/watch/${ep.episodeId}`}
                  className={`flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-colors ${
                    ep.episodeId === episodeId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {ep.eps}
                </Link>
              ))}
            </div>
          </div>
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

export default async function WatchPage({ params }: PageProps) {
  const { episodeId } = await params
  
  return (
    <main className="min-h-screen bg-background pb-20">
      <Suspense fallback={<LoadingState />}>
        <WatchContent episodeId={episodeId} />
      </Suspense>
      <BottomNav />
    </main>
  )
}
