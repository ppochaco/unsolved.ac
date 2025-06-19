/**
 * Represents a user from solved.ac API.
 * See: https://solvedac.github.io/unofficial-documentation/#/schemas/User
 */
type SolvedAcUser = {
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

export { type SolvedAcUser }
