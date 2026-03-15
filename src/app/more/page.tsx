'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Clock, 
  MessageCircle, 
  Bookmark, 
  Info, 
  FileText,
  Shield,
  Heart,
  ExternalLink,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

const menuItems = [
  {
    href: '/schedule',
    icon: Calendar,
    title: 'Jadwal Rilis',
    description: 'Lihat jadwal tayang anime setiap hari',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500'
  },
  {
    href: '/history',
    icon: Clock,
    title: 'Riwayat Tonton',
    description: 'Lihat anime yang terakhir kamu tonton',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500'
  },
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'Obrolan Global',
    description: 'Chat dengan semua pengguna',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500'
  },
  {
    href: '/favorites',
    icon: Bookmark,
    title: 'Favorit',
    description: 'Daftar anime favoritmu',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500'
  },
]

const externalLinks = [
  {
    href: 'https://saweria.co/kananimeid',
    icon: Heart,
    title: 'Donasi',
    description: 'Dukung pengembangan KANANIMEID',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500'
  },
]

const infoItems = [
  {
    href: '/about',
    icon: Info,
    title: 'Tentang',
    description: 'Tentang platform ini',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500'
  },
  {
    href: '/tos',
    icon: FileText,
    title: 'Syarat & Ketentuan',
    description: 'Ketentuan penggunaan layanan',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500'
  },
  {
    href: '/dmca',
    icon: Shield,
    title: 'DMCA Policy',
    description: 'Kebijakan hak cipta',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500'
  },
]

export default function MorePage() {
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
          <div>
            <h1 className="text-lg font-bold text-foreground">Lebih Banyak Fitur</h1>
            <p className="text-xs text-muted-foreground">Semua fitur & halaman</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 bg-card hover:bg-card/80 rounded-xl transition-colors group"
          >
            <div className={`p-3 rounded-xl ${item.iconBg}`}>
              <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.description}
              </p>
            </div>
            
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Donasi Section */}
      <div className="px-4 py-2">
        <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">Dukung Kami</h2>
        <div className="space-y-2">
          {externalLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-card hover:bg-card/80 rounded-xl transition-colors group"
            >
              <div className={`p-3 rounded-xl ${item.iconBg}`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </div>
              
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="px-4 py-2">
        <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">Informasi</h2>
        <div className="space-y-2">
          {infoItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-card hover:bg-card/80 rounded-xl transition-colors group"
            >
              <div className={`p-3 rounded-xl ${item.iconBg}`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </div>
              
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
