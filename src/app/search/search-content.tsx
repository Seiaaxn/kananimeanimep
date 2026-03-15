'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, X, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import type { Anime } from '@/lib/types'

export function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    try {
      const res = await fetch(`https://www.sankavollerei.com/anime/search/${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data.data?.animeList || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      handleSearch(query.trim())
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari anime..."
                autoFocus
                className="w-full h-10 pl-10 pr-10 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ditemukan {results.length} hasil untuk &quot;{searchParams.get('q')}&quot;
            </p>
            
            <div className="space-y-2">
              {results.map((anime) => (
                <Link
                  key={anime.animeId}
                  href={`/anime/${anime.animeId}`}
                  className="flex gap-3 p-3 bg-card hover:bg-card/80 rounded-lg transition-colors"
                >
                  <div className="relative w-16 aspect-[3/4] flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={anime.poster}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2">
                      {anime.title}
                    </h3>
                    {anime.score && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs text-muted-foreground">{anime.score}</span>
                      </div>
                    )}
                    {anime.episodes && (
                      <span className="text-xs text-muted-foreground">
                        {anime.episodes} Episode
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Tidak ada hasil ditemukan.</p>
            <p className="text-sm text-muted-foreground/70">Coba kata kunci lain.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Cari anime favorit kamu</p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </main>
  )
}

export function LoadingState() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
        </div>
      </header>
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <BottomNav />
    </main>
  )
      }
