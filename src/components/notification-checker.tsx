'use client'

import { useEffect, useRef } from 'react'

interface AnimeItem {
  animeId: string
  title: string
}

export function NotificationChecker() {
  const lastCheckedRef = useRef<string[]>([])
  
  useEffect(() => {
    // Check if notifications are enabled
    const notificationsEnabled = localStorage.getItem('notifications') === 'true'
    if (!notificationsEnabled) return
    
    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') return
    }
    
    // Function to check for new anime
    const checkForNewAnime = async () => {
      try {
        const res = await fetch('https://www.sankavollerei.com/anime/home', {
          next: { revalidate: 60 }
        })
        const data = await res.json()
        
        if (data?.data?.ongoing?.animeList) {
          const currentAnimeIds = data.data.ongoing.animeList.slice(0, 5).map((a: AnimeItem) => a.animeId)
          
          // Get last checked anime from localStorage
          const savedIds = localStorage.getItem('lastCheckedAnime')
          const lastCheckedIds: string[] = savedIds ? JSON.parse(savedIds) : []
          
          // Find new anime (anime that wasn't in the last check)
          const newAnime = data.data.ongoing.animeList.filter((a: AnimeItem) => 
            !lastCheckedIds.includes(a.animeId) && lastCheckedIds.length > 0
          )
          
          // Save current anime IDs
          localStorage.setItem('lastCheckedAnime', JSON.stringify(currentAnimeIds))
          
          // Show notification for new anime (max 1 to avoid spam)
          if (newAnime.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            const anime = newAnime[0]
            new Notification('🎬 Anime Terbaru!', {
              body: `${anime.title} episode baru sudah tersedia!`,
              icon: '/logo-icon.jpg',
              badge: '/logo-icon.jpg',
              tag: 'new-anime',
              data: { url: `/anime/${anime.animeId}` }
            })
          }
        }
      } catch (error) {
        console.error('Error checking for new anime:', error)
      }
    }
    
    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => {
      checkForNewAnime()
    }, 5000)
    
    // Check every 5 minutes
    const interval = setInterval(checkForNewAnime, 300000)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])
  
  return null
}
