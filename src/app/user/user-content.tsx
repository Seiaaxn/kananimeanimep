'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Crown, UserCircle, Film, Heart, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAuth } from '@/contexts/auth-context'
import { 
  getUserProfile, 
  onFavoritesChange, 
  type UserProfile, 
  type FavoriteAnime
} from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

function getLevelColor(level: number) {
  if (level >= 2000) return { text: 'text-cyan-400', bg: 'bg-cyan-400' }
  if (level >= 1000) return { text: 'text-purple-400', bg: 'bg-purple-400' }
  if (level >= 500) return { text: 'text-yellow-400', bg: 'bg-yellow-400' }
  if (level >= 100) return { text: 'text-blue-400', bg: 'bg-blue-400' }
  return { text: 'text-gray-400', bg: 'bg-gray-400' }
}

function getRankTitle(level: number) {
  if (level >= 2000) return { title: 'Legend', icon: '👑' }
  if (level >= 1000) return { title: 'Master', icon: '⭐' }
  if (level >= 500) return { title: 'Expert', icon: '🔥' }
  if (level >= 100) return { title: 'Pro', icon: '💎' }
  if (level >= 50) return { title: 'Member', icon: '🌟' }
  return { title: 'Newbie', icon: '🌱' }
}

export function UserContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([])
  const [loading, setLoading] = useState(true)
  
  const targetUid = searchParams.get('uid')

  useEffect(() => {
    async function fetchUserProfile() {
      if (!targetUid) {
        setLoading(false)
        return
      }

      try {
        const profile = await getUserProfile(targetUid)
        setUserProfile(profile as UserProfile)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [targetUid])

  useEffect(() => {
    if (!targetUid) return
    const unsubscribe = onFavoritesChange(targetUid, setFavorites)
    return () => unsubscribe()
  }, [targetUid])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!userProfile) {
    return (
      <main className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center h-14 px-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-2">Profil Pengguna</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <UserCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Pengguna tidak ditemukan</p>
        </div>
        <BottomNav />
      </main>
    )
  }

  const levelColors = getLevelColor(userProfile.level || 1)
  const rank = getRankTitle(userProfile.level || 1)
  const expProgress = ((userProfile.exp || 0) % 100)
  const isAdmin = userProfile.role === 'admin'
  const isOwnProfile = user?.uid === targetUid

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center h-14 px-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-2">Profil Pengguna</h1>
        </div>
      </header>

      <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10">
        {userProfile.banner && (
          <Image
            src={userProfile.banner}
            alt="Banner"
            fill
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative px-4 -mt-12 sm:-mt-14">
        <div className={cn(
          "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-background",
          isAdmin && "ring-2 ring-cyan-400/50"
        )}>
          {userProfile.avatar ? (
            <Image
              src={userProfile.avatar}
              alt={userProfile.username}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center text-3xl font-bold text-white",
              isAdmin 
                ? "bg-gradient-to-br from-cyan-400 to-blue-500" 
                : "bg-gradient-to-br from-primary to-primary/70"
            )}>
              {userProfile.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {userProfile.username}
            </h2>
            {isAdmin && (
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded flex items-center gap-1">
                <Crown className="w-3 h-3" /> Admin
              </span>
            )}
            {userProfile.tag && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-medium rounded text-white",
                userProfile.tagColor || 'bg-primary'
              )}>
                {userProfile.tag}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
              levelColors.bg, "bg-opacity-20", levelColors.text
            )}>
              <span>{rank.icon}</span>
              <span>{rank.title}</span>
            </div>
            <div className={cn("text-sm font-medium", levelColors.text)}>
              Lv. {userProfile.level || 1}
            </div>
          </div>
        </div>

        {userProfile.bio && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{userProfile.bio}</p>
          </div>
        )}

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">EXP</span>
            <span className="font-medium text-foreground">{userProfile.exp || 0} / {(userProfile.level || 1) * 100}</span>
          </div>
          <Progress value={expProgress} className="h-2" />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Anime Favorit
          </h3>
          
          {favorites.length === 0 ? (
            <div className="bg-card rounded-xl p-6 text-center border border-border/50">
              <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground">Belum ada anime favorit</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {favorites.slice(0, 12).map((item, index) => (
                <Link
                  key={`${item.animeId}-${index}`}
                  href={`/anime/${item.animeId}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    {item.poster && item.poster.trim() !== '' ? (
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Film className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {isOwnProfile && (
          <div className="mt-4 mb-6">
            <Link
              href="/profile"
              className="block w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-center transition-colors"
            >
              Edit Profil
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

export function LoadingState() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </main>
  )
    }
