import { NextRequest, NextResponse } from 'next/server'
import { getCompletedAnime } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  try {
    const data = await getCompletedAnime(page)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch completed anime' },
      { status: 500 }
    )
  }
}
