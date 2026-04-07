'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'

interface PipState {
  isOpen: boolean
  url: string
  title: string
  episodeId: string
  animeId: string
  isExpanded: boolean
  isMinimized: boolean
  isPlaying: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
}

interface PipContextType {
  pipState: PipState
  openPip: (url: string, title: string, episodeId: string, animeId: string) => void
  closePip: () => void
  togglePip: () => void
  toggleExpand: () => void
  toggleMinimize: () => void
  togglePlay: () => void
  updatePosition: (x: number, y: number) => void
  updateSize: (width: number, height: number) => void
}

const PipContext = createContext<PipContextType | undefined>(undefined)

export function PipProvider({ children }: { children: ReactNode }) {
  const [pipState, setPipState] = useState<PipState>({
    isOpen: false,
    url: '',
    title: '',
    episodeId: '',
    animeId: '',
    isExpanded: false,
    isMinimized: false,
    isPlaying: true,
    position: { x: 0, y: 0 },
    size: { width: 400, height: 200 }
  })
  const hasInitializedRef = useRef(false)

  // Initialize position and load PIP state from localStorage on mount
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    // Load PIP state from localStorage
    try {
      const savedPip = localStorage.getItem('pipState')
      if (savedPip) {
        const parsed = JSON.parse(savedPip)
        // Only restore if it was previously open
        if (parsed.isOpen) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPipState(parsed)
          return
        }
      }
    } catch (error) {
      console.error('Error loading PIP state:', error)
    }

    // Set initial position if no saved state
    setPipState(prev => ({
      ...prev,
      position: { x: window.innerWidth - 420, y: window.innerHeight - 220 }
    }))
  }, [])

  // Save PIP state to localStorage whenever it changes
  useEffect(() => {
    try {
      if (pipState.isOpen) {
        localStorage.setItem('pipState', JSON.stringify(pipState))
      } else {
        localStorage.removeItem('pipState')
      }
    } catch (error) {
      console.error('Error saving PIP state:', error)
    }
  }, [pipState])

  const openPip = useCallback((url: string, title: string, episodeId: string, animeId: string) => {
    setPipState(prev => ({
      ...prev,
      isOpen: true,
      url,
      title,
      episodeId,
      animeId,
      isExpanded: false,
      isMinimized: false,
      isPlaying: true,
      position: typeof window !== 'undefined' ? { x: window.innerWidth - 420, y: window.innerHeight - 220 } : { x: 0, y: 0 },
      size: { width: 400, height: 200 }
    }))
  }, [])

  const closePip = useCallback(() => {
    setPipState(prev => ({
      ...prev,
      isOpen: false,
      url: '',
      title: '',
      episodeId: '',
      animeId: '',
      isExpanded: false,
      isMinimized: false,
      isPlaying: true,
      position: typeof window !== 'undefined' ? { x: window.innerWidth - 420, y: window.innerHeight - 220 } : { x: 0, y: 0 },
      size: { width: 400, height: 200 }
    }))
  }, [])

  const togglePip = useCallback(() => {
    setPipState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }))
  }, [])

  const toggleExpand = useCallback(() => {
    setPipState(prev => {
      const isNowExpanded = !prev.isExpanded
      if (isNowExpanded) {
        // When expanding, reset to full screen
        return {
          ...prev,
          isExpanded: true,
          position: { x: 16, y: 16 },
          size: { width: window.innerWidth - 32, height: window.innerHeight - 200 }
        }
      } else {
        // When collapsing, reset to default size
        return {
          ...prev,
          isExpanded: false,
          position: { x: window.innerWidth - 420, y: window.innerHeight - 220 },
          size: { width: 400, height: 200 }
        }
      }
    })
  }, [])

  const toggleMinimize = useCallback(() => {
    setPipState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }))
  }, [])

  const togglePlay = useCallback(() => {
    setPipState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }, [])

  const updatePosition = useCallback((x: number, y: number) => {
    setPipState(prev => ({
      ...prev,
      position: { x, y }
    }))
  }, [])

  const updateSize = useCallback((width: number, height: number) => {
    setPipState(prev => ({
      ...prev,
      size: { width, height }
    }))
  }, [])

  return (
    <PipContext.Provider value={{ pipState, openPip, closePip, togglePip, toggleExpand, toggleMinimize, togglePlay, updatePosition, updateSize }}>
      {children}
    </PipContext.Provider>
  )
}

export function usePip() {
  const context = useContext(PipContext)
  if (context === undefined) {
    throw new Error('usePip must be used within a PipProvider')
  }
  return context
}
