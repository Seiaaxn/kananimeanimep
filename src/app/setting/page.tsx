'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Moon, Sun, Bell, BellOff, Info, FileText, Shield, ChevronRight, User, Save, Loader2, Heart, ExternalLink } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { updateUserProfile } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  
  // Theme state
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  
  // Edit name state
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Initialize settings from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedNotifications = localStorage.getItem('notifications')
    
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true'
      setDarkMode(isDark)
      applyTheme(isDark)
    } else {
      // Default to dark mode
      applyTheme(true)
    }
    
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === 'true')
    }
  }, [])

  // Set initial name from profile
  useEffect(() => {
    if (profile?.username) {
      setNewName(profile.username)
    }
  }, [profile])

  const applyTheme = (isDark: boolean) => {
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
      root.style.setProperty('--background', '#0a0a0a')
      root.style.setProperty('--foreground', '#ffffff')
      root.style.setProperty('--card', '#141414')
      root.style.setProperty('--card-foreground', '#ffffff')
      document.body.style.backgroundColor = '#0a0a0a'
      document.body.style.color = '#ffffff'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.style.setProperty('--background', '#ffffff')
      root.style.setProperty('--foreground', '#0a0a0a')
      root.style.setProperty('--card', '#f5f5f5')
      root.style.setProperty('--card-foreground', '#0a0a0a')
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#0a0a0a'
    }
  }

  const toggleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem('darkMode', String(newValue))
    applyTheme(newValue)
    toast.success(newValue ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan')
  }

  const toggleNotifications = () => {
    const newValue = !notifications
    
    if (newValue) {
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            setNotifications(true)
            localStorage.setItem('notifications', 'true')
            toast.success('Notifikasi diaktifkan')
            
            // Show test notification
            new Notification('KANANIMEID', {
              body: 'Notifikasi berhasil diaktifkan!',
              icon: '/logo-icon.jpg'
            })
          } else {
            toast.error('Izin notifikasi ditolak')
          }
        })
      } else {
        toast.error('Browser tidak mendukung notifikasi')
      }
    } else {
      setNotifications(false)
      localStorage.setItem('notifications', 'false')
      toast.success('Notifikasi dimatikan')
    }
  }

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return
    
    setSavingName(true)
    try {
      await updateUserProfile(user.uid, { username: newName.trim() })
      await refreshProfile()
      setEditingName(false)
      toast.success('Nama berhasil diubah')
    } catch (error) {
      console.error('Error updating name:', error)
      toast.error('Gagal mengubah nama')
    } finally {
      setSavingName(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Pengaturan</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Account Section - Only for logged in users */}
        {user && profile && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
              Akun
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
              {/* Change Name */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">Ubah Nama</h3>
                    <p className="text-xs text-muted-foreground">Ubah nama tampilan kamu</p>
                  </div>
                </div>
                
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Masukkan nama baru"
                      className="flex-1 bg-muted border-border"
                      maxLength={30}
                    />
                    <Button
                      onClick={handleSaveName}
                      disabled={savingName || !newName.trim()}
                      size="icon"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {savingName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingName(false)
                        setNewName(profile.username || '')
                      }}
                      variant="outline"
                      size="icon"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingName(true)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm text-foreground">{profile.username || 'Belum ada nama'}</span>
                    <span className="text-xs text-muted-foreground ml-2">Tap untuk mengubah</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appearance Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Tampilan
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "p-2.5 rounded-xl",
                darkMode ? "bg-primary/10" : "bg-muted"
              )}>
                {darkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-sm font-medium text-foreground">Mode Gelap</h3>
                <p className="text-xs text-muted-foreground">
                  {darkMode ? 'Mode gelap aktif (hitam)' : 'Mode terang aktif (putih)'}
                </p>
              </div>
              
              <div className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                darkMode ? "bg-primary" : "bg-muted-foreground/30"
              )}>
                <div className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                  darkMode ? "translate-x-6" : "translate-x-1"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Notifikasi
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            <button
              onClick={toggleNotifications}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "p-2.5 rounded-xl",
                notifications ? "bg-primary/10" : "bg-muted"
              )}>
                {notifications ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-sm font-medium text-foreground">Notifikasi</h3>
                <p className="text-xs text-muted-foreground">
                  {notifications ? 'Notifikasi aktif - menerima push notification' : 'Notifikasi dimatikan'}
                </p>
              </div>
              
              <div className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                notifications ? "bg-primary" : "bg-muted-foreground/30"
              )}>
                <div className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                  notifications ? "translate-x-6" : "translate-x-1"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Other Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Lainnya
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            <a
              href="https://saweria.co/kananimeid"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-pink-500/10">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">Donasi</h3>
                <p className="text-xs text-muted-foreground">Dukung pengembangan KANANIMEID</p>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </a>
            
            <Link
              href="/about"
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-muted">
                <Info className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">Tentang</h3>
                <p className="text-xs text-muted-foreground">Tentang aplikasi</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            
            <Link
              href="/tos"
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-muted">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">Syarat & Ketentuan</h3>
                <p className="text-xs text-muted-foreground">Baca syarat dan ketentuan</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            
            <Link
              href="/dmca"
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-muted">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">DMCA Policy</h3>
                <p className="text-xs text-muted-foreground">Kebijakan hak cipta</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">KANANIMEID v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">© 2024 KANANIMEID. All rights reserved.</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
