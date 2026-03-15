import { NextRequest, NextResponse } from 'next/server'
import { getGenreAnime } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genreId = searchParams.get('genreId')
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  if (!genreId) {
    return NextResponse.json(
      { error: 'Genre ID is required' },
      { status: 400 }
    )
  }
  
  try {
    const data = await getGenreAnime(genreId, page)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch genre anime' },
      { status: 500 }
    )
  }
}
