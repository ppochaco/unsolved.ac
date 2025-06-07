import { SolvedAcTag } from '@/types'

import { solvedAcApi } from '../instance'

type TagListResponse = {
  count: number
  items: SolvedAcTag[]
}

export const tagListApi = async () => {
  const response = await solvedAcApi.get<TagListResponse>('/api/v3/tag/list')

  return response.data.items
}
