import { RANKS, SORT_DIRECTIONS, SORT_OPTIONS, TIERS } from '@/constant'

export type Tier = (typeof TIERS)[number]
export type Rank = (typeof RANKS)[number]

export type SortOption = (typeof SORT_OPTIONS)[number]
export type SortDirection = (typeof SORT_DIRECTIONS)[number]
