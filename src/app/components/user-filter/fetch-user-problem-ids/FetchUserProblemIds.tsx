import { useEffect, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchUserProblemPaging, userProblemQueries } from '@/service'

interface FetchUserProblemIdsProps {
  userId: string
  setProgress: (p: number) => void
  resetUser: (userId: string, problemIds: number[]) => void
}

export const FetchUserProblemIds = ({
  userId,
  setProgress,
  resetUser,
}: FetchUserProblemIdsProps) => {
  const [isEnd, setIsEnd] = useState(false)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: userProblemQueries.listAllKey(userId),
      queryFn: ({ pageParam = 1 }) => fetchUserProblemPaging(userId, pageParam),
      getNextPageParam: (lastPage) => lastPage.nextPageToken,
      initialPageParam: 1,
    })
  const MAX_SIZE = data?.pages[0].problems.count
  const problems = data?.pages.flatMap((page) => page.problems.problemIds)

  useEffect(() => {
    if (isEnd) {
      resetUser(userId, problems ?? [])
      setIsEnd(false)
    }
  }, [isEnd, problems, resetUser, userId])

  useEffect(() => {
    if (problems && MAX_SIZE) {
      const progress = Math.floor((problems.length / MAX_SIZE) * 100)
      setProgress(progress)
    }
  }, [MAX_SIZE, setProgress, problems])

  useEffect(() => {
    if (status === 'pending') return
    if (isFetchingNextPage) return
    if (hasNextPage) {
      fetchNextPage()
    } else {
      setIsEnd(true)
    }
  }, [status, isFetchingNextPage, hasNextPage, fetchNextPage])

  return null
}
