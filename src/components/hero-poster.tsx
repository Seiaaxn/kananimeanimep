'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Star } from 'lucide-react'
import type { Anime } from '@/lib/types'

interface HeroPosterProps {
  animeList: Anime[]
}

export function HeroPoster({ animeList }: HeroPosterProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter anime that have poster images
  const validAnime = animeList.filter(anime => anime.poster && anime.poster.trim() !== '')
  const displayAnime = validAnime.slice(0, 5) // Show max 5 anime

  // Auto-slide functionality
  useEffect(() => {
    if (displayAnime.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayAnime.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [displayAnime.length])

  if (displayAnime.length === 0) return null

  const currentAnime = displayAnime[currentIndex]

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl shadow-lg">
      {/* Background Image */}
      <Image
        src={currentAnime.poster}
        alt={currentAnime.title}
        fill
        className="object-cover transition-all duration-700"
        priority
        unoptimized
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-4 sm:p-6">
          <div className="max-w-[75%] space-y-2 sm:space-y-3">
            {/* Episode Badge */}
            {currentAnime.episodes && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-md">
                EP {currentAnime.episodes}
              </span>
            )}
            
            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white line-clamp-2 drop-shadow-lg">
              {currentAnime.title}
            </h2>

            {/* Score */}
            {currentAnime.score && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">
                  {currentAnime.score}
                </span>
              </div>
            )}

            {/* Watch Button */}
            <Link
              href={`/anime/${currentAnime.animeId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Tonton Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Counter */}
      {displayAnime.length > 1 && (
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-md">
          <span className="text-xs font-medium text-white">
            {currentIndex + 1} / {displayAnime.length}
          </span>
        </div>
      )}
    </div>
  )
}
