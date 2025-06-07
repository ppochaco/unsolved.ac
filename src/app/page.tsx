import { SORT_DIRECTIONS, SORT_OPTIONS } from '@/constant'
import { prisma } from '@/lib'
import { SortDirection, SortOption } from '@/types'

import {
  Footer,
  Header,
  ProblemFilter,
  ProblemList,
  SortProblemListButtons,
  ToggleProblemFilterButton,
  UserFilter,
} from './components'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const { sort, page, direction } = await searchParams
  const levels = await prisma.level.findMany()

  const validSort = getValidSort(sort)
  const validDirection = getValidDirection(direction)

  return (
    <div className="font-inter text-plum-950 flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="hidden xl:flex">
          <ProblemFilter />
        </div>
        <div className="flex w-full flex-col">
          <UserFilter />
          <div className="flex xl:hidden">
            <ToggleProblemFilterButton />
          </div>
          <SortProblemListButtons sort={validSort} direction={validDirection} />
          <ProblemList
            levels={levels}
            page={getValidPage(page)}
            sort={validSort}
            direction={validDirection}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

function isSortOption(value: string): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
}

function getValidSort(value?: string): SortOption {
  if (value === undefined) return 'solvedCount'

  if (isSortOption(value)) {
    return value
  }

  return 'solvedCount'
}

function isDirection(value: string): value is SortDirection {
  return SORT_DIRECTIONS.includes(value as SortDirection)
}

function getValidDirection(value?: string) {
  if (value === undefined) return 'desc'

  if (isDirection(value)) {
    return value
  }

  return 'desc'
}

function getValidPage(value?: string) {
  const parsed = parseInt(value || '')
  return Number.isNaN(parsed) ? 1 : parsed
}
