import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { getDatabase, ref, push, set, get, remove, onValue, query, orderByChild, limitToLast, serverTimestamp, update } from 'firebase/database'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getMessaging, getToken, onMessage, type Messaging, type MessagePayload } from 'firebase/messaging'

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

// Initialize messaging only if supported
let messaging: Messaging | null = null
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
    messaging = getMessaging(app)
  }
} catch (error) {
  console.warn('Firebase Messaging is not supported in this environment:', error)
}

const googleProvider = new GoogleAuthProvider()

// Re-export for use in other components
export { ref, onValue, database, auth, storage, messaging }

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

export const onUserProfileChange = (userId: string, callback: (profile: UserProfile | null) => void) => {
  const userRef = ref(database, `users/${userId}`)
  return onValue(userRef, (snapshot) => {
    callback(snapshot.exists() ? { uid: userId, ...snapshot.val() } as UserProfile : null)
  })
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
  
  // Check if already favorited to avoid duplicate count
  const snapshot = await get(favRef)
  if (snapshot.exists()) return
  
  await set(favRef, {
    ...anime,
    addedAt: serverTimestamp()
  })
  
  // Update user favorite count
  await incrementUserStat(userId, 'favoriteCount')
}

export const removeFavorite = async (userId: string, animeId: string) => {
  const favRef = ref(database, `favorites/${userId}/${animeId}`)
  
  // Check if exists before removing
  const snapshot = await get(favRef)
  if (!snapshot.exists()) return
  
  await remove(favRef)
  
  // Decrement user favorite count
  const userRef = ref(database, `users/${userId}`)
  const userSnapshot = await get(userRef)
  if (userSnapshot.exists()) {
    const userData = userSnapshot.val()
    const currentCount = userData.favoriteCount || 0
    await set(userRef, {
      ...userData,
      favoriteCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp()
    })
  }
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
export const incrementUserStat = async (userId: string, stat: 'watchCount' | 'commentCount' | 'favoriteCount' | 'exp') => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    const currentValue = userData[stat] || 0

    // Premium users get 5x EXP bonus
    const isPremium = userData.isPremium || false
    const expMultiplier = isPremium ? 5 : 1
    const newValue = currentValue + (stat === 'exp' ? 10 * expMultiplier : 1)

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

// Premium/VIP functions
export const setUserPremium = async (targetUserId: string, isPremium: boolean) => {
  const userRef = ref(database, `users/${targetUserId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    const userData = snapshot.val()
    await set(userRef, {
      ...userData,
      isPremium,
      premiumSince: isPremium ? serverTimestamp() : null,
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

// Sync user stats from actual data (history, comments, favorites)
export const syncUserStats = async (userId: string): Promise<void> => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)

  if (!snapshot.exists()) return

  const userData = snapshot.val()

  // Count actual history items
  const historyRef = ref(database, `history/${userId}`)
  const historySnapshot = await get(historyRef)
  const actualWatchCount = historySnapshot.exists() ? Object.keys(historySnapshot.val()).length : 0

  // Count actual comment items
  const commentsRef = ref(database, `userComments/${userId}`)
  const commentsSnapshot = await get(commentsRef)
  const actualCommentCount = commentsSnapshot.exists() ? Object.keys(commentsSnapshot.val()).length : 0

  // Count actual favorite items
  const favoritesRef = ref(database, `favorites/${userId}`)
  const favoritesSnapshot = await get(favoritesRef)
  const actualFavoriteCount = favoritesSnapshot.exists() ? Object.keys(favoritesSnapshot.val()).length : 0

  // Update user with actual counts
  await set(userRef, {
    ...userData,
    watchCount: actualWatchCount,
    commentCount: actualCommentCount,
    favoriteCount: actualFavoriteCount,
    updatedAt: serverTimestamp()
  })
}

// Delete chat message (admin only)
export const deleteChatMessage = async (messageId: string) => {
  const messageRef = ref(database, `globalChat/${messageId}`)
  await remove(messageRef)
}

// Episode Comments Functions
export interface EpisodeComment {
  id: string
  episodeId: string
  animeId: string
  userId: string
  username: string
  avatar: string | null
  message: string
  level: number
  role?: 'user' | 'admin'
  verified?: boolean
  isPremium?: boolean
  timestamp?: number
}

export const addEpisodeComment = async (
  episodeId: string,
  animeId: string,
  userId: string,
  username: string,
  avatar: string | null,
  message: string,
  level: number,
  role: 'user' | 'admin' = 'user',
  verified: boolean = false,
  isPremium: boolean = false
) => {
  const commentsRef = ref(database, `episodeComments/${episodeId}`)
  const newCommentRef = push(commentsRef)

  await set(newCommentRef, {
    episodeId,
    animeId,
    userId,
    username,
    avatar,
    message,
    level,
    role,
    verified,
    isPremium,
    timestamp: serverTimestamp()
  })

  // Also save to user's comment history
  const commentRef = push(ref(database, `userComments/${userId}`))
  await set(commentRef, {
    message,
    timestamp: serverTimestamp()
  })

  // Update user comment count
  await incrementUserStat(userId, 'commentCount')
}

export const getEpisodeComments = async (episodeId: string): Promise<EpisodeComment[]> => {
  const commentsRef = ref(database, `episodeComments/${episodeId}`)
  const snapshot = await get(commentsRef)
  if (!snapshot.exists()) return []
  const comments: EpisodeComment[] = []
  snapshot.forEach((child) => {
    comments.push({
      id: child.key as string,
      ...child.val()
    })
  })
  return comments.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
}

export const onEpisodeCommentsChange = (
  episodeId: string,
  callback: (comments: EpisodeComment[]) => void
) => {
  const commentsRef = query(
    ref(database, `episodeComments/${episodeId}`),
    orderByChild('timestamp'),
    limitToLast(50)
  )
  return onValue(commentsRef, (snapshot) => {
    const comments: EpisodeComment[] = []
    snapshot.forEach((child) => {
      comments.push({
        id: child.key as string,
        ...child.val()
      })
    })
    callback(comments)
  })
}

export const deleteEpisodeComment = async (episodeId: string, commentId: string) => {
  const commentRef = ref(database, `episodeComments/${episodeId}/${commentId}`)
  await remove(commentRef)
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
  isPremium?: boolean
  premiumSince?: number | null
  tag?: string
  tagColor?: string
  createdAt: number
  updatedAt: number
  fcmToken?: string | null
  notificationPreferences?: {
    newEpisode?: boolean
    comments?: boolean
    replies?: boolean
    mentions?: boolean
    system?: boolean
  }
}

// Push Notification Functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Messaging is not supported')
    return null
  }

  try {
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''

    if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY_HERE') {
      console.warn('VAPID key is not configured. Please set NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env file')
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: vapidKey
    })
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

export const saveFCMToken = async (userId: string, token: string | null) => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)

  if (snapshot.exists()) {
    const userData = snapshot.val()
    await set(userRef, {
      ...userData,
      fcmToken: token,
      updatedAt: serverTimestamp()
    })
  }
}

export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) {
    console.warn('Messaging is not supported')
    return () => {}
  }
  return onMessage(messaging, callback)
}

export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<UserProfile['notificationPreferences']>
) => {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)

  if (snapshot.exists()) {
    const userData = snapshot.val()
    const currentPrefs = userData.notificationPreferences || {
      newEpisode: true,
      comments: true,
      replies: true,
      mentions: true,
      system: true
    }

    await set(userRef, {
      ...userData,
      notificationPreferences: {
        ...currentPrefs,
        ...preferences
      },
      updatedAt: serverTimestamp()
    })
  }
}

// Check if user can receive system notifications
export const canSendSystemNotification = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId)
    
    // Check if user has notification preferences
    if (!profile?.notificationPreferences?.system) {
      return false
    }
    
    // Check if user has FCM token
    if (!profile.fcmToken) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking system notification permission:', error)
    return false
  }
}

// Send system notification to a specific user
export const sendSystemNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    // Check if user can receive system notifications
    const canSend = await canSendSystemNotification(userId)
    if (!canSend) {
      console.log(`User ${userId} has system notifications disabled`)
      return false
    }

    // In a real implementation, you would send this through Firebase Cloud Messaging
    // via your backend server. For now, we'll store the notification in the database
    // which can be picked up by the client
    const notificationRef = ref(database, `notifications/${userId}`)
    const newNotificationRef = push(notificationRef)

    await set(newNotificationRef, {
      type: 'system',
      title,
      body,
      data: data || {},
      read: false,
      timestamp: serverTimestamp()
    })

    console.log(`System notification sent to user ${userId}: ${title}`)
    return true
  } catch (error) {
    console.error('Error sending system notification:', error)
    return false
  }
}

// Get user's notifications
export const getUserNotifications = async (userId: string) => {
  const notificationsRef = ref(database, `notifications/${userId}`)
  const snapshot = await get(notificationsRef)
  
  if (!snapshot.exists()) return []
  
  const notifications: any[] = []
  snapshot.forEach((child) => {
    notifications.push({
      id: child.key as string,
      ...child.val()
    })
  })
  
  return notifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
}

// Mark notification as read
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const notificationRef = ref(database, `notifications/${userId}/${notificationId}`)
  const snapshot = await get(notificationRef)
  
  if (snapshot.exists()) {
    const notification = snapshot.val()
    await set(notificationRef, {
      ...notification,
      read: true
    })
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const notificationsRef = ref(database, `notifications/${userId}`)
  const snapshot = await get(notificationsRef)
  
  if (snapshot.exists()) {
    const updates: Record<string, any> = {}
    snapshot.forEach((child) => {
      updates[`notifications/${userId}/${child.key}/read`] = true
    })
    await update(database, updates)
  }
}

// Listen to user notifications
export const onUserNotificationsChange = (
  userId: string,
  callback: (notifications: any[]) => void
) => {
  const notificationsRef = query(
    ref(database, `notifications/${userId}`),
    orderByChild('timestamp'),
    limitToLast(50)
  )
  
  return onValue(notificationsRef, (snapshot) => {
    const notifications: any[] = []
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        notifications.push({
          id: child.key as string,
          ...child.val()
        })
      })
    }
    callback(notifications.reverse())
  })
}

  
