'use client'

import { useRouter } from 'next/navigation'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components'
import { PROBLEMS_PER_PAGE } from '@/constant'

interface ProblemListPaginationButtonsProps {
  page: number
  count: number
}

export const ProblemListPaginationButtons = ({
  page,
  count,
}: ProblemListPaginationButtonsProps) => {
  const router = useRouter()

  const MAX_PAGE = Math.ceil(count / PROBLEMS_PER_PAGE)

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', newPage.toString())
    router.push(`${window.location.pathname}?${params}`)
  }

  const PAGE_RANGE_SIZE = 5
  const pageRange = getPageRange(PAGE_RANGE_SIZE, page, MAX_PAGE)

  return (
    <Pagination className="py-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
          />
        </PaginationItem>
        {pageRange[0] > 1 && (
          <div className="flex">
            <PaginationItem onClick={() => changePage(1)}>
              <PaginationLink>1</PaginationLink>
            </PaginationItem>
            <PaginationEllipsis />
          </div>
        )}
        {pageRange.map((pageIndex) => (
          <PaginationItem key={pageIndex} onClick={() => changePage(pageIndex)}>
            <PaginationLink isActive={page === pageIndex}>
              {pageIndex}
            </PaginationLink>
          </PaginationItem>
        ))}
        {pageRange[pageRange.length - 1] < MAX_PAGE && (
          <div className="flex">
            <PaginationEllipsis />
            <PaginationItem onClick={() => changePage(MAX_PAGE)}>
              <PaginationLink>{MAX_PAGE}</PaginationLink>
            </PaginationItem>
          </div>
        )}
        <PaginationItem>
          <PaginationNext
            disabled={page === MAX_PAGE}
            onClick={() => changePage(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

const getPageRange = (size: number, page: number, endPage: number) => {
  const half = Math.floor(size / 2)
  let start = Math.max(1, page - half)
  let end = start + size - 1

  if (end > endPage) {
    end = endPage
    start = Math.max(1, end - size + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
