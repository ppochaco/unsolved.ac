/**
 * Represents a problem from solved.ac API.
 * See: https://solvedac.github.io/unofficial-documentation/#/schemas/Problem
 */
export type SolvedAcProblem = {
  problemId: number
  titleKo: string
  titles: SolvedAcTitle[]
  isSolvable: boolean
  isPartial: boolean
  acceptedUserCount: number
  level: number
  votedUserCount: number
  sprout: boolean
  givesNoRating: boolean
  isLevelLocked: boolean
  averageTries: number
  official: boolean
  tags: SolvedAcTag[]
  metadata: object
}

type SolvedAcLanguage = 'ko' | 'en' | 'ja'

type SolvedAcTitle = {
  language: SolvedAcLanguage
  languageDisplayName: string
  title: string
  isOriginal: boolean
}

/**
 * Represents a problem tag from solved.ac API.
 * See: https://solvedac.github.io/unofficial-documentation/#/schemas/ProblemTag
 */
export type SolvedAcTag = {
  key: string
  isMeta: boolean
  bojTagId: number
  problemCount: number
  displayNames: [
    {
      language: SolvedAcLanguage
      name: string
      short: string
    },
  ]
  aliases: [
    {
      alias?: string
    },
  ]
}

/**
 * Represents a user from solved.ac API.
 * See: https://solvedac.github.io/unofficial-documentation/#/schemas/User
 */
export type SolvedAcUser = {
  handle: string
  bio: string
  verified: boolean
  badgeId: string | null
  backgroundId: string
  profileImageUrl: string | null
  solvedCount: number
  voteCount: number
  class: number
  classDecoration: string
  rivalCount: number
  reverseRivalCount: number
  tier: number
  rating: number
  ratingByProblemsSum: number
  ratingByClass: number
  ratingBySolvedCount: number
  ratingByVoteCount: number
  arenaTier: number
  arenaRating: number
  arenaMaxTier: number
  arenaMaxRating: number
  arenaCompetedRoundCount: number
  maxStreak: number
  coins: number
  stardusts: number
  joinedAt: string
  bannedUntil: string
  proUntil: string
  rank: number
  isRival: boolean
  isReverseRival: boolean
  blocked: boolean
  reverseBlocked: boolean
}
