import axios from 'axios'

import { SolvedAcUser } from '@/types'

export const fetchUserInfoApi = async (
  userId: string,
): Promise<SolvedAcUser> => {
  const { data } = await axios.get<SolvedAcUser>('/api/user', {
    params: { userId },
  })

  return data
}
