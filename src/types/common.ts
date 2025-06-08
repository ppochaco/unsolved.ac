import { Problem } from '@/generated/prisma'

export type User = {
  userId: string
  imageUrl: string
  levelId: number
  isSelected: boolean
}

export type ColoredProblem = Problem & { color: 'black' | 'gray' | 'purple' }
