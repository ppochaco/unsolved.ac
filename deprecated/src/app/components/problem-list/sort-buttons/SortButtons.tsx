'use client'

import { useState } from 'react'

import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'

import { Button } from '@/components'
import { cn } from '@/lib'
import { SortDirection, SortOption } from '@/types'

type Option = {
  title: string
  accessor: SortOption
  direction: SortDirection
}

type SelectedOption = Pick<Option, 'accessor' | 'direction'>

const options: Option[] = [
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

interface SortProblemListButtonsProps {
  sort: SortOption
  direction: SortDirection
}

export const SortProblemListButtons = ({
  sort,
  direction,
}: SortProblemListButtonsProps) => {
  const router = useRouter()

  const [selectedOption, setSelectedOption] = useState<SelectedOption>({
    accessor: sort,
    direction,
  })

  const changeSort = (newSort: SortOption, newDirection: SortDirection) => {
    const params = new URLSearchParams(window.location.search)
    params.set('sort', newSort)
    params.set('direction', newDirection)
    router.push(`${window.location.pathname}?${params}`)
  }

  const onClickOption = (accessor: SortOption) => {
    const direction: SortDirection =
      accessor === selectedOption?.accessor
        ? selectedOption?.direction === 'desc'
          ? 'asc'
          : 'desc'
        : 'desc'

    setSelectedOption({ accessor, direction })
    changeSort(accessor, direction)
  }

  return (
    <div className="flex gap-8 py-4">
      <div className="font-bold">정렬</div>
      <ul className="flex gap-4">
        {options.map((option) => {
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
