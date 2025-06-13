import { useEffect, useMemo, useState } from 'react'

import { CheckIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'

import {
  fetchUserProblemPaging,
  updateUserProblemIdsApi,
  userProblemQueries,
} from '@/service'
import { User } from '@/types'

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
      queryKey: userProblemQueries.listAllKey(user.userId),
      queryFn: ({ pageParam = 1 }) =>
        fetchUserProblemPaging(user.userId, pageParam),
      getNextPageParam: (lastPage) => lastPage.nextPageToken,
      initialPageParam: 1,
    })

  const { mutate: updateUserProblemIds } = useMutation({
    mutationFn: ({
      userId,
      problemIds,
    }: {
      userId: string
      problemIds: number[]
    }) => updateUserProblemIdsApi(userId, problemIds),
    onSuccess: (result) => {
      finishFetchingProblem(result.userId)
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
      updateUserProblemIds({ userId: user.userId, problemIds })
    }
  }, [isEnd, updateUserProblemIds, user.userId, problemIds])

  return (
    <div className="relative size-21 overflow-hidden rounded-full bg-white">
      <CheckIcon className="absolute inset-0 z-5 m-auto size-21 text-white" />
      <div
        className="bg-primary absolute bottom-0 left-0 z-0 w-full transition-all duration-300"
        style={{ height: `${progress}%` }}
      />
    </div>
  )
}
