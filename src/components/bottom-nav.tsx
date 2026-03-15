'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Film, MessageCircle, Bookmark, LayoutGrid, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '/genre', icon: Film, label: 'Genre' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/favorites', icon: Bookmark, label: 'Favorit' },
  { href: '/more', icon: LayoutGrid, label: 'Lainnya' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingHref, setLoadingHref] = useState<string | null>(null)

  const handleNavigation = (href: string) => {
    if (pathname === href) return
    setLoadingHref(href)
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <>
      {/* Navigation Loading Overlay */}
      {isPending && loadingHref && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            const isLoading = loadingHref === item.href && isPending

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all',
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
