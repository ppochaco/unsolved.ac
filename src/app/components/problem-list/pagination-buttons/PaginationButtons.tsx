import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components'

interface ProblemListPaginationButtonsProps {
  page: number
  count: number
}

// TODO: 공통 constant로 분리하기
const ITEM_PER_PAGE = 10

export const ProblemListPaginationButtons = ({
  page,
  count,
}: ProblemListPaginationButtonsProps) => {
  const MAX_PAGE = Math.ceil(count / ITEM_PER_PAGE)

  return (
    <Pagination className="py-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" disabled={page <= 1} />
        </PaginationItem>
        {Array.from({ length: MAX_PAGE }, (_, index) => {
          const pageIndex = index + 1

          return (
            <PaginationItem key={pageIndex}>
              <PaginationLink href="#" isActive={page === pageIndex}>
                {pageIndex}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        <PaginationItem>
          <PaginationNext href="#" disabled={page === MAX_PAGE} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
