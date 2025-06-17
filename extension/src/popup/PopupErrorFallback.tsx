import type { FallbackProps } from 'react-error-boundary'

import { Button } from '@/components'

export const PopupErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  return (
    <div className="w-60 px-4 py-5 text-center">
      <h2 className="mb-3 text-xl font-bold">unsolved-ac</h2>
      <p className="text-destructive mb-2 text-sm">
        {error.message || '확장 프로그램에 문제가 발생했습니다'}
      </p>
      <Button
        variant="outline"
        onClick={() => {
          resetErrorBoundary()
          window.location.reload()
        }}
      >
        다시시도
      </Button>
    </div>
  )
}
