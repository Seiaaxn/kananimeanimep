import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pages = []
  const maxVisible = 5
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}
      
      {start > 1 && (
        <>
          <Link
            href={`${baseUrl}?page=1`}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors text-sm"
          >
            1
          </Link>
          {start > 2 && (
            <span className="text-muted-foreground">...</span>
          )}
        </>
      )}
      
      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          )}
        >
          {page}
        </Link>
      ))}
      
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="text-muted-foreground">...</span>
          )}
          <Link
            href={`${baseUrl}?page=${totalPages}`}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors text-sm"
          >
            {totalPages}
          </Link>
        </>
      )}
      
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
