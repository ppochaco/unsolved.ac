import { useRef, useState } from 'react'

import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components'
import { DEFAULT_TIER_SVG, DEFAULT_USER_IMAGE_URL } from '@/constant'
import { fetchUserInfoApi } from '@/service'
import { User } from '@/types'

interface SearchUserFormProps {
  levelImages: Map<number, string>
  addUser: (user: User) => void
}

export const SearchUserForm = ({
  levelImages,
  addUser,
}: SearchUserFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const { mutate: fetchUserInfo, status } = useMutation({
    mutationFn: fetchUserInfoApi,
    onSuccess: (info) => {
      setUser({
        userId: info.handle,
        imageUrl: info.profileImageUrl ?? DEFAULT_USER_IMAGE_URL,
        levelId: info.tier,
        isSelected: true,
      })
    },
    onError: (err) => {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : '알 수 없는 에러가 발생했습니다.'

      setError(message)
      setUser(null)
    },
  })

  const searchUserId = () => {
    const userId = inputRef.current?.value.trim()

    if (!userId) {
      setError('아이디를 입력해주세요')
      setUser(null)
      return
    }

    setError(null)
    fetchUserInfo(userId)
  }

  const selectUser = (user: User) => {
    setUser(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    addUser(user)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="relative flex gap-2">
        <Input
          placeholder="baekjoon 아이디"
          ref={inputRef}
          className="w-2xs bg-white"
        />
        <Button onClick={searchUserId} disabled={status === 'pending'}>
          <MagnifyingGlassIcon className="mx-1 size-6" />
        </Button>
      </div>

      {error && (
        <div className="text-destructive ml-1 pt-1 text-sm">{error}</div>
      )}

      {user && (
        <Card className="absolute z-10 mt-2 w-fit min-w-72 gap-2 px-4 pt-0 shadow-2xl">
          <CardHeader className="px-0 pt-2">
            <CardTitle className="pt-3">유저를 선택해주세요</CardTitle>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setUser(null)
                  if (inputRef.current) {
                    inputRef.current.value = ''
                  }
                }}
                className="group rounded-full"
              >
                <Cross2Icon className="text-plum-200 group-hover:text-plum-400 size-5" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Button
              variant="secondary"
              onClick={() => selectUser(user)}
              className="flex gap-1 px-2"
            >
              <Image
                src={levelImages.get(user.levelId) ?? DEFAULT_TIER_SVG}
                width={24}
                height={24}
                className="h-5 w-5"
                alt={`${user.userId} tier image`}
              />
              <Image
                src={user.imageUrl}
                width={24}
                height={24}
                className="rounded-full object-contain"
                alt={`${user.userId} profile image`}
              />
              <div className="text-lg font-semibold">{user.userId}</div>
            </Button>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
