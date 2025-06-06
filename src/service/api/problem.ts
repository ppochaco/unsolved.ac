import { END_VALUE, START_VALUE } from '@/constant'
import { SolvedAcProblem } from '@/types'

import { solvedAcApi } from '../instance'

type SearchProblemResponse = {
  count: number
  items: SolvedAcProblem[]
}

export const levelProblemApi = async () => {
  const response = await solvedAcApi.get<SearchProblemResponse>(
    `/api/v3/search/problem?query=(*${START_VALUE}..${END_VALUE})`,
  )

  return response.data.items
}
