import { queryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { SolvedAcUser } from '@/types'

export const fetchUserInfoApi = async (userId: string) => {
  const response = await axios.get<SolvedAcUser>('/api/users', {
    params: { userId },
  })

  return response.data
}

export const userInfoQueries = {
  all: () => ['user', 'info'],
  detailKey: (userId: string) => [...userInfoQueries.all(), userId],
  detail: (userId: string) =>
    queryOptions({
      queryKey: userInfoQueries.detailKey(userId),
      queryFn: () => fetchUserInfoApi(userId),
    }),
}

type UpdateUserProblemIdsResponse = {
  userId: string
}

export const updateUserProblemIdsApi = async (
  userId: string,
  problemIds: number[],
) => {
  const response = await axios.post<UpdateUserProblemIdsResponse>(
    `/api/users/${userId}/problem-ids`,
    {
      problemIds,
    },
  )

  return response.data
}
