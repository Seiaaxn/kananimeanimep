'use client'

import { useState } from 'react'
import { Bell, BellOff, Tv, MessageSquare, AtSign, AlertCircle, Loader2 } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

type NotificationType = 'newEpisode' | 'comments' | 'replies' | 'mentions' | 'system'

const notificationTypes: {
  key: NotificationType
  label: string
  description: string
  icon: any
}[] = [
  {
    key: 'newEpisode',
    label: 'Episode Baru',
    description: 'Notifikasi saat ada episode baru dari anime yang kamu favoritkan',
    icon: Tv
  },
  {
    key: 'comments',
    label: 'Komentar',
    description: 'Notifikasi saat ada komentar baru di episode yang kamu tonton',
    icon: MessageSquare
  },
  {
    key: 'replies',
    label: 'Balasan',
    description: 'Notifikasi saat seseorang membalas komentar kamu',
    icon: MessageSquare
  },
  {
    key: 'mentions',
    label: 'Mention',
    description: 'Notifikasi saat seseorang menyebut nama kamu',
    icon: AtSign
  },
  {
    key: 'system',
    label: 'Sistem',
    description: 'Notifikasi penting dari sistem',
    icon: AlertCircle
  }
]

export function NotificationSettings() {
  const {
    hasPermission,
    requestPermission,
    isSupported,
    preferences,
    updatePreferences
  } = useNotification()

  const [loading, setLoading] = useState<NotificationType | null>(null)

  const handleToggle = async (key: NotificationType) => {
    setLoading(key)
    const currentValue = preferences?.[key] ?? true
    await updatePreferences({ [key]: !currentValue })
    setLoading(null)
  }

  const handleEnableNotifications = async () => {
    await requestPermission()
  }

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Browser ini tidak mendukung notifikasi. Silakan gunakan browser modern lainnya.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Permission Status */}
      <div className={cn(
        "p-4 rounded-xl border",
        hasPermission
          ? "bg-green-500/10 border-green-500/20"
          : "bg-amber-500/10 border-amber-500/20"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full",
            hasPermission
              ? "bg-green-500/20"
              : "bg-amber-500/20"
          )}>
            {hasPermission ? (
              <Bell className="w-5 h-5 text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">
              {hasPermission ? 'Notifikasi Aktif' : 'Notifikasi Non-Aktif'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasPermission
                ? 'Kamu akan menerima notifikasi sesuai pengaturanmu'
                : 'Aktifkan notifikasi untuk mendapatkan update terbaru'
              }
            </p>
          </div>
          {!hasPermission && (
            <Button
              onClick={handleEnableNotifications}
              size="sm"
              variant="default"
            >
              Aktifkan
            </Button>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground text-sm">Pengaturan Notifikasi</h3>

        {notificationTypes.map((type) => {
          const Icon = type.icon
          const isEnabled = preferences?.[type.key] ?? true
          const isLoading = loading === type.key

          return (
            <div
              key={type.key}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                "bg-card hover:bg-muted/50"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground text-sm">{type.label}</p>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(type.key)}
                    disabled={isLoading || !hasPermission}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </div>

              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {!hasPermission && (
        <p className="text-xs text-muted-foreground text-center">
          Aktifkan notifikasi terlebih dahulu untuk mengubah pengaturan
        </p>
      )}
    </div>
  )
      }
      
