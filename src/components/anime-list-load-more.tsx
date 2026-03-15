'use client'

import { useState, useCallback } from 'react'
import { AnimeGrid } from '@/components/anime-grid'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { Anime } from '@/lib/types'

interface AnimeListLoadMoreProps {
  initialAnimeList: Anime[]
  initialPage: number
  totalPages: number
  apiEndpoint: string
  showEpisode?: boolean
  showScore?: boolean
  genreId?: string
}

export function AnimeListLoadMore({
  initialAnimeList,
  initialPage,
  totalPages: initialTotalPages,
  apiEndpoint,
  showEpisode = false,
  showScore = false,
  genreId
}: AnimeListLoadMoreProps) {
  const [animeList, setAnimeList] = useState<Anime[]>(initialAnimeList)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || currentPage >= totalPages) return

    setLoading(true)
    setError(null)

    try {
      const nextPage = currentPage + 1
      let url = `${apiEndpoint}?page=${nextPage}`
      if (genreId) {
        url += `&genreId=${genreId}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load more')

      const data = await response.json()
      
      setAnimeList(prev => [...prev, ...(data.animeList || [])])
      setCurrentPage(nextPage)
      
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages)
      }
    } catch (err) {
      setError('Gagal memuat data. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [loading, currentPage, totalPages, apiEndpoint, genreId])

  const hasMore = currentPage < totalPages

  return (
    <div className="space-y-4">
      <AnimeGrid 
        animeList={animeList} 
        showEpisode={showEpisode}
        showScore={showScore}
      />

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="min-w-[200px] gap-2"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4" />
                Memuat...
              </>
            ) : (
              'Muat Lebih Banyak'
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {!hasMore && animeList.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-2">
          Semua anime sudah ditampilkan
        </div>
      )}
    </div>
  )
}
