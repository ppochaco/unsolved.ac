export type User = {
  userId: string
  imageUrl: string
  levelId: number
  isSelected: boolean
  isFetchingProblem: boolean
  problemIds: number[]
}

export type UserProblemIds = {
  userId: string
  problemIds: number[]
}
