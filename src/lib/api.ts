import type { 
  ApiResponse, 
  HomeData, 
  AnimeDetail, 
  EpisodeDetail, 
  Genre, 
  ScheduleDay,
  Anime 
} from './types'

const API_BASE = 'https://www.sankavollerei.com/anime'

// Fallback data when API is unavailable
const fallbackGenres: Genre[] = [
  { title: 'Action', genreId: 'action', href: '/genres/action' },
  { title: 'Adventure', genreId: 'adventure', href: '/genres/adventure' },
  { title: 'Comedy', genreId: 'comedy', href: '/genres/comedy' },
  { title: 'Drama', genreId: 'drama', href: '/genres/drama' },
  { title: 'Fantasy', genreId: 'fantasy', href: '/genres/fantasy' },
  { title: 'Horror', genreId: 'horror', href: '/genres/horror' },
  { title: 'Mystery', genreId: 'mystery', href: '/genres/mystery' },
  { title: 'Romance', genreId: 'romance', href: '/genres/romance' },
  { title: 'Sci-Fi', genreId: 'sci-fi', href: '/genres/sci-fi' },
  { title: 'Slice of Life', genreId: 'slice-of-life', href: '/genres/slice-of-life' },
  { title: 'Sports', genreId: 'sports', href: '/genres/sports' },
  { title: 'Supernatural', genreId: 'supernatural', href: '/genres/supernatural' },
  { title: 'Thriller', genreId: 'thriller', href: '/genres/thriller' },
  { title: 'Isekai', genreId: 'isekai', href: '/genres/isekai' },
  { title: 'Mecha', genreId: 'mecha', href: '/genres/mecha' },
  { title: 'Music', genreId: 'music', href: '/genres/music' },
  { title: 'Psychological', genreId: 'psychological', href: '/genres/psychological' },
  { title: 'School', genreId: 'school', href: '/genres/school' },
  { title: 'Shounen', genreId: 'shounen', href: '/genres/shounen' },
  { title: 'Seinen', genreId: 'seinen', href: '/genres/seinen' },
]

const fallbackSchedule: ScheduleDay[] = [
  { day: 'Senin', anime_list: [] },
  { day: 'Selasa', anime_list: [] },
  { day: 'Rabu', anime_list: [] },
  { day: 'Kamis', anime_list: [] },
  { day: 'Jumat', anime_list: [] },
  { day: 'Sabtu', anime_list: [] },
  { day: 'Minggu', anime_list: [] },
]

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 60 }, // Cache for 1 minute for more frequent updates
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!res.ok) {
      console.warn(`API Error for ${endpoint}: ${res.status}`)
      throw new Error(`API Error: ${res.status}`)
    }
    
    return res.json()
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}:`, error)
    throw error
  }
}

export async function getHome(): Promise<HomeData> {
  try {
    const response = await fetchApi<HomeData>('/home')
    return response.data
  } catch (error) {
    console.warn('Using fallback home data')
    return {
      ongoing: { href: '/ongoing', animeList: [] },
      completed: { href: '/completed', animeList: [] }
    }
  }
}

export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  const response = await fetchApi<AnimeDetail>(`/anime/${animeId}`)
  return response.data
}

export async function getEpisode(episodeId: string): Promise<EpisodeDetail> {
  const response = await fetchApi<EpisodeDetail>(`/episode/${episodeId}`)
  return response.data
}

export async function getServerUrl(serverId: string): Promise<string> {
  const response = await fetchApi<{ url: string }>(`/server/${serverId}`)
  return response.data.url
}

export async function getGenres(): Promise<{ genreList: Genre[] }> {
  try {
    const response = await fetchApi<{ genreList: Genre[] }>('/genre')
    return response.data
  } catch (error) {
    console.warn('Using fallback genres data')
    return { genreList: fallbackGenres }
  }
}

export async function getGenreAnime(genreId: string, page: number = 1): Promise<{
  animeList: Anime[]
  pagination: { currentPage: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean } | null
}> {
  try {
    const res = await fetch(`${API_BASE}/genre/${genreId}?page=${page}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000)
    })
    const data = await res.json()
    return {
      animeList: data.data?.animeList || [],
      pagination: data.pagination
    }
  } catch (error) {
    console.warn(`Failed to fetch genre anime for ${genreId}`)
    return {
      animeList: [],
      pagination: { currentPage: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false }
    }
  }
}

export async function getSchedule(): Promise<ScheduleDay[]> {
  try {
    const response = await fetchApi<ScheduleDay[]>('/schedule')
    return response.data
  } catch (error) {
    console.warn('Using fallback schedule data')
    return fallbackSchedule
  }
}

export async function getOngoingAnime(page: number = 1): Promise<{
  animeList: Anime[]
  pagination: { currentPage: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean } | null
}> {
  try {
    const res = await fetch(`${API_BASE}/ongoing-anime?page=${page}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000)
    })
    const data = await res.json()
    return {
      animeList: data.data?.animeList || [],
      pagination: data.pagination
    }
  } catch (error) {
    console.warn('Failed to fetch ongoing anime')
    return {
      animeList: [],
      pagination: { currentPage: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false }
    }
  }
}

export async function getCompletedAnime(page: number = 1): Promise<{
  animeList: Anime[]
  pagination: { currentPage: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean } | null
}> {
  try {
    const res = await fetch(`${API_BASE}/complete-anime?page=${page}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000)
    })
    const data = await res.json()
    return {
      animeList: data.data?.animeList || [],
      pagination: data.pagination
    }
  } catch (error) {
    console.warn('Failed to fetch completed anime')
    return {
      animeList: [],
      pagination: { currentPage: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false }
    }
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const response = await fetchApi<{ animeList: Anime[] }>(`/search/${encodeURIComponent(query)}`)
    return response.data?.animeList || []
  } catch (error) {
    console.warn('Failed to search anime')
    return []
  }
}

export async function getBatchDetail(batchId: string): Promise<AnimeDetail> {
  const response = await fetchApi<AnimeDetail>(`/batch/${batchId}`)
  return response.data
}
