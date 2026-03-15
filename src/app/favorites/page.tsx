'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { useAuth } from '@/contexts/auth-context'
import { onFavoritesChange, removeFavorite, type FavoriteAnime } from '@/lib/firebase'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // Use setTimeout to defer setState outside effect body
      const timer = setTimeout(() => setLoading(false), 0)
      return () => clearTimeout(timer)
    }

    const unsubscribe = onFavoritesChange(user.uid, (favs) => {
      setFavorites(favs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleRemoveFavorite = async (animeId: string) => {
    if (!user) return
    try {
      await removeFavorite(user.uid, animeId)
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 py-4 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Anime Favorit</h1>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Masuk untuk melihat favorit
            </p>
            <Link 
              href="/auth"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Masuk
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {favorites.map((anime) => (
              <div key={anime.animeId} className="relative group">
                <Link href={`/anime/${anime.animeId}`} className="block">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    {anime.poster ? (
                      <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {anime.title}
                  </h3>
                </Link>
                
                <button
                  onClick={() => handleRemoveFavorite(anime.animeId)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove from favorites"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-1">
              Belum ada anime favorit
            </p>
            <p className="text-sm text-muted-foreground/70 text-center">
              Tambahkan dari halaman detail anime
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
