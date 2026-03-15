'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Code, Globe } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function AboutPage() {
  const router = useRouter()

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
          <h1 className="text-lg font-bold text-foreground">Tentang</h1>
        </div>
      </header>

      <div className="px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-primary">KANAN</span>
            <span className="text-foreground">IMEID</span>
          </h1>
          <p className="text-sm text-muted-foreground">Versi 1.0.0</p>
        </div>

        {/* Description */}
        <div className="space-y-4 mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            KANANIMEID adalah platform streaming anime subtitle Indonesia yang menyediakan 
            berbagai koleksi anime terlengkap dengan kualitas terbaik.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Fitur Utama</h2>
          
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Streaming Online</p>
              <p className="text-xs text-muted-foreground">Nonton anime langsung tanpa download</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Heart className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Daftar Favorit</p>
              <p className="text-xs text-muted-foreground">Simpan anime favoritmu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Code className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Kualitas HD</p>
              <p className="text-xs text-muted-foreground">Tersedia berbagai pilihan kualitas</p>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Dibuat dengan penuh cinta untuk pecinta anime</p>
          <p className="mt-1">© 2025 KANANIMEID. All rights reserved.</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
