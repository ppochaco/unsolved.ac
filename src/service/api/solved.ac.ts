import { SolvedAcProblem } from '@/types'
import { SolvedAcTag } from '@/types'
import { SolvedAcUser } from '@/types/solvedac'

import { solvedAcApi } from '../instance'

type SearchProblemRequestParams = {
  value: number
  page: number
}

type SearchProblemResponse = {
  count: number
  items: SolvedAcProblem[]
}

export const levelProblemApi = async ({
  value,
  page,
}: SearchProblemRequestParams) => {
  const response = await solvedAcApi.get<SearchProblemResponse>(
    '/api/v3/search/problem',
    {
      params: {
        query: `(*${value}..${value})`,
        page,
        sort: 'solved',
        direction: 'desc',
      },
    },
  )

  return response.data.items
}

export const userProblemApi = async ({ userId }: { userId: string }) => {
  const response = await solvedAcApi.get<SearchProblemResponse>(
    '/api/v3/search/problem',
    {
      params: {
        query: `s@${userId}`,
      },
    },
  )

  return response.data.items
}

type TagListResponse = {
  count: number
  items: SolvedAcTag[]
}

export const tagListApi = async () => {
  const response = await solvedAcApi.get<TagListResponse>('/api/v3/tag/list')

  return response.data.items
}

export const userApi = async ({ userId }: { userId: string }) => {
  const response = await solvedAcApi.get<SolvedAcUser>('/api/v3/user/show', {
    params: { handle: userId },
  })

  return response.data
}
