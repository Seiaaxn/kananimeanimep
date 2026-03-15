'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { 
  signInWithGoogle,
  getUserProfile,
  saveUserProfile
} from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { BottomNav } from '@/components/bottom-nav'

export default function AuthPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signInWithGoogle()
      const firebaseUser = result.user
      
      const existingProfile = await getUserProfile(firebaseUser.uid)
      
      if (!existingProfile) {
        await saveUserProfile(firebaseUser.uid, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || `User${Date.now().toString().slice(-4)}`,
          avatar: firebaseUser.photoURL,
          banner: null,
          level: 1,
          exp: 0,
          watchCount: 0,
          commentCount: 0,
          favoriteCount: 0,
          role: 'user',
          createdAt: Date.now()
        })
      }
      
      router.push('/')
    } catch (err) {
      console.error('Google login error:', err)
      setError('Gagal login dengan Google. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">KANAN</span>
            <span className="text-foreground">IMEID</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Masuk untuk melanjutkan
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border/50 p-6 space-y-6">
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">Selamat Datang!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Masuk untuk menyimpan progress dan favorit anime kamu
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 bg-background border border-border rounded-xl font-medium hover:bg-muted transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Lanjutkan dengan Google</span>
              </>
            )}
          </button>

          {/* Features List */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Keuntungan masuk:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span>
                Simpan riwayat menonton
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span>
                Tambah anime favorit
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span>
                Chat di global chat
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">✓</span>
                Level dan EXP progress
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
          Dengan masuk, kamu menyetujui syarat dan ketentuan yang berlaku
        </p>
      </main>

      <BottomNav />
    </div>
  )
}
