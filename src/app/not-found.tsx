'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* GIF Animation */}
      <div className="relative w-64 h-64 mb-8">
        <Image
          src="/not-found.gif"
          alt="Page Not Found"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan. Silakan kembali ke beranda.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <Link href="/">
          <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
            <Home className="w-4 h-4" />
            Ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  )
}
