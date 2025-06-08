import { useRef, useState } from 'react'

import { AvatarIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components'
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
        imageUrl: info.profileImageUrl,
        levelId: info.tier,
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
    addUser(user)
    setUser(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex gap-2">
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
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>유저를 선택해주세요</CardTitle>
            <CardContent className="px-0 pt-1">
              <Button
                variant="secondary"
                onClick={() => selectUser(user)}
                className="flex gap-1"
              >
                <Image
                  src={
                    levelImages.get(user.levelId) ?? levelImages.get(0) ?? ''
                  }
                  width={18}
                  height={18}
                  alt={`${user.userId} tier image`}
                />

                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    width={24}
                    height={24}
                    className="rounded-full object-contain"
                    alt={`${user.userId} profile image`}
                  />
                ) : (
                  <AvatarIcon className="bg-plum-50 text-plum-300 size-6 rounded-full" />
                )}

                <div className="text-lg font-semibold">{user.userId}</div>
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      )}
    </form>
  )
}
