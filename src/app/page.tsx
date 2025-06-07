import { PROBLEMS_PER_PAGE, SORT_DIRECTIONS, SORT_OPTIONS } from '@/constant'
import { prisma } from '@/lib'
import { SortDirection, SortOption } from '@/types'

import {
  Footer,
  Header,
  ProblemFilter,
  ProblemListPaginationButtons,
  ProblemListTable,
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

  const validSort = getValidSort(sort)
  const validDirection = getValidDirection(direction)
  const vaildPage = getValidPage(page)

  // TODO: 필터링 기능 추가하기
  const [levels, problems, count] = await prisma.$transaction([
    prisma.level.findMany(),
    prisma.problem.findMany({
      where: { levelId: 2 },
      orderBy: {
        [validSort]: direction,
      },
      take: PROBLEMS_PER_PAGE,
      skip: PROBLEMS_PER_PAGE * (vaildPage - 1),
    }),
    prisma.problem.count({ where: { levelId: 2 } }),
  ])

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
          <div className="flex flex-col gap-4 px-4 pb-10">
            <ProblemListTable problems={problems} levels={levels} />
            <ProblemListPaginationButtons page={vaildPage} count={count} />
          </div>
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
