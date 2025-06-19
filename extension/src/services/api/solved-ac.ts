import type { SolvedAcUser } from '@/types'

import { solvedAcApi } from '../instance'

const fetchUserInfoApi = async (userId: string) => {
  const response = await solvedAcApi.get<SolvedAcUser>('/api/v3/user/show', {
    params: { handle: userId },
  })

  return response.data
}

const solvedAcQueries = {
  all: () => ['solved-ac'] as const,
  userInfo: () => [...solvedAcQueries.all(), 'user', 'info'] as const,
}

export { fetchUserInfoApi, solvedAcQueries }
