import { NextRequest, NextResponse } from 'next/server'
import { sendSystemNotification } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { userId, title, message, data } = body

    // Validate required fields
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message' },
        { status: 400 }
      )
    }

    // Send system notification
    const success = await sendSystemNotification(userId, title, message, data)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'System notification sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send system notification. User may have notifications disabled or no FCM token.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error sending system notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
