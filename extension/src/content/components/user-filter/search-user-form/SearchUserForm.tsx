import { useRef, useState } from 'react'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'

import { Button, Input } from '@/components'

export type User = {
  userId: string
  imageUrl: string
  levelId: number
  isSelected: boolean
  isFetchingProblem: boolean
}

export const SearchUserForm = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const searchUserId = () => {
    const userId = inputRef.current?.value.trim()

    if (!userId) {
      setError('아이디를 입력해주세요')
      return
    }

    setError(null)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="relative flex gap-2">
        <Input
          placeholder="baekjoon 아이디"
          id="userId"
          ref={inputRef}
          className="w-2xs bg-white"
        />
        <Button onClick={searchUserId}>
          <MagnifyingGlassIcon className="mx-1 size-6" />
        </Button>
      </div>

      {error && (
        <div className="text-destructive ml-1 pt-1 text-sm">{error}</div>
      )}
    </form>
  )
}
