'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Send, ImagePlus, Trash2, Loader2, BadgeCheck, UserCircle, X } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAuth } from '@/contexts/auth-context'
import { 
  sendChatMessage, 
  onChatMessages, 
  clearAllChat,
  deleteChatMessage,
  type ChatMessage 
} from '@/lib/firebase'
import { cn } from '@/lib/utils'

function formatTime(timestamp: number) {
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
  } else {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }
}

function getLevelColor(level: number) {
  if (level >= 2000) return 'text-cyan-400'
  if (level >= 1000) return 'text-purple-400'
  if (level >= 500) return 'text-yellow-400'
  if (level >= 100) return 'text-blue-400'
  return 'text-gray-400'
}

// Generate unique color for each user based on their userId
function getUserColor(userId: string): { bg: string; text: string; border: string; gradient: string } {
  const colors = [
    { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', gradient: 'from-rose-400 to-pink-500' },
    { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', gradient: 'from-orange-400 to-amber-500' },
    { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-400 to-yellow-500' },
    { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30', gradient: 'from-lime-400 to-green-500' },
    { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-400 to-teal-500' },
    { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30', gradient: 'from-teal-400 to-cyan-500' },
    { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30', gradient: 'from-sky-400 to-blue-500' },
    { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', gradient: 'from-violet-400 to-purple-500' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', gradient: 'from-fuchsia-400 to-pink-500' },
    { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', gradient: 'from-pink-400 to-rose-500' },
  ]
  
  // Simple hash function to get consistent color for each user
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function UserBadge({ role, verified }: { role?: 'user' | 'admin', verified?: boolean }) {
  // Admin or verified users get verified badge
  if (role === 'admin' || verified) {
    return (
      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <BadgeCheck className="w-3.5 h-3.5 text-white" />
      </div>
    )
  }
  // Regular members get member badge
  return (
    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
      <UserCircle className="w-3.5 h-3.5 text-white" />
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [uploadingSticker, setUploadingSticker] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stickerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubscribe = onChatMessages((msgs) => {
      setMessages(msgs)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNavigation = (href: string) => {
    setNavigatingTo(href)
    startTransition(() => {
      router.push(href)
    })
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !profile || sending) return

    setSending(true)
    try {
      await sendChatMessage(
        user.uid,
        profile.username,
        profile.avatar,
        newMessage.trim(),
        profile.level || 1,
        profile.role || 'user',
        profile.verified || profile.role === 'admin'
      )
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Gagal mengirim pesan')
    } finally {
      setSending(false)
    }
  }

  const handleSendSticker = async (stickerUrl: string) => {
    if (!user || !profile || sending) return

    setSending(true)
    try {
      await sendChatMessage(
        user.uid,
        profile.username,
        profile.avatar,
        `[sticker]${stickerUrl}`,
        profile.level || 1,
        profile.role || 'user',
        profile.verified || profile.role === 'admin'
      )
      setPreviewImage(null)
    } catch (error) {
      console.error('Error sending sticker:', error)
      alert('Gagal mengirim sticker')
    } finally {
      setSending(false)
    }
  }

  const handleStickerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Show preview first
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadAndSend = async () => {
    if (!previewImage || !user) return
    
    setUploadingSticker(true)
    try {
      // Convert base64 to file
      const response = await fetch(previewImage)
      const blob = await response.blob()
      const file = new File([blob], `sticker_${Date.now()}.png`, { type: 'image/png' })
      
      // Upload via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.uid)
      formData.append('type', 'sticker')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await uploadResponse.json()
      await handleSendSticker(data.url)
    } catch (error) {
      console.error('Error uploading sticker:', error)
      alert('Gagal mengupload sticker')
    } finally {
      setUploadingSticker(false)
    }
  }

  const handleClearChat = async () => {
    if (!profile?.role || profile.role !== 'admin') return
    if (!confirm('Yakin ingin menghapus semua pesan?')) return

    setClearing(true)
    try {
      await clearAllChat()
    } catch (error) {
      console.error('Error clearing chat:', error)
      alert('Gagal menghapus chat')
    } finally {
      setClearing(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!profile?.role || profile.role !== 'admin') return
    
    try {
      await deleteChatMessage(messageId)
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Gagal menghapus pesan')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isStickerMessage = (msg: string) => msg.startsWith('[sticker]')
  const getStickerUrl = (msg: string) => msg.replace('[sticker]', '')

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Navigation Loading Overlay */}
      {isPending && navigatingTo && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        </div>
      )}

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
            <div>
              <h1 className="text-lg font-bold text-foreground">Obrolan Global</h1>
              <p className="text-xs text-muted-foreground">{messages.length} pesan</p>
            </div>
          </div>

          {profile?.role === 'admin' && (
            <button
              onClick={handleClearChat}
              disabled={clearing}
              className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
              title="Hapus semua chat"
            >
              {clearing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Belum ada pesan</p>
            <p className="text-sm">Mulai obrolan sekarang!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.role === 'admin'
            const isVerified = msg.verified || isAdmin
            const isSticker = isStickerMessage(msg.message)
            const userColor = getUserColor(msg.userId)
            
            return (
              <div key={msg.id} className="flex items-start gap-3 group">
                {/* Avatar - Clickable with loading */}
                <button 
                  onClick={() => handleNavigation(`/user?uid=${msg.userId}`)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer transition-transform hover:scale-105",
                    isAdmin 
                      ? "bg-gradient-to-br from-cyan-400 to-blue-500 ring-2 ring-cyan-400/50" 
                      : `bg-gradient-to-br ${userColor.gradient}`
                  )}
                >
                  {msg.avatar ? (
                    <Image
                      src={msg.avatar}
                      alt={msg.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {msg.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={() => handleNavigation(`/user?uid=${msg.userId}`)}
                      className={cn(
                        "font-semibold hover:underline text-left",
                        isAdmin ? "text-cyan-400" : userColor.text
                      )}
                    >
                      {msg.username}
                    </button>
                    <UserBadge role={msg.role} verified={msg.verified} />
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-medium rounded">
                        Admin
                      </span>
                    )}
                    <span className={cn('text-xs', getLevelColor(msg.level))}>
                      Lv.{msg.level}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "mt-1 p-3 rounded-lg inline-block max-w-[85%] relative",
                    isSticker ? "bg-transparent p-1" :
                    isAdmin 
                      ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-tl-none" 
                      : `${userColor.bg} border ${userColor.border} rounded-tl-none`
                  )}>
                    {isSticker ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={getStickerUrl(msg.message)}
                          alt="Sticker"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-foreground break-words whitespace-pre-wrap">{msg.message}</p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {/* Delete button for admin - appears on hover */}
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute -right-2 -top-2 p-1.5 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                        title="Hapus pesan"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticker Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-4 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Kirim Sticker?</h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden mb-4">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewImage(null)}
                className="flex-1 py-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUploadAndSend}
                disabled={uploadingSticker}
                className="flex-1 py-2 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground font-medium transition-colors flex items-center justify-center gap-2"
              >
                {uploadingSticker ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-3">
        {user && profile ? (
          <div className="flex items-center gap-2">
            <input
              ref={stickerInputRef}
              type="file"
              accept="image/*"
              onChange={handleStickerSelect}
              className="hidden"
            />
            <button 
              onClick={() => stickerInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Kirim Sticker/Gambar"
            >
              <ImagePlus className="w-5 h-5 text-primary" />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan..."
              disabled={sending}
              className="flex-1 h-10 px-4 bg-muted rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="p-2.5 bg-primary hover:bg-primary/90 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
              ) : (
                <Send className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleNavigation('/auth')}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors text-center"
          >
            Masuk untuk mengirim pesan
          </button>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
