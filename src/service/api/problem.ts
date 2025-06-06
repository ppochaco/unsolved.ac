import { SolvedAcProblem } from '@/types'

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
      },
    },
  )

  return response.data.items
}
