'use client'

import { useState, useSyncExternalStore, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Bell, BellOff, User, BadgeCheck, UserCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

// Helper functions for notification state
function getNotificationSnapshot() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('notifications') === 'true'
}

function getNewAnimeSnapshot() {
  if (typeof window === 'undefined') return false
  const lastVisit = localStorage.getItem('lastVisit')
  if (!lastVisit) return true
  const timeDiff = Date.now() - parseInt(lastVisit)
  return timeDiff > 3600000
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function Header() {
  const router = useRouter()
  const { profile, loading } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  
  // Use sync external store for localStorage values
  const notificationsEnabled = useSyncExternalStore(
    subscribeToStorage,
    getNotificationSnapshot,
    () => false // Server snapshot
  )
  
  const hasNewAnime = useSyncExternalStore(
    subscribeToStorage,
    getNewAnimeSnapshot,
    () => false // Server snapshot
  )

  // Check if user is admin or verified (for verified badge)
  const isVerified = profile?.role === 'admin' || profile?.verified
  // Regular member shows member badge
  const isMember = profile && !isVerified

  const handleNavigation = (href: string) => {
    setNavigatingTo(href)
    startTransition(() => {
      router.push(href)
    })
  }

  const handleNotificationClick = () => {
    if (notificationsEnabled) {
      // Navigate to notification settings
      handleNavigation('/settings')
    } else {
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            localStorage.setItem('notifications', 'true')
            window.dispatchEvent(new Event('storage')) // Trigger re-render
            
            // Show test notification
            new Notification('KANANIMEID', {
              body: 'Notifikasi berhasil diaktifkan! Kamu akan mendapat notifikasi anime terbaru.',
              icon: '/logo-icon.jpg',
              badge: '/logo-icon.jpg',
              tag: 'notification-enabled'
            })
          } else {
            alert('Izin notifikasi ditolak. Kamu bisa mengaktifkannya di pengaturan browser.')
          }
        })
      } else {
        alert('Browser kamu tidak mendukung notifikasi push.')
      }
    }
  }

  return (
    <>
      {/* Navigation Loading Overlay */}
      {isPending && navigatingTo && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold">
              <span className="text-primary">KANAN</span>
              <span className="text-foreground">IMEID</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavigation('/search')}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
            
            <button 
              onClick={handleNotificationClick}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Notifications"
            >
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-foreground" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              
              {/* New anime indicator */}
              {hasNewAnime && notificationsEnabled && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </button>
            
            <button 
              onClick={() => handleNavigation(profile ? '/profile' : '/auth')}
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors"
              aria-label="Profile"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                  <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                </div>
              ) : profile ? (
                <>
                  {profile.avatar ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary/50">
                      <Image
                        src={profile.avatar}
                        alt={profile.username || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {(profile.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-foreground max-w-[80px] truncate">
                      {profile.username || 'User'}
                    </span>
                    {/* Verified badge for admin/verified users */}
                    {isVerified && (
                      <BadgeCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    )}
                    {/* Member badge for regular users */}
                    {isMember && (
                      <UserCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-muted-foreground">Masuk</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
