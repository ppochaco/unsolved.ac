import axios from 'axios'

import { SolvedAcUser } from '@/types'

export const fetchUserInfoApi = async (userId: string) => {
  const response = await axios.get<SolvedAcUser>('/api/users', {
    params: { userId },
  })

  return response.data
}
