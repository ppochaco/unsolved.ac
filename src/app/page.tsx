import { PROBLEMS_PER_PAGE, SORT_DIRECTIONS, SORT_OPTIONS } from '@/constant'
import { prisma } from '@/lib'
import { ColoredProblem, SortDirection, SortOption } from '@/types'

import {
  Footer,
  Header,
  ProblemFilter,
  ProblemListPaginationButtons,
  ProblemListTable,
  SelectUserQueryClientProvider,
  SortProblemListButtons,
  ToggleProblemFilterButton,
  UserFilter,
} from './components'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const params = await searchParams
  const { sort, direction, page, userId } = parseSearchParams(params)

  // TODO: 필터링 기능 추가하기
  const [levels, problems, count, userProblemIds] = await prisma.$transaction([
    prisma.level.findMany(),
    prisma.problem.findMany({
      where: { levelId: 7 },
      orderBy: {
        [sort]: direction,
      },
      take: PROBLEMS_PER_PAGE,
      skip: PROBLEMS_PER_PAGE * (page - 1),
    }),
    prisma.problem.count({ where: { levelId: 7 } }),
    prisma.userProblemId.findMany({
      where: {
        userId: {
          in: userId,
        },
      },
    }),
  ])

  const unionSet = new Set<number>() // 한 명이라도 solved
  let intersectionSet = new Set<number>() // 모두 solved

  userProblemIds.forEach(({ problemIds }) => {
    problemIds.forEach((id) => unionSet.add(id))
  })

  for (const { problemIds } of userProblemIds) {
    const currentSet = new Set(problemIds)

    if (intersectionSet.size === 0) {
      intersectionSet = currentSet
    } else {
      intersectionSet = new Set(
        [...intersectionSet].filter((id) => currentSet.has(id)),
      )
    }
  }

  const coloredProblems: ColoredProblem[] = problems.map((problem) => ({
    ...problem,
    color: unionSet.has(problem.id)
      ? intersectionSet.has(problem.id)
        ? 'black'
        : 'gray'
      : 'purple',
  }))

  const levelImages = new Map(levels.map((l) => [l.id, l.imageUrl]))

  return (
    <div className="font-inter text-plum-950 flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="hidden xl:flex">
          <ProblemFilter />
        </div>
        <div className="flex w-full min-w-0 flex-col">
          <SelectUserQueryClientProvider>
            <UserFilter levelImages={levelImages} />
          </SelectUserQueryClientProvider>
          <div className="flex xl:hidden">
            <ToggleProblemFilterButton />
          </div>
          <SortProblemListButtons sort={sort} direction={direction} />
          <div className="flex flex-col gap-4 px-4 pb-10">
            <ProblemListTable
              problems={coloredProblems}
              levelImages={levelImages}
            />
            <ProblemListPaginationButtons page={page} count={count} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function parseSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  let sort: SortOption = 'solvedCount'
  let direction: SortDirection = 'desc'
  let page = 1
  let userId: string[] = []

  for (const [key, value] of Object.entries(searchParams)) {
    if (!value) continue

    switch (key) {
      case 'sort':
        if (SORT_OPTIONS.includes(value as SortOption)) {
          sort = value as SortOption
        }
        break
      case 'direction':
        if (SORT_DIRECTIONS.includes(value as SortDirection)) {
          direction = value as SortDirection
        }
        break
      case 'page': {
        const parsed = parseInt(value as string)
        if (!isNaN(parsed)) {
          page = parsed
        }
        break
      }
      case 'userId': {
        userId = Array.isArray(value) ? value : [value]
        break
      }
    }
  }

  return { sort, direction, page, userId }
}
