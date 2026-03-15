'use client'

import { useState } from 'react'
import { Download, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { DownloadQuality } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DownloadSectionProps {
  qualities: DownloadQuality[]
}

export function DownloadSection({ qualities }: DownloadSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeQuality, setActiveQuality] = useState(qualities[1]?.title || qualities[0]?.title || '480p')

  const currentQuality = qualities.find(q => q.title === activeQuality)

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
          {/* Quality tabs */}
          <div className="flex gap-2">
            {qualities.map((quality) => (
              <button
                key={quality.title}
                onClick={() => setActiveQuality(quality.title)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeQuality === quality.title
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {quality.title}
                {quality.size && <span className="ml-1 text-[10px] opacity-70">({quality.size})</span>}
              </button>
            ))}
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
