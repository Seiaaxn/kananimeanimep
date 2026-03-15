'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Clock } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function NobarPage() {
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
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Nobar</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="p-6 bg-card rounded-2xl text-center max-w-sm">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          
          <h2 className="text-lg font-bold text-foreground mb-2">
            Nonton Bareng
          </h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            Fitur nobar memungkinkan kamu nonton anime bareng dengan teman-temanmu secara 
            real-time di platform yang sama.
          </p>

          <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Segera Hadir</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
