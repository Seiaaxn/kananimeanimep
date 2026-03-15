// Route segment config - must be at the top
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import { Suspense } from 'react'
import { SearchContent, LoadingState } from './search-content'

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchContent />
    </Suspense>
  )
}
