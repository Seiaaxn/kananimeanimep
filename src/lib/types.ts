// Anime types
export interface Anime {
  title: string
  poster: string
  episodes?: number
  releaseDay?: string
  latestReleaseDate?: string
  lastReleaseDate?: string
  score?: string
  animeId: string
  href: string
  slug?: string
  url?: string
}

export interface Genre {
  title: string
  genreId: string
  href: string
}

export interface AnimeDetail {
  title: string
  poster: string
  japanese?: string
  score?: string
  producers?: string
  type?: string
  status?: string
  episodes?: number
  duration?: string
  aired?: string
  studios?: string
  batch?: string | null
  synopsis?: {
    paragraphs: string[]
    connections: string[]
  }
  genreList: Genre[]
  episodeList: Episode[]
  recommendedAnimeList?: Anime[]
}

export interface Episode {
  title: string
  eps: number
  date: string
  episodeId: string
  href: string
}

export interface EpisodeDetail {
  title: string
  animeId: string
  releaseTime?: string
  defaultStreamingUrl: string
  hasPrevEpisode: boolean
  prevEpisode?: {
    title: string
    episodeId: string
    href: string
  }
  hasNextEpisode: boolean
  nextEpisode?: {
    title: string
    episodeId: string
    href: string
  }
  server: {
    qualities: ServerQuality[]
  }
  downloadUrl?: {
    qualities: DownloadQuality[]
  }
  info?: {
    credit?: string
    encoder?: string
    duration?: string
    type?: string
    genreList?: Genre[]
    episodeList?: Episode[]
  }
}

export interface ServerQuality {
  title: string
  serverList: Server[]
}

export interface Server {
  title: string
  serverId: string
  href: string
}

export interface DownloadQuality {
  title: string
  size: string
  urls: {
    title: string
    url: string
  }[]
}

export interface ScheduleDay {
  day: string
  anime_list: {
    title: string
    slug: string
    url: string
    poster: string
  }[]
}

export interface HomeData {
  ongoing: {
    href: string
    animeList: Anime[]
  }
  completed: {
    href: string
    animeList: Anime[]
  }
}

export interface ApiResponse<T> {
  status: string
  creator: string
  statusCode: number
  statusMessage: string
  message: string
  ok: boolean
  data: T
  pagination?: {
    currentPage: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  } | null
}

// User types for local storage
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  level: number
  exp: number
  totalExp: number
  rank?: string
  role?: string
  createdAt: string
}

export interface WatchHistory {
  animeId: string
  animeTitle: string
  poster: string
  episodeId: string
  episodeNumber: number
  watchedAt: string
  progress?: number
}

export interface Favorite {
  animeId: string
  animeTitle: string
  poster: string
  addedAt: string
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  level: number
  message: string
  createdAt: string
}
