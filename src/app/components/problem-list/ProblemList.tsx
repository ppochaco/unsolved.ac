import { Level } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'

import { SortProblemListButtons } from './sort-buttons'
import { ProblemListTable } from './table'

interface ProblemListProps {
  levels: Level[]
}

export const ProblemList = async ({ levels }: ProblemListProps) => {
  // TODO: param에서 페이징, 필터링, 정렬 적용하기
  const problems = await prisma.problem.findMany({
    where: { levelId: 2 },
    orderBy: {
      solvedCount: 'desc',
    },
    take: 10,
  })

  const columns = [
    { header: '레벨', accessor: 'level' },
    { header: 'ID', accessor: 'id' },
    { header: '제목', accessor: 'title' },
    { header: '푼 사람 수', accessor: 'solvedCount' },
  ]

  return (
    <div className="flex flex-col gap-4 px-4">
      <SortProblemListButtons />
      <ProblemListTable columns={columns} problems={problems} levels={levels} />
    </div>
  )
}
