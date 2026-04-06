import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { getDatabase, ref, push, set, get, remove, onValue, query, orderByChild, limitToLast, serverTimestamp, update } from 'firebase/database'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyActmXTykTLOnwaGJ2tbMpTnb0pg-1floU",
  authDomain: "kanachat-ffeb7.firebaseapp.com",
  databaseURL: "https://kanachat-ffeb7-default-rtdb.firebaseio.com",
  projectId: "kanachat-ffeb7",
  storageBucket: "kanachat-ffeb7.firebasestorage.app",
  messagingSenderId: "755917977291",
  appId: "1:755917977291:web:9b0bf4da0d64536697cd4e"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const database = getDatabase(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

// Re-export for use in other components
export { ref, onValue, database, auth, storage }

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const logOut = () => signOut(auth)
export const onAuthChange = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback)

// User profile functions
export const saveUserProfile = async (userId: string, data: Record<string, unknown>) => {
  const userRef = ref(database, `users/${userId}`)
  
  // Filter out undefined values - Firebase doesn't accept undefined
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
  
  await set(userRef, {
    ...cleanData,
    updatedAt: serverTimestamp()
  })
}

export const getUserProfile = async (userId: string) => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)
  return snapshot.exists() ? snapshot.val() : null
}

export const updateUserProfile = async (userId: string, data: Record<string, unknown>) => {
  const userRef = ref(database, `users/${userId}`)
  const existing = await getUserProfile(userId)
  
  // Filter out undefined values - Firebase doesn't accept undefined
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
  
  await set(userRef, {
    ...existing,
    ...cleanData,
    updatedAt: serverTimestamp()
  })
}

