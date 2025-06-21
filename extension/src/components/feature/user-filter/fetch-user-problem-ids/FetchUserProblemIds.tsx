import { useEffect, useMemo, useState } from 'react'

import { useInfiniteQuery, useMutation } from '@tanstack/react-query'

import { Progress } from '@/components'
import {
  addUserProblemIdsApi,
  fetchUserProblemIdsApi,
  storageQueries,
  userQueries,
} from '@/services'
import { type User } from '@/types'

interface FetchUserProblemIdsProps {
  user: User
  finishFetchingProblem: ({
    userId,
    problemIds,
  }: {
    userId: string
    problemIds: number[]
  }) => void
}

export const FetchUserProblemIds = ({
  user,
  finishFetchingProblem,
}: FetchUserProblemIdsProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: userQueries.problemIds(user.userId),
      queryFn: ({ pageParam = 1 }) =>
        fetchUserProblemIdsApi(user.userId, pageParam),
      getNextPageParam: (lastPage) => lastPage.nextPageToken,
      initialPageParam: 1,
    })

  const { mutate: storeProblemIds } = useMutation({
    mutationFn: ({
      userId,
      problemIds,
    }: {
      userId: string
      problemIds: number[]
    }) => addUserProblemIdsApi(userId, problemIds),
    mutationKey: storageQueries.userProblemIds(user.userId),
    onSuccess: () => {
      finishFetchingProblem({ userId: user.userId, problemIds })
    },
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
      storeProblemIds({ userId: user.userId, problemIds })
    }
  }, [isEnd, finishFetchingProblem, user.userId, problemIds, storeProblemIds])

  return (
    <div className="flex h-8 w-full items-center">
      <Progress value={progress} />
    </div>
  )
}
