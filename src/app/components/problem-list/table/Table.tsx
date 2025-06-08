import Image from 'next/image'

import { DEFAULT_TIER_SVG } from '@/constant'
import { cn } from '@/lib'
import { ColoredProblem } from '@/types'

interface ProblemListTableProps {
  problems: ColoredProblem[]
  levelImages: Map<number, string>
}

export const ProblemListTable = ({
  problems,
  levelImages,
}: ProblemListTableProps) => {
  const columns = [
    { header: '레벨', accessor: 'level' },
    { header: 'ID', accessor: 'id' },
    { header: '제목', accessor: 'title' },
    { header: '푼 사람 수', accessor: 'solvedCount' },
  ]

  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.accessor} className="border-b py-2.5 font-semibold">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {problems.map((problem) => (
          <tr key={problem.id} className="w-full border-b">
            <td className="w-10 py-2.5">
              <div className="flex items-center justify-center">
                <Image
                  src={levelImages.get(problem.levelId) ?? DEFAULT_TIER_SVG}
                  width={16}
                  height={16}
                  className="object-contain"
                  alt={`solved.ac ${problem.levelId} tier`}
                />
              </div>
            </td>
            <td
              className={cn(
                'w-24 py-2.5 font-semibold',
                problem.color === 'purple' && 'text-primary',
                problem.color === 'gray' && 'text-plum-400',
              )}
            >
              {problem.id}
            </td>
            <td className="py-2.5">{problem.title}</td>
            <td className="w-20 py-2.5 text-end">{problem.solvedCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
