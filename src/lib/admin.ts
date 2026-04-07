'use server'

import { getDatabase, ref, get, set, serverTimestamp } from 'firebase/database'
import { getApps, initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyActmXTykTLOnwaGJ2tbMpTnb0pg-1floU",
  authDomain: "kanachat-ffeb7.firebaseapp.com",
  databaseURL: "https://kanachat-ffeb7-default-rtdb.firebaseio.com",
  projectId: "kanachat-ffeb7",
  storageBucket: "kanachat-ffeb7.firebasestorage.app",
  messagingSenderId: "755917977291",
  appId: "1:755917977291:web:9b0bf4da0d64536697cd4e"
}

export async function setUserPremiumByEmail(email: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    const database = getDatabase(app)
    const usersRef = ref(database, 'users')

    console.log('Fetching all users...')
    const snapshot = await get(usersRef)

    if (!snapshot.exists()) {
      return { success: false, error: 'No users found' }
    }

    console.log('Searching for user:', email)
    let targetUserId: string | null = null
    let userData: any = null

    snapshot.forEach((child) => {
      const user = child.val()
      if (user.email === email) {
        targetUserId = child.key as string
        userData = user
        console.log('Found user:', user.username, '- isPremium:', user.isPremium)
      }
    })

    if (!targetUserId || !userData) {
      return { success: false, error: `User with email ${email} not found` }
    }

    console.log('Updating user to premium...')
    await set(ref(database, `users/${targetUserId}`), {
      ...userData,
      isPremium: true,
      premiumSince: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    console.log('Premium set successfully for:', userData.username)

    return {
      success: true,
      userId: targetUserId,
      username: userData.username,
      exp: userData.exp,
      level: userData.level
    }

  } catch (error: any) {
    console.error('Error setting premium:', error)
    return { success: false, error: error.message }
  }
    }
      
