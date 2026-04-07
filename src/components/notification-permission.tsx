'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotificationPermission() {
  const { isSupported, requestPermission, hasPermission, permission } = useNotification()
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show banner after a short delay if:
    // 1. Notifications are supported
    // 2. Permission is not yet granted or denied
    // 3. User hasn't dismissed it
    if (isSupported && permission === 'default' && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000) // Show after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [isSupported, permission, dismissed])

  const handleEnable = async () => {
    setLoading(true)
    const granted = await requestPermission()
    setLoading(false)

    if (granted) {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShow(false)
  }

  if (!isSupported || hasPermission || permission === 'denied' || !show) {
    return null
  }

  return (
    <div className={cn(
      "fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96",
      "bg-card border border-border rounded-xl shadow-2xl p-4",
      "z-40 animate-in slide-in-from-bottom-4 fade-in duration-300"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm mb-1">
            Aktifkan Notifikasi
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dapatkan notifikasi tentang episode baru, balasan komentar, dan update lainnya agar tidak ketinggalan!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleEnable}
          disabled={loading}
          size="sm"
          className="flex-1"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Memproses...
            </>
          ) : (
            <>
              <Check className="w-3 h-3 mr-2" />
              Aktifkan
            </>
          )}
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Nanti Saja
        </Button>
      </div>
    </div>
  )
        }
