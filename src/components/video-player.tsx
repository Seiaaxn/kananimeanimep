'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { addToHistory, updateHistoryProgress } from '@/lib/firebase'

interface VideoPlayerProps {
  defaultUrl: string
  episodeId: string
  episodeTitle: string
  animeId: string
  animeTitle?: string
  poster?: string
  episodeNumber?: number
  startTime?: number
}

export function VideoPlayer({ 
  defaultUrl, 
  episodeId, 
  episodeTitle, 
  animeId,
  animeTitle = '',
  poster = '',
  episodeNumber = 1,
  startTime
}: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState(defaultUrl)
  const { user } = useAuth()
  const lastProgressUpdate = useRef<number>(0)

  useEffect(() => {
    // Save to watch history in Firebase
    async function saveHistory() {
      if (!user) return
      
      try {
        await addToHistory(user.uid, {
          episodeId,
          animeId,
          animeTitle,
          episodeTitle,
          poster,
          episodeNumber,
          duration: 24, // Default anime episode duration in minutes
          progress: 0
        })
      } catch (error) {
        console.error('Error saving history:', error)
      }
    }
    
    saveHistory()
  }, [user, episodeId, animeId, animeTitle, episodeTitle, poster, episodeNumber])

  // Listen for server changes
  useEffect(() => {
    const handleServerChange = (e: CustomEvent<string>) => {
      setStreamUrl(e.detail)
    }
    
    window.addEventListener('serverChange', handleServerChange as EventListener)
    return () => window.removeEventListener('serverChange', handleServerChange as EventListener)
  }, [])

  // Simulate progress tracking (since we can't access iframe content)
  // This will update progress every 30 seconds of watching
  useEffect(() => {
    if (!user) return

    const progressInterval = setInterval(async () => {
      const now = Date.now()
      // Update progress every 30 seconds
      if (now - lastProgressUpdate.current >= 30000) {
        lastProgressUpdate.current = now
        
        // Increment progress by ~2% per 30 seconds (assuming 24 min episode)
        try {
          // Get current progress from history and increment
          const { getHistory } = await import('@/lib/firebase')
          const history = await getHistory(user.uid)
          const currentItem = history.find(h => h.episodeId === episodeId)
          const currentProgress = currentItem?.progress || 0
          const newProgress = Math.min(currentProgress + 2, 100)
          
          await updateHistoryProgress(user.uid, episodeId, newProgress)
        } catch (error) {
          console.error('Error updating progress:', error)
        }
      }
    }, 30000)

    return () => clearInterval(progressInterval)
  }, [user, episodeId])

  return (
    <div className="relative w-full aspect-video bg-black">
      <iframe
        src={streamUrl}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
      />
    </div>
  )
}
