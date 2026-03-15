'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User } from 'firebase/auth'
import { 
  onAuthChange, 
  getUserProfile, 
  saveUserProfile,
  type UserProfile 
} from '@/lib/firebase'

// Admin email - will automatically get admin role
const ADMIN_EMAIL = 'ryu694602@gmail.com'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfileState: (data: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  updateProfileState: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid)
      setProfile(p)
    }
  }

  const updateProfileState = (data: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...data } : null)
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Check if this is admin email
        const isAdmin = firebaseUser.email === ADMIN_EMAIL
        
        // Get or create user profile
        let userProfile = await getUserProfile(firebaseUser.uid)
        
        if (!userProfile) {
          // Generate username from displayName or email
          let username = firebaseUser.displayName
          if (!username || username.trim() === '') {
            // Extract username from email
            const emailParts = firebaseUser.email?.split('@')[0] || ''
            username = emailParts.charAt(0).toUpperCase() + emailParts.slice(1) || `User${Date.now().toString().slice(-4)}`
          }
          
          // Create new profile with proper username
          const newProfile: Record<string, unknown> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: username,
            avatar: firebaseUser.photoURL || null,
            banner: null,
            level: 1,
            exp: 0,
            watchCount: 0,
            commentCount: 0,
            favoriteCount: 0,
            role: isAdmin ? 'admin' : 'user',
            verified: isAdmin ? true : false,
            createdAt: Date.now()
          }
          
          // Only add tag for admin
          if (isAdmin) {
            newProfile.tag = 'Admin'
            newProfile.tagColor = 'bg-cyan-500'
          }
          
          userProfile = newProfile as UserProfile
          await saveUserProfile(firebaseUser.uid, userProfile)
        } else if (isAdmin && userProfile.role !== 'admin') {
          // Update to admin if needed
          userProfile = {
            ...userProfile,
            role: 'admin',
            verified: true,
            tag: 'Admin',
            tagColor: 'bg-cyan-500'
          }
          await saveUserProfile(firebaseUser.uid, userProfile)
        }
        
        // If username is empty, update it from Firebase auth
        if (!userProfile.username || userProfile.username.trim() === '') {
          let username = firebaseUser.displayName
          if (!username || username.trim() === '') {
            const emailParts = firebaseUser.email?.split('@')[0] || ''
            username = emailParts.charAt(0).toUpperCase() + emailParts.slice(1) || `User${Date.now().toString().slice(-4)}`
          }
          userProfile = {
            ...userProfile,
            username: username
          }
          await saveUserProfile(firebaseUser.uid, userProfile)
        }
        
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Periodic profile refresh for real-time updates
  useEffect(() => {
    if (!user) return
    
    // Refresh profile every 5 seconds for stats updates
    const interval = setInterval(async () => {
      const updatedProfile = await getUserProfile(user.uid)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
