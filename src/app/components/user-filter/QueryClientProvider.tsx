'use client'

import { ReactNode, Suspense } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { queryClient } from '@/lib'

import { SearchUserFormSkeleton } from './search-user-form'
import { SelectUserSkeleton } from './select-user'

export const SelectUserQueryClientProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const params = useSearchParams()
  const userIds = params.getAll('userId')

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<UserFilterSkeleton userIds={userIds} />}>
        {children}
      </Suspense>
    </QueryClientProvider>
  )
}

const UserFilterSkeleton = ({ userIds }: { userIds: string[] }) => {
  return (
    <section className="flex h-fit w-full flex-col items-center">
      <SearchUserFormSkeleton />
      <SelectUserSkeleton userIds={userIds} />
    </section>
  )
}
