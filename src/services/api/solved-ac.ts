import type { SolvedAcProblem, SolvedAcUser } from '@/types'

import { solvedAcApi } from '../instance'

const fetchSolvedAcUserInfoApi = async (userId: string) => {
  const response = await solvedAcApi.get<SolvedAcUser>('/api/v3/user/show', {
    params: { handle: userId },
  })

  return response.data
}

type SearchProblemResponse = {
  count: number
  items: SolvedAcProblem[]
}

const fetchSolvedAcUserProblemApi = async (userId: string, page: number) => {
  const response = await solvedAcApi.get<SearchProblemResponse>(
    '/api/v3/search/problem',
    {
      params: {
        query: `s@${userId}`,
        page,
      },
    },
  )

  return response.data
}

export { fetchSolvedAcUserInfoApi, fetchSolvedAcUserProblemApi }