// Upload profile photo (avatar)
export const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
  const fileRef = storageRef(storage, `avatars/${userId}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

// Upload banner photo
export const uploadBannerPhoto = async (userId: string, file: File): Promise<string> => {
  const fileRef = storageRef(storage, `banners/${userId}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

// Upload sticker/image for chat
export const uploadSticker = async (userId: string, file: File): Promise<string> => {
  const fileRef = storageRef(storage, `stickers/${userId}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

// Chat functions - Updated to include role and verified status
export const sendChatMessage = async (userId: string, username: string, avatar: string | null, message: string, level: number, role: 'user' | 'admin' = 'user', verified: boolean = false) => {
  const messagesRef = ref(database, 'globalChat')
  const newMessageRef = push(messagesRef)
  const timestamp = serverTimestamp()
  
  await set(newMessageRef, {
    userId,
    username,
    avatar,
    message,
    level,
    role,
    verified,
    timestamp
  })
  
  // Also save to user's comment history
  const commentRef = push(ref(database, `userComments/${userId}`))
  await set(commentRef, {
    message,
    timestamp
  })
  
  // Update user comment count
  await incrementUserStat(userId, 'commentCount')
}

export const onChatMessages = (callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = query(ref(database, 'globalChat'), orderByChild('timestamp'), limitToLast(100))
  return onValue(messagesRef, (snapshot) => {
    const messages: ChatMessage[] = []
    snapshot.forEach((child) => {
      messages.push({
        id: child.key as string,
        ...child.val()
      })
    })
    callback(messages)
  })
}

export const clearAllChat = async () => {
  const chatRef = ref(database, 'globalChat')
  await remove(chatRef)
}

// Favorites functions
export const addFavorite = async (userId: string, anime: FavoriteAnime) => {
  const favRef = ref(database, `favorites/${userId}/${anime.animeId}`)
  await set(favRef, {
    ...anime,
    addedAt: serverTimestamp()
  })
}

export const removeFavorite = async (userId: string, animeId: string) => {
  const favRef = ref(database, `favorites/${userId}/${animeId}`)
  await remove(favRef)
}

export const getFavorites = async (userId: string): Promise<FavoriteAnime[]> => {
  const favsRef = ref(database, `favorites/${userId}`)
  const snapshot = await get(favsRef)
  if (!snapshot.exists()) return []
  const favorites: FavoriteAnime[] = []
  snapshot.forEach((child) => {
    favorites.push({
      animeId: child.key as string,
      ...child.val()
    })
  })
  return favorites.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
}

export const isFavorited = async (userId: string, animeId: string): Promise<boolean> => {
  const favRef = ref(database, `favorites/${userId}/${animeId}`)
  const snapshot = await get(favRef)
  return snapshot.exists()
}

export const onFavoritesChange = (userId: string, callback: (favorites: FavoriteAnime[]) => void) => {
  const favsRef = ref(database, `favorites/${userId}`)
  return onValue(favsRef, (snapshot) => {
    const favorites: FavoriteAnime[] = []
    snapshot.forEach((child) => {
      favorites.push({
        animeId: child.key as string,
        ...child.val()
      })
    })
    callback(favorites.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)))
  })
}

// History functions
export const addToHistory = async (userId: string, episode: HistoryItem) => {
  const historyRef = ref(database, `history/${userId}/${episode.episodeId}`)
  
  // Check if this episode was already watched to avoid duplicate EXP
  const snapshot = await get(historyRef)
  const isNewEpisode = !snapshot.exists()
  
  await set(historyRef, {
    ...episode,
    watchedAt: serverTimestamp()
  })
  
  // Update user stats
  await incrementUserStat(userId, 'watchCount')
  
  // Only grant EXP for new episodes (first time watching)
  if (isNewEpisode) {
    await incrementUserStat(userId, 'exp')
  }
}

export const updateHistoryProgress = async (userId: string, episodeId: string, progress: number) => {
  const historyRef = ref(database, `history/${userId}/${episodeId}`)
  const snapshot = await get(historyRef)
  if (snapshot.exists()) {
    const existing = snapshot.val()
    await set(historyRef, {
      ...existing,
      progress,
      watchedAt: serverTimestamp()
    })
  }
}

export const getHistory = async (userId: string): Promise<HistoryItem[]> => {
  const historyRef = ref(database, `history/${userId}`)
  const snapshot = await get(historyRef)
  if (!snapshot.exists()) return []
  const history: HistoryItem[] = []
  snapshot.forEach((child) => {
    history.push({
      episodeId: child.key as string,
      ...child.val()
    })
  })
  return history.sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0))
}

export const clearHistory = async (userId: string) => {
  const historyRef = ref(database, `history/${userId}`)
  await remove(historyRef)
}

export const onHistoryChange = (userId: string, callback: (history: HistoryItem[]) => void) => {
  const historyRef = ref(database, `history/${userId}`)
  return onValue(historyRef, (snapshot) => {
    const history: HistoryItem[] = []
    snapshot.forEach((child) => {
      history.push({
        episodeId: child.key as string,
        ...child.val()
      })
    })
    callback(history.sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0)))
  })
}

// User stats functions
export const incrementUserStat = async (userId: string, stat: 'watchCount' | 'commentCount' | 'exp') => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    const currentValue = userData[stat] || 0
    const newValue = currentValue + (stat === 'exp' ? 10 : 1)
    await set(userRef, {
      ...userData,
      [stat]: newValue,
      level: stat === 'exp' ? calculateLevel(newValue) : userData.level || 1,
      updatedAt: serverTimestamp()
    })
  }
}

export const getUserStats = async (userId: string) => {
  const profile = await getUserProfile(userId)
  return {
    watchCount: profile?.watchCount || 0,
    commentCount: profile?.commentCount || 0,
    favoriteCount: profile?.favoriteCount || 0,
    exp: profile?.exp || 0,
    level: profile?.level || 1
  }
}

// Admin functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = ref(database, 'users')
  const snapshot = await get(usersRef)
  if (!snapshot.exists()) return []
  const users: UserProfile[] = []
  snapshot.forEach((child) => {
    users.push({
      uid: child.key as string,
      ...child.val()
    })
  })
  return users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const updateUserRole = async (targetUserId: string, role: 'user' | 'admin') => {
  const userRef = ref(database, `users/${targetUserId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    await set(userRef, {
      ...userData,
      role,
      verified: role === 'admin',
      updatedAt: serverTimestamp()
    })
  }
}

export const updateUserLevel = async (targetUserId: string, level: number, exp: number) => {
  const userRef = ref(database, `users/${targetUserId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    await set(userRef, {
      ...userData,
      level,
      exp,
      updatedAt: serverTimestamp()
    })
  }
}

export const updateUserTag = async (targetUserId: string, tag: string, tagColor?: string) => {
  const userRef = ref(database, `users/${targetUserId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    await set(userRef, {
      ...userData,
      tag: tag || null,
      tagColor: tagColor || null,
      updatedAt: serverTimestamp()
    })
  }
}

export const setUserVerified = async (targetUserId: string, verified: boolean) => {
  const userRef = ref(database, `users/${targetUserId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    await set(userRef, {
      ...userData,
      verified,
      updatedAt: serverTimestamp()
    })
  }
}

export const onUsersChange = (callback: (users: UserProfile[]) => void) => {
  const usersRef = ref(database, 'users')
  return onValue(usersRef, (snapshot) => {
    const users: UserProfile[] = []
    snapshot.forEach((child) => {
      users.push({
        uid: child.key as string,
        ...child.val()
      })
    })
    callback(users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
  })
}

// Delete user (admin only)
export const deleteUser = async (targetUserId: string) => {
  // Delete user data from database
  const userRef = ref(database, `users/${targetUserId}`)
  await remove(userRef)

  // Delete user's favorites
  const favsRef = ref(database, `favorites/${targetUserId}`)
  await remove(favsRef)

  // Delete user's history
  const historyRef = ref(database, `history/${targetUserId}`)
  await remove(historyRef)
}

// Level System Functions
export const calculateLevel = (exp: number): number => {
  if (exp < 0) return 0

  // Level 1-50: 300 EXP per level (total 15000 EXP for level 50)
  if (exp < 15000) {
    return Math.floor(exp / 300) + 1
  }

  // Level 51-100: 500 EXP per level
  if (exp < 40000) {
    return 50 + Math.floor((exp - 15000) / 500)
  }

  // Level 101-500: 1000 EXP per level
  if (exp < 340000) {
    return 100 + Math.floor((exp - 40000) / 1000)
  }

  // Level 501-1000: 2000 EXP per level
  if (exp < 1340000) {
    return 500 + Math.floor((exp - 340000) / 2000)
  }

  // Level 1001-5000: 5000 EXP per level
  if (exp < 16340000) {
    return 1000 + Math.floor((exp - 1340000) / 5000)
  }

  // Level 5001-10000: 10000 EXP per level
  if (exp < 66340000) {
    return 5000 + Math.floor((exp - 16340000) / 10000)
  }

  // Level 10001-50000: 20000 EXP per level
  if (exp < 766340000) {
    return 10000 + Math.floor((exp - 66340000) / 20000)
  }

  // Level 50001-99999: 50000 EXP per level
  if (exp < 2466340000) {
    return 50000 + Math.floor((exp - 766340000) / 50000)
  }

  // Beyond level 99999
  return 99999 + Math.floor((exp - 2466340000) / 100000)
}

export const getExpForNextLevel = (currentLevel: number): number => {
  // Calculate total EXP needed for the next level
  return getExpRequiredForLevel(currentLevel + 1)
}

export const getExpRequiredForLevel = (level: number): number => {
  if (level <= 0) return 0
  if (level > 99999) level = 99999

  let totalExp = 0

  // Level 1-50: 300 EXP per level
  if (level > 50) {
    totalExp += 50 * 300
  } else {
    return (level - 1) * 300
  }

  // Level 51-100: 500 EXP per level
  if (level > 100) {
    totalExp += 50 * 500
  } else {
    return totalExp + (level - 50) * 500
  }

  // Level 101-500: 1000 EXP per level
  if (level > 500) {
    totalExp += 400 * 1000
  } else {
    return totalExp + (level - 100) * 1000
  }

  // Level 501-1000: 2000 EXP per level
  if (level > 1000) {
    totalExp += 500 * 2000
  } else {
    return totalExp + (level - 500) * 2000
  }

  // Level 1001-5000: 5000 EXP per level
  if (level > 5000) {
    totalExp += 4000 * 5000
  } else {
    return totalExp + (level - 1000) * 5000
  }

  // Level 5001-10000: 10000 EXP per level
  if (level > 10000) {
    totalExp += 5000 * 10000
  } else {
    return totalExp + (level - 5000) * 10000
  }

  // Level 10001-50000: 20000 EXP per level
  if (level > 50000) {
    totalExp += 40000 * 20000
  } else {
    return totalExp + (level - 10000) * 20000
  }

  // Level 50001-99999: 50000 EXP per level
  if (level <= 99999) {
    return totalExp + (level - 50000) * 50000
  }

  // Beyond level 99999: 100000 EXP per level
  totalExp += 49999 * 50000
  return totalExp + (level - 99999) * 100000
}

export const getExpRequiredForCurrentLevel = (level: number): number => {
  return getExpRequiredForLevel(level)
}

export const getLevelEmoji = (level: number): string => {
  if (level < 1) return '🌱'
  if (level <= 10) return '🌱'       // Sprout - Beginner
  if (level <= 20) return '🍃'       // Leaves - Growing
  if (level <= 30) return '🐧'       // Penguin - Cute beginner
  if (level <= 40) return '🍀'       // Clover - Lucky
  if (level <= 50) return '🌿'       // Herb - Planting roots
  if (level <= 60) return '🌵'       // Cactus - Tough
  if (level <= 70) return '🌸'       // Cherry blossom - Beautiful
  if (level <= 80) return '🌻'       // Sunflower - Bright
  if (level <= 90) return '🌺'       // Hibiscus - Exotic
  if (level <= 100) return '🌼'      // Daisy - Pure
  if (level <= 150) return '⭐'      // Star - First achievement
  if (level <= 200) return '🌟'      // Glowing star - Shining
  if (level <= 250) return '✨'      // Sparkles - Magical
  if (level <= 300) return '💫'      // Comet - Fast progress
  if (level <= 400) return '🔮'      // Crystal ball - Wise
  if (level <= 500) return '🌙'      // Moon - Night owl
  if (level <= 600) return '⚡'      // Lightning - Powerful
  if (level <= 700) return '🔥'      // Fire - Passionate
  if (level <= 800) return '💎'      // Diamond - Precious
  if (level <= 900) return '👑'      // Crown - Royal
  if (level <= 1000) return '🏆'     // Trophy - Champion
  if (level <= 1200) return '🥇'     // Gold medal - Minecraft gold
  if (level <= 1400) return '🪙'     // Gold coin - Rich
  if (level <= 1600) return '💰'     // Money bag - Wealthy
  if (level <= 1800) return '💵'     // Dollar bill - Successful
  if (level <= 2000) return '💎'     // Diamond - Premium
  if (level <= 2500) return '👸'     // Princess/Prince - Noble
  if (level <= 3000) return '🤴'     // King/Queen - Ruler
  if (level <= 3500) return '🦁'     // Lion - Mighty
  if (level <= 4000) return '🐉'     // Dragon - Legendary
  if (level <= 4500) return '🦅'     // Eagle - Soaring high
  if (level <= 5000) return '🦊'     // Fox - Clever
  if (level <= 6000) return '🔱'     // Trident - Powerful
  if (level <= 7000) return '⚜️'     // Fleur-de-lis - Elegant
  if (level <= 8000) return '🌈'     // Rainbow - Colorful journey
  if (level <= 9000) return '🎆'     // Fireworks - Celebration
  if (level <= 10000) return '🎇'    // Sparkler - Sparkling
  if (level <= 12000) return '🏅'    // Sports medal - Athletic
  if (level <= 14000) return '🎖️'    // Military medal - Honored
  if (level <= 16000) return '🏵️'    // Rosette - Decorated
  if (level <= 18000) return '🌟'    // Big star - Famous
  if (level <= 20000) return '💫'    // Big comet - Legendary
  if (level <= 25000) return '🔮'    // Magic orb - Mystical
  if (level <= 30000) return '👑'    // Crown - Supreme
  if (level <= 35000) return '🐲'    // Dragon face - Ancient
  if (level <= 40000) return '🦄'    // Unicorn - Mythical
  if (level <= 45000) return '⚔️'    // Crossed swords - Warrior
  if (level <= 50000) return '🛡️'    // Shield - Defender
  if (level <= 60000) return '🌌'    // Galaxy - Cosmic
  if (level <= 70000) return '🌠'    // Shooting star - Cosmic wish
  if (level <= 80000) return '☄️'    // Comet - Cosmic traveler
  if (level <= 90000) return '🌍'    // Earth - World master
  if (level <= 99999) return '🌎'    // Globe - Global legend
  return '🌏'                         // Ultimate level - Universe master
}

export const syncUserLevel = async (userId: string): Promise<void> => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)

  if (snapshot.exists()) {
    const userData = snapshot.val()
    const currentExp = userData.exp || 0
    const calculatedLevel = calculateLevel(currentExp)

    // Only update if level is incorrect
    if (userData.level !== calculatedLevel) {
      await set(userRef, {
        ...userData,
        level: calculatedLevel,
        updatedAt: serverTimestamp()
      })
    }
  }
}

// Delete chat message (admin only)
export const deleteChatMessage = async (messageId: string) => {
  const messageRef = ref(database, `globalChat/${messageId}`)
  await remove(messageRef)
}

// User comments history
export const getUserComments = async (userId: string): Promise<CommentItem[]> => {
  const commentsRef = ref(database, `userComments/${userId}`)
  const snapshot = await get(commentsRef)
  if (!snapshot.exists()) return []
  const comments: CommentItem[] = []
  snapshot.forEach((child) => {
    comments.push({
      id: child.key as string,
      ...child.val()
    })
  })
  return comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
}

export const onUserCommentsChange = (userId: string, callback: (comments: CommentItem[]) => void) => {
  const commentsRef = query(ref(database, `userComments/${userId}`), orderByChild('timestamp'), limitToLast(50))
  return onValue(commentsRef, (snapshot) => {
    const comments: CommentItem[] = []
    snapshot.forEach((child) => {
      comments.push({
        id: child.key as string,
        ...child.val()
      })
    })
    callback(comments.reverse())
  })
}

// Types
export interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar: string | null
  message: string
  level: number
  role?: 'user' | 'admin'
  verified?: boolean
  timestamp: number
}

export interface FavoriteAnime {
  animeId: string
  title: string
  poster: string
  status?: string
  addedAt?: number
}

export interface HistoryItem {
  episodeId: string
  animeId: string
  animeTitle: string
  episodeTitle: string
  poster: string
  episodeNumber: number
  watchedAt?: number
  progress?: number
  duration?: number // Duration in minutes
}

export interface CommentItem {
  id: string
  message: string
  timestamp?: number
}

export interface UserProfile {
  uid: string
  email: string | null
  username: string
  avatar: string | null
  banner?: string | null
  bio?: string
  level: number
  exp: number
  watchCount: number
  commentCount: number
  favoriteCount: number
  role: 'user' | 'admin'
  verified?: boolean
  tag?: string
  tagColor?: string
  createdAt: number
  updatedAt: number
}
