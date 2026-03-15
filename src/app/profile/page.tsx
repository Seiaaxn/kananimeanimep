'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Camera, Eye, MessageSquare, Heart, Settings, LogOut, ImageIcon, Loader2, Shield, Users, UserCircle, X, Check, ChevronRight, BadgeCheck, Trash2, Edit3, Save } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAuth } from '@/contexts/auth-context'
import { 
  logOut, 
  updateUserProfile,
  getHistory,
  getFavorites,
  getAllUsers,
  updateUserLevel,
  updateUserTag,
  setUserVerified,
  deleteUser,
  onHistoryChange,
  onFavoritesChange,
  onUserCommentsChange,
  type HistoryItem,
  type FavoriteAnime,
  type UserProfile,
  type CommentItem
} from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type Tab = 'history' | 'comments'

const levelRanks = [
  { min: 1, max: 10, name: 'Newbie', color: 'text-gray-400' },
  { min: 11, max: 50, name: 'Otaku', color: 'text-green-400' },
  { min: 51, max: 100, name: 'Weeb', color: 'text-blue-400' },
  { min: 101, max: 500, name: 'Senpai', color: 'text-purple-400' },
  { min: 501, max: 1000, name: 'Master', color: 'text-yellow-400' },
  { min: 1001, max: 5000, name: 'Great Sage', color: 'text-cyan-400' },
  { min: 5001, max: Infinity, name: 'Legend', color: 'text-red-400' },
]

