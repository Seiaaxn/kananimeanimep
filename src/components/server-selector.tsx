'use client'

import { useState } from 'react'
import { Monitor, Loader2 } from 'lucide-react'
import type { ServerQuality } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ServerSelectorProps {
  qualities: ServerQuality[]
  episodeId: string
}

export function ServerSelector({ qualities, episodeId }: ServerSelectorProps) {
  const [activeQuality, setActiveQuality] = useState(qualities[1]?.title || qualities[0]?.title || '480p')
  const [activeServer, setActiveServer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const currentQuality = qualities.find(q => q.title === activeQuality)
  const servers = currentQuality?.serverList || []

  const handleServerClick = async (serverId: string) => {
    setActiveServer(serverId)
    setLoading(true)
    
    try {
      const res = await fetch(`https://www.sankavollerei.com/anime/server/${serverId}`)
      const data = await res.json()
      
      if (data.data?.url) {
        // Dispatch custom event to update video player
        window.dispatchEvent(new CustomEvent('serverChange', { detail: data.data.url }))
      }
    } catch (error) {
      console.error('Failed to fetch server:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Server Streaming</h2>
      </div>

      {/* Quality tabs */}
      <div className="flex gap-2">
        {qualities.map((quality) => (
          <button
            key={quality.title}
            onClick={() => {
              setActiveQuality(quality.title)
              setActiveServer(null)
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeQuality === quality.title
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {quality.title}
          </button>
        ))}
      </div>

      {/* Server buttons */}
      <div className="flex flex-wrap gap-2">
        {servers.length === 0 ? (
          <p className="text-xs text-muted-foreground">Tidak ada server tersedia untuk kualitas ini.</p>
        ) : (
          servers.map((server) => (
            <button
              key={server.serverId}
              onClick={() => handleServerClick(server.serverId)}
              disabled={loading && activeServer === server.serverId}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                activeServer === server.serverId
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border'
              )}
            >
              {loading && activeServer === server.serverId ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : null}
              {server.title}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
