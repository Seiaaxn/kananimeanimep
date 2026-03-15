'use client'

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { addFavorite, removeFavorite, isFavorited } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  animeId: string
  title: string
  poster: string
  status?: string
}

export function FavoriteButton({ animeId, title, poster, status }: FavoriteButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkFavorite() {
      if (!user) {
        setChecking(false)
        return
      }
      
      try {
        const favorited = await isFavorited(user.uid, animeId)
        setIsFavorite(favorited)
      } catch (error) {
        console.error('Error checking favorite:', error)
      } finally {
        setChecking(false)
      }
    }
    
    checkFavorite()
  }, [user, animeId])

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    setLoading(true)
    try {
      if (isFavorite) {
        await removeFavorite(user.uid, animeId)
        setIsFavorite(false)
      } else {
        await addFavorite(user.uid, {
          animeId,
          title,
          poster,
          status
        })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="p-2 rounded-full bg-black/50">
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        'p-2 rounded-full backdrop-blur-sm transition-colors disabled:opacity-70',
        isFavorite 
          ? 'bg-red-500/80 hover:bg-red-500' 
          : 'bg-black/50 hover:bg-black/70'
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      ) : (
        <Heart 
          className={cn(
            'w-5 h-5',
            isFavorite ? 'text-white fill-white' : 'text-white'
          )} 
        />
      )}
    </button>
  )
}
