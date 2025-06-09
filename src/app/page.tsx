import {
  END_LEVEL_ID,
  PROBLEMS_PER_PAGE,
  SORT_DIRECTIONS,
  SORT_OPTIONS,
  START_LEVEL_ID,
} from '@/constant'
import { prisma } from '@/lib'
import { ColoredProblem, SortDirection, SortOption } from '@/types'

import {
  Footer,
  Header,
  ProblemFilter,
  ProblemFilterSheet,
  ProblemListPaginationButtons,
  ProblemListTable,
  SelectUserQueryClientProvider,
  SortProblemListButtons,
  UserFilter,
} from './components'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>
}) {
  const params = await searchParams
  const { sort, direction, page, userId, startLevel, endLevel, tag } =
    parseSearchParams({ params })

  const [levels, problems, count, userProblemIds, problemLevels, tags] =
    await prisma.$transaction([
      prisma.level.findMany(),
      prisma.problem.findMany({
        where: {
          levelId: {
            gte: startLevel < endLevel ? startLevel : endLevel,
            lte: startLevel < endLevel ? endLevel : startLevel,
          },
          ...(tag
            ? {
                ProblemTags: {
                  some: {
                    tag: {
                      key: tag,
                    },
                  },
                },
              }
            : {}),
        },
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
      prisma.level.findMany({
        where: {
          id: {
            gte: START_LEVEL_ID, // 실버 5
            lte: END_LEVEL_ID, // 골드 1
          },
        },
      }),
      prisma.tag.findMany(),
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
          <ProblemFilter levels={problemLevels} tags={tags} />
        </div>
        <div className="flex w-full min-w-0 flex-col px-2">
          <SelectUserQueryClientProvider>
            <UserFilter levelImages={levelImages} />
          </SelectUserQueryClientProvider>
          <div className="flex items-center">
            <div className="flex xl:hidden">
              <ProblemFilterSheet levels={problemLevels} tags={tags} />
            </div>
            <span className="text-plum-500 px-4">{count}문제</span>
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

function parseSearchParams({ params }: { params: { id: string } }) {
  let sort: SortOption = 'solvedCount'
  let direction: SortDirection = 'desc'
  let page = 1
  let userId: string[] = []
  let startLevel = START_LEVEL_ID
  let endLevel = END_LEVEL_ID
  let tag = null

  for (const [key, value] of Object.entries(params)) {
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
        page = Number.isNaN(Number(value)) ? page : Number(value)
        break
      }
      case 'userId': {
        userId = Array.isArray(value) ? value : [value]
        break
      }
      case 'startLevel': {
        startLevel = Number.isNaN(Number(value)) ? startLevel : Number(value)
        break
      }
      case 'endLevel': {
        endLevel = Number.isNaN(Number(value)) ? endLevel : Number(value)
        break
      }
      case 'tag': {
        tag = value as string
        break
      }
    }
  }

  return { sort, direction, page, userId, startLevel, endLevel, tag }
}
