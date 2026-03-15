// Route segment config - must be at the top
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import { Suspense } from 'react'
import { UserContent, LoadingState } from './user-content'

export default function UserPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UserContent />
    </Suspense>
  )
}
