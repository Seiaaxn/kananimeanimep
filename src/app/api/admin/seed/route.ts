import { NextResponse } from 'next/server'
import { getDatabase, ref, get, set, serverTimestamp } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyActmXTykTLOnwaGJ2tbMpTnb0pg-1floU",
  authDomain: "kanachat-ffeb7.firebaseapp.com",
  databaseURL: "https://kanachat-ffeb7-default-rtdb.firebaseio.com",
  projectId: "kanachat-ffeb7",
  storageBucket: "kanachat-ffeb7.firebasestorage.app",
  messagingSenderId: "755917977291",
  appId: "1:755917977291:web:9b0bf4da0d64536697cd4e"
}

// Admin credentials
const ADMIN_EMAIL = 'ryu694602@gmail.com'

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const database = getDatabase(app)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email } = body

    // Verify this is the admin email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if user exists
    const userRef = ref(database, `users/${userId}`)
    const snapshot = await get(userRef)

    if (snapshot.exists()) {
      // Update existing user to admin
      const userData = snapshot.val()
      await set(userRef, {
        ...userData,
        role: 'admin',
        verified: true,
        tag: 'Admin',
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new admin user
      await set(userRef, {
        uid: userId,
        email: email,
        username: 'Admin',
        avatar: null,
        banner: null,
        level: 9999,
        exp: 999900,
        watchCount: 0,
        commentCount: 0,
        favoriteCount: 0,
        role: 'admin',
        verified: true,
        tag: 'Admin',
        createdAt: Date.now(),
        updatedAt: serverTimestamp()
      })
    }

    return NextResponse.json({ success: true, message: 'Admin account created/updated successfully' })
  } catch (error) {
    console.error('Error seeding admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Admin seed endpoint. Send POST request with userId and email to create admin account.',
    adminEmail: ADMIN_EMAIL 
  })
}
