import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Heart, Play, List, Tv, Calendar, Clock, Star, Building2 } from 'lucide-react'
import { getAnimeDetail } from '@/lib/api'
import { BottomNav } from '@/components/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import { EpisodeList } from '@/components/episode-list'
import { GenreBadges } from '@/components/genre-badges'
import { FavoriteButton } from '@/components/favorite-button'

interface PageProps {
  params: Promise<{ animeId: string }>
}

async function AnimeDetailContent({ animeId }: { animeId: string }) {
  let animeDetail
  
  try {
    animeDetail = await getAnimeDetail(animeId)
  } catch {
    notFound()
  }

  if (!animeDetail) {
    notFound()
  }

  const firstEpisode = animeDetail.episodeList?.[animeDetail.episodeList.length - 1]

  return (
    <>
      {/* Hero Background */}
      <div className="relative h-56 md:h-72">
        <Image
          src={animeDetail.poster}
          alt={animeDetail.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        
        {/* Back button */}
        <Link 
          href="/"
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        {/* Favorite button */}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton 
            animeId={animeId}
            title={animeDetail.title}
            poster={animeDetail.poster}
            status={animeDetail.status}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 -mt-20 pb-24">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="relative w-28 md:w-36 flex-shrink-0">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={animeDetail.poster}
                alt={animeDetail.title}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-16 md:pt-20">
            <h1 className="text-lg md:text-xl font-bold text-foreground line-clamp-2">
              {animeDetail.title}
            </h1>
            
            <div className="w-10 h-1 bg-primary rounded-full mt-2 mb-3" />
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <List className="w-3.5 h-3.5" />
                <span>{animeDetail.episodes || '?'} Episode</span>
              </div>
              <div className="flex items-center gap-1">
                <Tv className="w-3.5 h-3.5" />
                <span>{animeDetail.type || 'TV'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-[10px] font-medium px-2 py-1 rounded ${
                animeDetail.status === 'Ongoing' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {animeDetail.status || 'Unknown'}
              </span>
              
              {animeDetail.score && (
                <span className="text-[10px] font-medium px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {animeDetail.score} (MAL)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Watch Button */}
        {firstEpisode && (
          <Link 
            href={`/watch/${firstEpisode.episodeId}`}
            className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Tonton Episode 1</span>
          </Link>
        )}

        {/* Synopsis */}
        <section className="mt-6">
          <h2 className="text-sm font-bold text-foreground mb-1">SINOPSIS</h2>
          <div className="w-8 h-0.5 bg-primary rounded-full mb-3" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {animeDetail.synopsis?.paragraphs?.length 
              ? animeDetail.synopsis.paragraphs.join('\n\n')
              : 'Sinopsis belum tersedia.'}
          </p>
        </section>

        {/* Info Grid */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          {animeDetail.studios && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
              <Building2 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Studio</p>
                <p className="text-xs font-medium text-foreground">{animeDetail.studios}</p>
              </div>
            </div>
          )}
          {animeDetail.aired && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Tayang</p>
                <p className="text-xs font-medium text-foreground">{animeDetail.aired}</p>
              </div>
            </div>
          )}
          {animeDetail.duration && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Durasi</p>
                <p className="text-xs font-medium text-foreground">{animeDetail.duration}</p>
              </div>
            </div>
          )}
        </section>

        {/* Genres */}
        {animeDetail.genreList && animeDetail.genreList.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-foreground mb-1">GENRE</h2>
            <div className="w-8 h-0.5 bg-primary rounded-full mb-3" />
            <GenreBadges genres={animeDetail.genreList} />
          </section>
        )}

        {/* Episode List */}
        {animeDetail.episodeList && animeDetail.episodeList.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">DAFTAR EPISODE</h2>
              <span className="text-xs text-muted-foreground">{animeDetail.episodeList.length} episode</span>
            </div>
            <div className="w-8 h-0.5 bg-primary rounded-full mb-3" />
            <EpisodeList 
              episodes={animeDetail.episodeList} 
              animeId={animeId}
              animeTitle={animeDetail.title}
              poster={animeDetail.poster}
            />
          </section>
        )}

        {/* Recommendations */}
        {animeDetail.recommendedAnimeList && animeDetail.recommendedAnimeList.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-foreground mb-1">REKOMENDASI</h2>
            <div className="w-8 h-0.5 bg-primary rounded-full mb-3" />
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {animeDetail.recommendedAnimeList.map((anime) => (
                <Link
                  key={anime.animeId}
                  href={`/anime/${anime.animeId}`}
                  className="flex-shrink-0 w-24 group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={anime.poster}
                      alt={anime.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>
                  <h4 className="mt-1.5 text-[10px] font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {anime.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
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

export default async function AnimeDetailPage({ params }: PageProps) {
  const { animeId } = await params
  
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingState />}>
        <AnimeDetailContent animeId={animeId} />
      </Suspense>
      <BottomNav />
    </main>
  )
}