const tagColors = [
  { value: 'bg-red-500', label: 'Merah', color: 'bg-red-500' },
  { value: 'bg-orange-500', label: 'Oranye', color: 'bg-orange-500' },
  { value: 'bg-yellow-500', label: 'Kuning', color: 'bg-yellow-500' },
  { value: 'bg-green-500', label: 'Hijau', color: 'bg-green-500' },
  { value: 'bg-teal-500', label: 'Teal', color: 'bg-teal-500' },
  { value: 'bg-cyan-500', label: 'Cyan', color: 'bg-cyan-500' },
  { value: 'bg-blue-500', label: 'Biru', color: 'bg-blue-500' },
  { value: 'bg-purple-500', label: 'Ungu', color: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Pink', color: 'bg-pink-500' },
  { value: 'bg-gray-500', label: 'Abu', color: 'bg-gray-500' },
]

function getRank(level: number) {
  return levelRanks.find(r => level >= r.min && level <= r.max) || levelRanks[0]
}

function getExpForLevel(level: number) {
  return level * 100
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile, updateProfileState } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('history')
  const [watchHistory, setWatchHistory] = useState<HistoryItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([])
  const [comments, setComments] = useState<CommentItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [customTag, setCustomTag] = useState('')
  const [tagColor, setTagColor] = useState('bg-purple-500')
  const [editingTag, setEditingTag] = useState(false)
  const [savingTag, setSavingTag] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  
  // Admin states
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editLevel, setEditLevel] = useState('')
  const [editExp, setEditExp] = useState('')
  const [editTag, setEditTag] = useState('')
  const [editTagColor, setEditTagColor] = useState('bg-purple-500')
  const [editVerified, setEditVerified] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize bio and tag from profile
  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio)
    }
    if (profile?.tag) {
      setCustomTag(profile.tag)
    }
    if (profile?.tagColor) {
      setTagColor(profile.tagColor)
    }
  }, [profile?.bio, profile?.tag, profile?.tagColor])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Real-time history updates
  useEffect(() => {
    if (!user) return
    const unsubscribe = onHistoryChange(user.uid, setWatchHistory)
    return () => unsubscribe()
  }, [user])

  // Real-time favorites updates
  useEffect(() => {
    if (!user) return
    const unsubscribe = onFavoritesChange(user.uid, setFavorites)
    return () => unsubscribe()
  }, [user])

  // Real-time comments updates
  useEffect(() => {
    if (!user) return
    const unsubscribe = onUserCommentsChange(user.uid, setComments)
    return () => unsubscribe()
  }, [user])

  const loadAllUsers = async () => {
    if (profile?.role !== 'admin') return
    setLoadingUsers(true)
    try {
      const users = await getAllUsers()
      setAllUsers(users)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleOpenAdminPanel = () => {
    setShowAdminPanel(true)
    loadAllUsers()
  }

  const handleSelectUser = (userProfile: UserProfile) => {
    setSelectedUser(userProfile)
    setEditLevel(userProfile.level?.toString() || '1')
    setEditExp(userProfile.exp?.toString() || '0')
    setEditTag(userProfile.tag || '')
    setEditTagColor(userProfile.tagColor || 'bg-purple-500')
    setEditVerified(userProfile.verified || false)
  }

  const handleSaveUserChanges = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const newLevel = parseInt(editLevel) || 1
      const newExp = parseInt(editExp) || 0
      
      await updateUserLevel(selectedUser.uid, newLevel, newExp)
      if (editTag !== selectedUser.tag || editTagColor !== selectedUser.tagColor) {
        await updateUserTag(selectedUser.uid, editTag, editTagColor)
      }
      if (editVerified !== selectedUser.verified) {
        await setUserVerified(selectedUser.uid, editVerified)
      }
      
      // Update local state
      setAllUsers(prev => prev.map(u => 
        u.uid === selectedUser.uid 
          ? { ...u, level: newLevel, exp: newExp, tag: editTag, tagColor: editTagColor, verified: editVerified }
          : u
      ))
      
      setSelectedUser(null)
      alert('User berhasil diupdate!')
    } catch (error) {
      console.error('Error saving user changes:', error)
      alert('Gagal mengupdate user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    setDeletingUser(true)
    try {
      await deleteUser(selectedUser.uid)
      
      // Update local state
      setAllUsers(prev => prev.filter(u => u.uid !== selectedUser.uid))
      
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      alert('User berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Gagal menghapus user')
    } finally {
      setDeletingUser(false)
    }
  }

  // Upload file via API
  const uploadFile = async (file: File, type: 'avatar' | 'banner'): Promise<string> => {
    // Get Firebase ID token for authentication
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth()
    const idToken = await auth.currentUser?.getIdToken()
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user!.uid)
    formData.append('type', type)
    formData.append('idToken', idToken || '')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !profile) return

    setUploading(true)
    try {
      console.log('Uploading avatar...')
      const avatarUrl = await uploadFile(file, 'avatar')
      console.log('Avatar URL:', avatarUrl)
      await updateUserProfile(user.uid, { avatar: avatarUrl })
      // Update local state immediately for instant feedback
      updateProfileState({ avatar: avatarUrl })
      console.log('Avatar updated successfully')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Gagal mengupload foto profil: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !profile) return

    setUploadingBanner(true)
    try {
      console.log('Uploading banner...')
      const bannerUrl = await uploadFile(file, 'banner')
      console.log('Banner URL:', bannerUrl)
      await updateUserProfile(user.uid, { banner: bannerUrl })
      // Update local state immediately for instant feedback
      updateProfileState({ banner: bannerUrl })
      console.log('Banner updated successfully')
    } catch (error) {
      console.error('Error uploading banner:', error)
      alert('Gagal mengupload banner: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploadingBanner(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleSaveBio = async () => {
    if (!user || !profile) return
    
    setSavingBio(true)
    try {
      await updateUserProfile(user.uid, { bio: bio.trim() })
      updateProfileState({ bio: bio.trim() })
      setEditingBio(false)
    } catch (error) {
      console.error('Error saving bio:', error)
      alert('Gagal menyimpan bio')
    } finally {
      setSavingBio(false)
    }
  }

  const handleSaveTag = async () => {
    if (!user || !profile) return
    
    setSavingTag(true)
    try {
      const tagData = {
        tag: customTag.trim() || null,
        tagColor: customTag.trim() ? tagColor : null
      }
      await updateUserProfile(user.uid, tagData)
      updateProfileState(tagData)
      setEditingTag(false)
    } catch (error) {
      console.error('Error saving tag:', error)
      alert('Gagal menyimpan tag')
    } finally {
      setSavingTag(false)
    }
  }

  const handleLogout = async () => {
    await logOut()
    router.push('/auth')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const rank = getRank(profile.level || 1)
  const expForNextLevel = getExpForLevel(profile.level || 1)
  const expProgress = ((profile.exp || 0) / expForNextLevel) * 100
  
  // Check user status
  const isAdmin = profile.role === 'admin'
  const isVerified = profile.verified || isAdmin
  const isMember = !isVerified

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
            <h1 className="text-lg font-bold text-foreground">Profil</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleOpenAdminPanel}
                className="p-2 rounded-full hover:bg-muted transition-colors text-cyan-400"
                title="Admin Panel"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}
            <Link href="/settings" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Settings className="w-5 h-5 text-foreground" />
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 group">
        {profile.banner && (
          <Image
            src={profile.banner}
            alt="Banner"
            fill
            className="object-cover"
          />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <button 
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 p-3 bg-black/50 rounded-xl hover:bg-black/70"
          >
            {uploadingBanner ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white" />
            )}
            <span className="text-xs text-white font-medium">
              {profile.banner ? 'Ganti Banner' : 'Upload Banner'}
            </span>
          </button>
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className="hidden"
        />
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden border-4 border-background">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary-foreground">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button 
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
              ) : (
                <Camera className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{profile.username}</h2>
              
              {/* Verified Badge - only for admin/verified users */}
              {isVerified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 rounded-full">
                  <BadgeCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium">Verified</span>
                </div>
              )}
              
              {/* Member Badge - for regular users */}
              {isMember && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                  <UserCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Member</span>
                </div>
              )}
              
              {/* Role Badge */}
              {isAdmin && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                  Admin
                </span>
              )}
              
              {/* Custom Tag */}
              {profile.tag && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded text-white",
                  profile.tagColor || 'bg-purple-500'
                )}>
                  {profile.tag}
                </span>
              )}
            </div>
            
            <div className={cn('text-sm font-medium mt-0.5', rank.color)}>
              {rank.name}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4">
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tulis bio kamu..."
                maxLength={150}
                rows={3}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{bio.length}/150</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBio(false)
                      setBio(profile.bio || '')
                    }}
                    className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {savingBio ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setEditingBio(true)}
              className="group cursor-pointer"
            >
              {profile.bio ? (
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic group-hover:text-muted-foreground transition-colors flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Tambah bio...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Custom Tag Section */}
        <div className="mt-4">
          {editingTag ? (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tag Custom</label>
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Contoh: carbit, pro player, dll..."
                  maxLength={20}
                  className="bg-background border-border"
                />
                <span className="text-xs text-muted-foreground mt-1 block">{customTag.length}/20 karakter</span>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Warna Tag</label>
                <div className="flex flex-wrap gap-2">
                  {tagColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setTagColor(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        color.value,
                        tagColor === color.value ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "hover:scale-105"
                      )}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              
              {customTag.trim() && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Preview:</span>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded text-white",
                    tagColor
                  )}>
                    {customTag}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingTag(false)
                    setCustomTag(profile.tag || '')
                    setTagColor(profile.tagColor || 'bg-purple-500')
                  }}
                  className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveTag}
                  disabled={savingTag}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {savingTag ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Simpan
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setEditingTag(true)}
              className="group cursor-pointer flex items-center gap-2"
            >
              {profile.tag ? (
                <>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded text-white group-hover:opacity-80 transition-opacity",
                    profile.tagColor || 'bg-purple-500'
                  )}>
                    {profile.tag}
                  </span>
                  <Edit3 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic group-hover:text-muted-foreground transition-colors flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Tambah tag custom...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground">Level {profile.level || 1}</span>
            <span className="text-muted-foreground">{profile.exp || 0} / {expForNextLevel} EXP</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
              style={{ width: `${Math.min(expProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats - Real-time updates */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-amber-400 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Tontonan</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{watchHistory.length}</span>
          </div>
          
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-blue-400 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Komentar</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{comments.length}</span>
          </div>
          
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Favorit</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{favorites.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'history'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Riwayat Tonton ({watchHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={cn(
              'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'comments'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Riwayat Komentar
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'history' ? (
          watchHistory.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {watchHistory.slice(0, 12).map((item, index) => (
                <Link
                  key={`${item.episodeId}-${index}`}
                  href={`/watch/${item.episodeId}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.animeTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.episodeTitle || `Episode ${item.episodeNumber}`}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Eye className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Belum ada riwayat tonton</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Belum ada komentar</p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>

      <BottomNav />

      {/* Admin Panel Dialog */}
      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5 text-cyan-400" />
              Admin Panel
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Kelola user, level, tag, dan verifikasi
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Daftar User ({allUsers.length})</span>
            </div>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allUsers.map((userProfile) => (
                  <button
                    key={userProfile.uid}
                    onClick={() => handleSelectUser(userProfile)}
                    className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {userProfile.avatar ? (
                        <Image
                          src={userProfile.avatar}
                          alt={userProfile.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary-foreground">
                          {userProfile.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">{userProfile.username}</span>
                        {/* Verified badge for admin/verified */}
                        {(userProfile.verified || userProfile.role === 'admin') ? (
                          <BadgeCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        ) : (
                          <UserCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                        {userProfile.role === 'admin' && (
                          <Badge variant="destructive" className="text-xs">Admin</Badge>
                        )}
                        {userProfile.tag && (
                          <Badge variant="outline" className="text-xs">{userProfile.tag}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lv.{userProfile.level} • {userProfile.email || 'No email'}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              Edit User
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/50 to-primary/30 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar ? (
                    <Image
                      src={selectedUser.avatar}
                      alt={selectedUser.username}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary-foreground">
                      {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-foreground">{selectedUser.username}</div>
                  <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Level</label>
                  <Input
                    type="number"
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">EXP</label>
                  <Input
                    type="number"
                    value={editExp}
                    onChange={(e) => setEditExp(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tag</label>
                <Input
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  placeholder="Custom tag..."
                  maxLength={20}
                  className="bg-muted border-border"
                />
              </div>
              
              {editTag.trim() && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Warna Tag</label>
                  <div className="flex flex-wrap gap-2">
                    {tagColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditTagColor(color.value)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          color.value,
                          editTagColor === color.value ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "hover:scale-105"
                        )}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Preview:</span>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded text-white",
                      editTagColor
                    )}>
                      {editTag}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-foreground">Verified</span>
                </div>
                <button
                  onClick={() => setEditVerified(!editVerified)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    editVerified ? "bg-cyan-500" : "bg-muted-foreground/30"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    editVerified ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
              
              {/* Delete User Button - Only show if not own account */}
              {selectedUser.uid !== user?.uid && (
                <div className="pt-2">
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                    disabled={saving || deletingUser}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus User
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1"
                  disabled={saving || deletingUser}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveUserChanges}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={saving || deletingUser}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-destructive">Hapus User?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Apakah kamu yakin ingin menghapus user <strong className="text-foreground">{selectedUser?.username}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
              disabled={deletingUser}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="flex-1"
              disabled={deletingUser}
            >
              {deletingUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Hapus'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
