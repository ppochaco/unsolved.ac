import { initInstance } from '@/lib'

export const solvedAcApi = initInstance({
  baseURL: 'https://solved.ac',
})

export const unsolvedApi = initInstance({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://unsolved-ac.com',
})
