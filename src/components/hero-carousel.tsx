'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Anime } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HeroCarouselProps {
  animeList: Anime[]
}

export function HeroCarousel({ animeList }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const slides = animeList.slice(0, 8)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  if (slides.length === 0) return null

  const currentAnime = slides[currentIndex]
  const animeId = currentAnime.animeId || currentAnime.slug || ''

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden">
      {/* Background image with gradient */}
      <div className="absolute inset-0">
        <Image
          src={currentAnime.poster}
          alt={currentAnime.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-8">
        <div className="space-y-2">
          <span className="inline-block bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">
            TERBARU
          </span>
          
          <Link href={`/anime/${animeId}`}>
            <h2 className="text-xl md:text-3xl font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
              {currentAnime.title}
            </h2>
          </Link>
          
          {currentAnime.releaseDay && (
            <p className="text-sm text-muted-foreground">
              Setiap {currentAnime.releaseDay}
            </p>
          )}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-2">
          {currentIndex + 1}/{slides.length}
        </span>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex 
                ? 'bg-primary w-4' 
                : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
