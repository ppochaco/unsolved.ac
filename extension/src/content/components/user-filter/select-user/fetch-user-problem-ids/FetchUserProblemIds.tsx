import { useEffect, useMemo, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { Progress } from '@/components'
import { userQueries } from '@/services'
import { fetchUserProblemIds } from '@/services'
import { type User } from '@/types'

interface FetchUserProblemIdsProps {
  user: User
  finishFetchingProblem: (userId: string) => void
}

export const FetchUserProblemIds = ({
  user,
  finishFetchingProblem,
}: FetchUserProblemIdsProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: userQueries.problemId(user.userId),
      queryFn: ({ pageParam = 1 }) =>
        fetchUserProblemIds(user.userId, pageParam),
      getNextPageParam: (lastPage) => lastPage.nextPageToken,
      initialPageParam: 1,
    })

  const MAX_SIZE = data?.pages[0].problems.count ?? 0
  const problemIds = useMemo(
    () => data?.pages.flatMap((page) => page.problems.problemIds) ?? [],
    [data],
  )

  const progress = Math.floor((problemIds.length / MAX_SIZE) * 100) || 0
  const [isEnd, setIsEnd] = useState(false)

  useEffect(() => {
    if (status === 'pending') return
    if (isFetchingNextPage) return

    if (hasNextPage) {
      fetchNextPage()
    } else {
      setIsEnd(true)
    }
  }, [status, isFetchingNextPage, hasNextPage, fetchNextPage])

  useEffect(() => {
    if (isEnd) {
      finishFetchingProblem(user.userId)
    }
  }, [isEnd, finishFetchingProblem, user.userId])

  return (
    <div className="flex h-8 w-full items-center">
      <Progress value={progress} />
    </div>
  )
}
