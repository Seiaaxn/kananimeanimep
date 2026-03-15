'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Trash2, Play, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAuth } from '@/contexts/auth-context'
import { onHistoryChange, clearHistory, type HistoryItem } from '@/lib/firebase'

function formatDate(timestamp: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return 'baru saja'
    return `${diffMins} menit lalu`
  } else if (diffHours < 24) {
    return `${diffHours} jam lalu`
  } else if (diffHours < 48) {
    return 'Kemarin'
  } else {
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const unsubscribe = onHistoryChange(user.uid, (hist) => {
      setHistory(hist)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const clearAllHistory = async () => {
    if (!user) return
    if (!confirm('Yakin ingin menghapus semua riwayat?')) return
    
    setClearing(true)
    try {
      await clearHistory(user.uid)
    } catch (error) {
      console.error('Error clearing history:', error)
    } finally {
      setClearing(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Riwayat Tonton</h1>
            </div>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              disabled={clearing}
              className="text-xs text-destructive hover:underline disabled:opacity-50"
            >
              {clearing ? 'Menghapus...' : 'Hapus Semua'}
            </button>
          )}
        </div>
      </header>

      <div className="px-4 py-4">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Masuk untuk melihat riwayat
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
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div 
                key={`${item.episodeId}-${index}`}
                className="flex items-center gap-3 p-3 bg-card rounded-lg group"
              >
                <Link 
                  href={`/watch/${item.episodeId}`}
                  className="flex-1 flex items-center gap-3"
                >
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.animeTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.animeTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.episodeTitle || `Episode ${item.episodeNumber}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {formatDate(item.watchedAt || 0)}
                    </p>
                  </div>
                </Link>
                
                <Link href={`/watch/${item.episodeId}`}>
                  <Play className="w-5 h-5 text-primary" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-1">
              Belum ada riwayat tonton
            </p>
            <p className="text-sm text-muted-foreground/70 text-center">
              Tonton anime untuk melihat riwayat di sini
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
