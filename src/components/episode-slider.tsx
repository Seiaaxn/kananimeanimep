'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { List, ChevronLeft, ChevronRight } from 'lucide-react'

interface Episode {
  episodeId: string
  eps: string | number
}

interface EpisodeSliderProps {
  episodes: Episode[]
  currentEpisodeId: string
}

export function EpisodeSlider({ episodes, currentEpisodeId }: EpisodeSliderProps) {
  const router = useRouter()
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Sort episodes by episode number to ensure Episode 1 is on the left
  const sortedEpisodes = [...episodes].sort((a, b) => {
    const epsA = typeof a.eps === 'string' ? parseInt(a.eps) : a.eps
    const epsB = typeof b.eps === 'string' ? parseInt(b.eps) : b.eps
    return epsA - epsB
  })

  // Check scroll position
  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener('scroll', checkScrollPosition)
      checkScrollPosition()
      return () => slider.removeEventListener('scroll', checkScrollPosition)
    }
  }, [episodes, currentEpisodeId])

  // Auto-scroll to current episode when it changes
  useEffect(() => {
    if (sliderRef.current) {
      const currentElement = sliderRef.current.querySelector(`[data-episode-id="${currentEpisodeId}"]`)
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [currentEpisodeId])

  // Scroll handlers
  const scrollLeftHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRightHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Touch/mouse drag handlers for swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0))
    setScrollLeft(sliderRef.current?.scrollLeft || 0)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - (sliderRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2 // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0))
    setScrollLeft(sliderRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return
    const x = e.touches[0].pageX - (sliderRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    sliderRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Episode Lainnya</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={scrollLeftHandler}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canScrollLeft
                ? 'bg-muted hover:bg-muted/80 text-foreground cursor-pointer'
                : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
            }`}
            title="Geser ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRightHandler}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canScrollRight
                ? 'bg-muted hover:bg-muted/80 text-foreground cursor-pointer'
                : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
            }`}
            title="Geser ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Episode Slider Container */}
      <div className="relative group">
        {/* Left Fade Gradient */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollable Container */}
        <div
          ref={sliderRef}
          className={`flex gap-2 overflow-x-auto snap-x snap-mandatory py-1 px-1 hide-scrollbar ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } select-none`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {sortedEpisodes.map((ep) => (
            <button
              key={ep.episodeId}
              data-episode-id={ep.episodeId}
              onClick={() => router.push(`/watch/${ep.episodeId}`)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 snap-start min-w-[70px] ${
                ep.episodeId === currentEpisodeId
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105'
              }`}
            >
              {ep.eps}
            </button>
          ))}
        </div>

        {/* Right Fade Gradient */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
