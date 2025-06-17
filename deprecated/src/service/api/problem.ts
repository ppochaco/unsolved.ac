import { queryOptions } from '@tanstack/react-query'

import { PROBLEMS_PER_PAGE } from '@/constant'

import { unsolvedApi } from '../instance'

type UserProblemResponse = {
  count: number
  problemIds: number[]
}

export const fetchUserProblemPaging = async (userId: string, page: number) => {
  const response = await unsolvedApi.get<UserProblemResponse>('/api/problems', {
    params: { userId, page },
  })
  const totalPage = Math.ceil(response.data.count / PROBLEMS_PER_PAGE)

  return {
    problems: response.data,
    nextPageToken: page < totalPage ? page + 1 : undefined,
  }
}

export const userProblemQueries = {
  all: () => ['user', 'problem'],
  listAllKey: (userId: string) => [...userProblemQueries.all(), userId],
  listKey: (userId: string, page: number) => [
    ...userProblemQueries.listAllKey(userId),
    page,
  ],
  list: (userId: string, page: number) =>
    queryOptions({
      queryKey: userProblemQueries.listKey(userId, page),
      queryFn: () => fetchUserProblemPaging(userId, page),
    }),
}
