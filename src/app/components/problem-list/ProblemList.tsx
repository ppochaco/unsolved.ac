import { PROBLEMS_PER_PAGE } from '@/constant'
import { Level } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'
import { SortDirection, SortOption } from '@/types'

import { ProblemListPaginationButtons } from './pagination-buttons'
import { ProblemListTable } from './table'

interface ProblemListProps {
  levels: Level[]
  page: number
  sort: SortOption
  direction: SortDirection
}

export const ProblemList = async ({
  levels,
  page,
  sort,
  direction,
}: ProblemListProps) => {
  // TODO. 필터링 추가
  const [problems, count] = await prisma.$transaction([
    prisma.problem.findMany({
      where: { levelId: 2 },
      orderBy: {
        [sort]: direction,
      },
      take: PROBLEMS_PER_PAGE,
      skip: PROBLEMS_PER_PAGE * (page - 1),
    }),
    prisma.problem.count({ where: { levelId: 2 } }),
  ])

  const columns = [
    { header: '레벨', accessor: 'level' },
    { header: 'ID', accessor: 'id' },
    { header: '제목', accessor: 'title' },
    { header: '푼 사람 수', accessor: 'solvedCount' },
  ]

  return (
    <div className="flex flex-col gap-4 px-4 pb-10">
      <ProblemListTable columns={columns} problems={problems} levels={levels} />
      <ProblemListPaginationButtons page={page} count={count} />
    </div>
  )
}
