'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MessageSquare, Send, Trash2, Loader2, UserCircle, BadgeCheck, Crown, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import {
  onEpisodeCommentsChange,
  addEpisodeComment,
  deleteEpisodeComment,
  getLevelEmoji,
  type EpisodeComment
} from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EpisodeCommentsProps {
  episodeId: string
  animeId: string
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

function getLevelColor(level: number) {
  if (level >= 2000) return 'text-cyan-400'
  if (level >= 1000) return 'text-purple-400'
  if (level >= 500) return 'text-yellow-400'
  if (level >= 100) return 'text-blue-400'
  return 'text-gray-400'
}

export function EpisodeComments({ episodeId, animeId }: EpisodeCommentsProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<EpisodeComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // Load comments in real-time
  useEffect(() => {
    if (!episodeId) return

    setLoading(true)
    setError(null)

    try {
      const unsubscribe = onEpisodeCommentsChange(episodeId, (data) => {
        setComments(data)
        setLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Error loading comments:', err)
      setError('Gagal memuat komentar. Silakan coba lagi nanti.')
      setLoading(false)
    }
  }, [episodeId])

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !newComment.trim() || sending) return

    setSending(true)
    setError(null)
    try {
      await addEpisodeComment(
        episodeId,
        animeId,
        user.uid,
        profile.username || 'User',
        profile.avatar || null,
        newComment.trim(),
        profile.level || 1,
        profile.role || 'user',
        profile.verified || false,
        profile.isPremium || false
      )
      setNewComment('')
    } catch (error) {
      console.error('Error sending comment:', error)
      setError('Gagal mengirim komentar. Silakan coba lagi.')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return

    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    // Check if user is admin or comment owner
    const isAdmin = profile?.role === 'admin'
    const isOwner = comment.userId === user.uid

    if (!isAdmin && !isOwner) {
      setError('Anda tidak memiliki izin untuk menghapus komentar ini')
      return
    }

    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return

    setDeletingId(commentId)
    try {
      await deleteEpisodeComment(episodeId, commentId)
      setError(null)
    } catch (error) {
      console.error('Error deleting comment:', error)
      setError('Gagal menghapus komentar. Silakan coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return ''
    const now = Date.now()
    const diff = now - timestamp

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes} menit lalu`
    if (hours < 24) return `${hours} jam lalu`
    if (days < 7) return `${days} hari lalu`
    return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="px-4 py-6 space-y-4 bg-card/50 rounded-2xl my-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Komentar</h2>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary to-primary/50">
            {profile?.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.username || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {(profile?.username || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar..."
                maxLength={500}
                rows={2}
                disabled={sending}
                className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none pr-12 transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || sending}
                className={cn(
                  "absolute bottom-2 right-2 p-2 rounded-full transition-all",
                  newComment.trim() && !sending
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1.5 text-right">
              {newComment.length}/500
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 bg-muted/30 rounded-2xl border border-border/50">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Masuk</span> untuk berkomentar
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Memuat komentar...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada komentar</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Jadilah yang pertama berkomentar!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && comment.userId === user.uid
            const canDelete = isAdmin || isOwner
            const isAdminComment = comment.role === 'admin'
            const userColor = getUserColor(comment.userId)

            return (
              <div
                key={comment.id}
                className="flex gap-3 p-3 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors group"
              >
                {/* Avatar - Clickable to profile */}
                <Link
                  href={`/user?uid=${comment.userId}`}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden transition-transform hover:scale-105",
                    isAdminComment
                      ? "bg-gradient-to-br from-cyan-400 to-blue-500 ring-2 ring-cyan-400/50"
                      : `bg-gradient-to-br ${userColor.gradient}`
                  )}
                >
                  {comment.avatar ? (
                    <Image
                      src={comment.avatar}
                      alt={comment.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {comment.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </Link>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {/* Username & Meta */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Link
                      href={`/user?uid=${comment.userId}`}
                      className={cn(
                        "text-sm font-semibold hover:underline",
                        isAdminComment ? "text-cyan-400" : userColor.text
                      )}
                    >
                      {comment.username}
                    </Link>
                    {/* Premium Badge */}
                    {comment.isPremium && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                    {/* Verified Badge */}
                    {(comment.verified || comment.role === 'admin') && (
                      <BadgeCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    )}
                    {/* Admin Badge */}
                    {isAdminComment && (
                      <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-medium rounded">
                        Admin
                      </span>
                    )}
                    {/* Level */}
                    <div className="flex items-center gap-1">
                      <span className={cn("text-xs", getLevelColor(comment.level || 1))}>
                        {getLevelEmoji(comment.level || 1)} Lv.{comment.level || 1}
                      </span>
                    </div>
                    {/* Time */}
                    <span className="text-xs text-muted-foreground">
                      • {formatTime(comment.timestamp)}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-foreground break-words leading-relaxed">
                    {comment.message}
                  </p>
                </div>

                {/* Delete Button - Always visible for owner on mobile, visible on hover on desktop */}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deletingId === comment.id}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0 self-start sm:opacity-0 sm:group-hover:opacity-100"
                    title={isOwner ? 'Hapus komentar Anda' : 'Hapus komentar (Admin)'}
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )
          })
        )}

        {/* Scroll anchor */}
        <div ref={commentsEndRef} />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  )
      }
        
