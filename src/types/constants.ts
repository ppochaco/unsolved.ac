import { RANKS, TIERS } from '@/constant'
import { SORT_DIRECTIONS, SORT_OPTIONS } from '@/constant/problem'

export type Tier = (typeof TIERS)[number]
export type Rank = (typeof RANKS)[number]

export type SortOption = (typeof SORT_OPTIONS)[number]
export type SortDirection = (typeof SORT_DIRECTIONS)[number]
