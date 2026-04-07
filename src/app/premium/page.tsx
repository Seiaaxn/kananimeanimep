'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Crown, Check, Zap, Star, Sparkles, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAuth } from '@/contexts/auth-context'
import { setUserPremium, type UserProfile } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function PremiumPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  const handleUpgrade = async () => {
    if (!user || !profile || upgrading) return

    setUpgrading(true)
    try {
      await setUserPremium(user.uid, true)
      await refreshProfile()
      toast.success('🎉 Selamat! Anda sekarang adalah Premium member!')
    } catch (error) {
      console.error('Error upgrading to premium:', error)
      toast.error('Gagal mengupgrade ke Premium. Silakan coba lagi.')
    } finally {
      setUpgrading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPremium = profile?.isPremium || false

  const benefits = [
    {
      icon: Zap,
      title: 'EXP 5x Lebih Cepat',
      description: 'Dapatkan 5x lebih banyak EXP setiap kali menonton anime. Naik level jauh lebih cepat!',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      icon: Star,
      title: 'Badge Premium Crown',
      description: 'Tampilkan badge Crown yang eksklusif di profil dan komentar Anda.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Sparkles,
      title: 'Status Premium',
      description: 'Dapatkan pengakuan sebagai member premium di seluruh komunitas SHINKANIMEID.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ]

  return (
    <main className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Premium</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Premium Status Card */}
        {isPremium ? (
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Premium Member!</h2>
            <p className="text-sm text-foreground/80 mb-4">
              Terima kasih telah menjadi member premium. Nikmati semua keuntungan eksklusif!
            </p>
            {profile?.premiumSince && (
              <p className="text-xs text-foreground/60">
                Premium sejak{' '}
                {new Date(profile.premiumSince).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/50 to-primary/30 flex items-center justify-center">
              <Crown className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade ke Premium</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Dapatkan keuntungan eksklusif dan naik level 5x lebih cepat!
            </p>
          </div>
        )}

        {/* Benefits */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Keuntungan Premium
          </h3>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02]",
                  isPremium ? benefit.bgColor + " border-amber-500/30" : "bg-muted/30 border-border/50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl flex-shrink-0",
                  isPremium ? benefit.bgColor : "bg-primary/10"
                )}>
                  <benefit.icon className={cn("w-6 h-6", isPremium ? benefit.color : "text-primary")} />
                </div>
                <div className="flex-1">
                  <h4 className={cn(
                    "font-semibold mb-1",
                    isPremium ? benefit.color : "text-foreground"
                  )}>
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
                {isPremium && (
                  <Check className="w-6 h-6 text-amber-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* EXP Comparison */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
            Perbandingan EXP
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Regular Member</p>
              <p className="text-3xl font-bold text-foreground">10</p>
              <p className="text-xs text-muted-foreground">EXP per episode</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-xl border border-amber-500/30">
              <p className="text-xs text-amber-400 mb-2">Premium Member</p>
              <p className="text-3xl font-bold text-amber-400">50</p>
              <p className="text-xs text-amber-400/80">EXP per episode</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-foreground/70">
              Premium member mendapatkan <span className="font-bold text-amber-400">5x lebih banyak EXP</span> dari member biasa!
            </p>
          </div>
        </div>

        {/* CTA Button */}
        {!isPremium && (
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-lg rounded-2xl"
            >
              {upgrading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade ke Premium
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Upgrade sekarang dan nikmati semua keuntungan eksklusif!
            </p>
          </div>
        )}

        {/* Back to Profile */}
        <div className="text-center">
          <Link
            href="/profile"
            className="text-sm text-primary hover:text/80 transition-colors"
          >
            ← Kembali ke Profil
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  )
    }
      
