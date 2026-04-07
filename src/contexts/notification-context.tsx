'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './auth-context'
import {
  requestNotificationPermission,
  getFCMToken,
  saveFCMToken,
  onForegroundMessage,
  updateNotificationPreferences,
  onUserNotificationsChange,
  type UserProfile
} from '@/lib/firebase'

interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  data?: Record<string, string>
  read: boolean
  timestamp: number
}

interface NotificationContextType {
  permission: NotificationPermission
  requestPermission: () => Promise<boolean>
  isSupported: boolean
  token: string | null
  preferences: UserProfile['notificationPreferences']
  updatePreferences: (prefs: Partial<UserProfile['notificationPreferences']>) => Promise<void>
  hasPermission: boolean
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission
    }
    return 'default'
  })
  const [token, setToken] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'Notification' in window)

  // Request FCM token and save it
  useEffect(() => {
    if (!user || permission !== 'granted') return

    const setupFCMToken = async () => {
      try {
        const fcmToken = await getFCMToken()
        if (fcmToken && fcmToken !== profile?.fcmToken) {
          await saveFCMToken(user.uid, fcmToken)
          setToken(fcmToken)
        }
      } catch (error) {
        console.error('Error setting up FCM token:', error)
      }
    }

    setupFCMToken()
  }, [user, permission, profile?.fcmToken])

  // Listen to user notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = onUserNotificationsChange(user.uid, (newNotifications) => {
      setNotifications(newNotifications)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  // Handle foreground messages
  useEffect(() => {
    if (!user || permission !== 'granted') return

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Received foreground message:', payload)

      // Show in-app notification
      if (payload.notification) {
        const { title, body } = payload.notification
        // You can show a toast or in-app notification here
        if (title && body) {
          // Use your toast notification system
          console.log(`🔔 ${title}: ${body}`)
        }
      }
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, permission])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false

    const granted = await requestNotificationPermission()
    if (granted) {
      setPermission('granted')
    } else {
      setPermission('denied')
    }
    return granted
  }

  const updatePreferences = async (prefs: Partial<UserProfile['notificationPreferences']>) => {
    if (!user) return
    await updateNotificationPreferences(user.uid, prefs)
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) return
    
    // Import the function dynamically to avoid circular dependency
    const { markNotificationAsRead } = await import('@/lib/firebase')
    await markNotificationAsRead(user.uid, notificationId)
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    // Import the function dynamically to avoid circular dependency
    const { markAllNotificationsAsRead } = await import('@/lib/firebase')
    await markAllNotificationsAsRead(user.uid)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextType = {
    permission,
    requestPermission,
    isSupported,
    token,
    preferences: profile?.notificationPreferences || {
      newEpisode: true,
      comments: true,
      replies: true,
      mentions: true,
      system: true
    },
    updatePreferences,
    hasPermission: permission === 'granted',
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
    }
    
