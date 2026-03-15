import { NextRequest, NextResponse } from 'next/server'

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyActmXTykTLOnwaGJ2tbMpTnb0pg-1floU",
  storageBucket: "kanachat-ffeb7.firebasestorage.app",
  databaseURL: "https://kanachat-ffeb7-default-rtdb.firebaseio.com",
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const type = formData.get('type') as string
    const idToken = formData.get('idToken') as string

    console.log('Upload request:', { 
      fileName: file?.name, 
      fileType: file?.type, 
      fileSize: file?.size,
      userId, 
      type,
      hasToken: !!idToken
    })

    if (!file || !userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields', details: `file: ${!!file}, userId: ${!!userId}, type: ${!!type}` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').substring(0, 50)
    const fileName = `${timestamp}_${safeName}`
    
    // Create storage path based on type
    let path: string
    switch (type) {
      case 'avatar':
        path = `avatars/${userId}/${fileName}`
        break
      case 'banner':
        path = `banners/${userId}/${fileName}`
        break
      case 'sticker':
        path = `stickers/${userId}/${fileName}`
        break
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        )
    }

    console.log('Uploading to path:', path)

    // Upload to Firebase Storage using REST API with auth token
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o?name=${encodeURIComponent(path)}`
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'Authorization': `Bearer ${idToken}`,
      },
      body: buffer
    })

    const responseText = await uploadResponse.text()
    console.log('Firebase Storage response:', uploadResponse.status, responseText)

    if (!uploadResponse.ok) {
      console.error('Firebase upload error:', responseText)
      // Fall back to storing base64 in database
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      console.log('Falling back to base64 storage')
      return NextResponse.json({
        success: true,
        url: dataUrl,
        isBase64: true,
        message: 'Image stored as base64 (Storage upload failed)'
      })
    }

    let uploadResult
    try {
      uploadResult = JSON.parse(responseText)
    } catch {
      uploadResult = {}
    }
    
    console.log('Upload result:', uploadResult)

    // Construct the download URL
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o/${encodeURIComponent(path)}?alt=media`

    return NextResponse.json({
      success: true,
      url: downloadURL,
      path,
      isBase64: false
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: String(error) },
      { status: 500 }
    )
  }
}
