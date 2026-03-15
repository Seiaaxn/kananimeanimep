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
  await set(historyRef, {
    ...episode,
    watchedAt: serverTimestamp()
  })
  // Update user stats
  await incrementUserStat(userId, 'watchCount')
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
      level: stat === 'exp' ? Math.floor(newValue / 100) + 1 : userData.level || 1,
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


