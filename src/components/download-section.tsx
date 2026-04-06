'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, ChevronUp, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DownloadQuality } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DownloadSectionProps {
  qualities: DownloadQuality[]
}

export function DownloadSection({ qualities }: DownloadSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeQuality, setActiveQuality] = useState(qualities[1]?.title || qualities[0]?.title || '480p')

  // Swipe states
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const currentQuality = qualities.find(q => q.title === activeQuality)

  // Sort qualities by resolution (480p, 720p, 1080p, etc.)
  const qualityOrder = ['360p', '480p', '720p', '1080p', '4K']
  const sortedQualities = [...qualities].sort((a, b) => {
    const indexA = qualityOrder.indexOf(a.title)
    const indexB = qualityOrder.indexOf(b.title)
    if (indexA === -1 && indexB === -1) return a.title.localeCompare(b.title)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
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
  }, [qualities, expanded])

  // Auto-scroll to active quality when expanded
  useEffect(() => {
    if (expanded && sliderRef.current) {
      const activeElement = sliderRef.current.querySelector(`[data-quality-title="${activeQuality}"]`)
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [expanded, activeQuality])

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
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full py-2"
      >
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Download</h2>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Quality tabs header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Kualitas:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={scrollLeftHandler}
                disabled={!canScrollLeft}
                className={`p-1 rounded-lg transition-all duration-200 ${
                  canScrollLeft
                    ? 'bg-muted hover:bg-muted/80 text-foreground cursor-pointer'
                    : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
                }`}
                title="Geser ke kiri"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={scrollRightHandler}
                disabled={!canScrollRight}
                className={`p-1 rounded-lg transition-all duration-200 ${
                  canScrollRight
                    ? 'bg-muted hover:bg-muted/80 text-foreground cursor-pointer'
                    : 'bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50'
                }`}
                title="Geser ke kanan"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quality tabs slider */}
          <div className="relative group">
            {/* Left Fade Gradient */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            )}

            {/* Scrollable Quality Tabs */}
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
              {sortedQualities.map((quality) => (
                <button
                  key={quality.title}
                  data-quality-title={quality.title}
                  onClick={() => setActiveQuality(quality.title)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 snap-start min-w-[80px]',
                    activeQuality === quality.title
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-md scale-105'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105'
                  )}
                >
                  {quality.title}
                  {quality.size && <span className="ml-1 text-[10px] opacity-70">({quality.size})</span>}
                </button>
              ))}
            </div>

            {/* Right Fade Gradient */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            )}
          </div>

          {/* Download links */}
          <div className="grid grid-cols-2 gap-2">
            {currentQuality?.urls.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-card/80 rounded-lg text-xs font-medium text-foreground transition-colors border border-border"
              >
                <span>{link.title}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
  }
                  
