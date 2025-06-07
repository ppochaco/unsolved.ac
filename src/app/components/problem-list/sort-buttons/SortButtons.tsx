'use client'

import { useState } from 'react'

import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons'

import { Button } from '@/components'
import { Problem } from '@/generated/prisma'
import { cn } from '@/lib/utils'

type SortOptionAccessor = Extract<
  keyof Problem,
  'levelId' | 'id' | 'solvedCount'
>

type SortOption = {
  title: string
  accessor: SortOptionAccessor
  direction: 'desc' | 'asc'
}

const sortOptions: SortOption[] = [
  {
    title: '레벨',
    accessor: 'levelId',
    direction: 'desc',
  },
  {
    title: 'ID',
    accessor: 'id',
    direction: 'desc',
  },
  {
    title: '푼 사람 수',
    accessor: 'solvedCount',
    direction: 'desc',
  },
]

type SelectedOption = Pick<SortOption, 'accessor' | 'direction'>

export const SortProblemListButtons = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    null,
  )

  const onClickOption = (accessor: SortOptionAccessor) => {
    setSelectedOption((prev) => {
      if (prev?.accessor === accessor) {
        return {
          accessor,
          direction: prev.direction === 'desc' ? 'asc' : 'desc',
        }
      }

      return {
        accessor,
        direction: 'desc',
      }
    })
  }

  return (
    <div className="flex gap-8 py-4">
      <div className="font-bold">정렬</div>
      <ul className="flex gap-4">
        {sortOptions.map((option) => {
          const isSelected = selectedOption?.accessor === option.accessor

          return (
            <li key={option.accessor}>
              <Button
                onClick={() => onClickOption(option.accessor)}
                variant="link"
                className={cn(
                  'text-md h-fit p-0 font-normal',
                  isSelected
                    ? 'text-plum-950 font-semibold underline underline-offset-4'
                    : 'text-plum-500 hover:text-plum-700',
                )}
              >
                <span>{option.title}</span>
                {isSelected && (
                  <span className="border-plum-950 mb-[-2] ml-[-8] border-b-[1.5] pb-[2] pl-1">
                    {selectedOption?.direction === 'desc' ? (
                      <ArrowDownIcon />
                    ) : (
                      <ArrowUpIcon />
                    )}
                  </span>
                )}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
