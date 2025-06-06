import { Tier } from '@/types'

export const TIER_START_VALUE: Record<Tier, number> = {
  SILVER: 6,
  GOLD: 11,
  PLATINUM: 16,
}

export const TIER_DISPLAY_NAME: Record<Tier, string> = {
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
}
