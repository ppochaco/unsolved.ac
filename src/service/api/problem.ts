import { SolvedAcProblem } from '@/types'
import { solvedAcApi } from '../instance'

const START_LEVEL = 6 // 실버5
const END_LEVEL = 20 // 플레1

type SearchProblemResponse = {
  count: number
  items: SolvedAcProblem[]
}

export const levelProblemApi = async () => {
  const response = await solvedAcApi.get<SearchProblemResponse>(
    `/api/v3/search/problem?query=(*${START_LEVEL}...${END_LEVEL})`,
  )

  return response.data.items
}
