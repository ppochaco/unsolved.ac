'use client'

import { useEffect, useState } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'

import { DEFAULT_USER_IMAGE_URL } from '@/constant'
import { userInfoQueries } from '@/service'
import { User } from '@/types'

import { SearchUserForm } from './search-user-form'
import { SelectUser } from './select-user'

interface UserFilterProps {
  levelImages: Map<number, string>
}

export const UserFilter = ({ levelImages }: UserFilterProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userIds = searchParams.getAll('userId')
  const results = useSuspenseQueries({
    queries: userIds.map((id) => userInfoQueries.detail(id)),
  })

  const initUsers: User[] = results.map((result) => {
    const { handle, profileImageUrl, tier } = result.data
    return {
      userId: handle,
      imageUrl: profileImageUrl || DEFAULT_USER_IMAGE_URL,
      levelId: tier,
      isSelected: true,
      isFetchingProblem: true,
    }
  })

  const [users, setUsers] = useState<User[]>(initUsers)
  const [urlSearchParams, setUrlSearchParams] = useState<URLSearchParams>()

  const addUser = (user: User) => {
    setUsers((prev) => {
      if (prev.some((u) => u.userId === user.userId)) {
        return prev
      }

      return [...prev, user]
    })
  }

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.userId !== userId))
    updateUserIdSearchParams(userId, 'remove')
  }

  const toggleUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.userId === userId) {
          const selected = !user.isSelected
          updateUserIdSearchParams(userId, selected ? 'add' : 'remove')

          return { ...user, isSelected: selected }
        }

        return user
      }),
    )
  }

  const finishFetchingProblem = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.userId === userId) {
          updateUserIdSearchParams(userId, 'add')

          return { ...user, isFetchingProblem: false }
        }

        return user
      }),
    )
  }

  const updateUserIdSearchParams = (
    userId: string,
    action: 'add' | 'remove',
  ) => {
    const params = new URLSearchParams(window.location.search)
    const userIdsSet = new Set(params.getAll('userId'))

    params.delete('userId')

    if (action === 'add') {
      userIdsSet.add(userId)
    } else if (action === 'remove') {
      userIdsSet.delete(userId)
    }

    userIdsSet.forEach((id) => params.append('userId', id))

    setUrlSearchParams(params)
  }

  useEffect(() => {
    if (urlSearchParams) {
      router.push(`${window.location.pathname}?${urlSearchParams}`)
    }
  }, [urlSearchParams, router])

  return (
    <section className="flex h-fit w-full flex-col items-center">
      <SearchUserForm levelImages={levelImages} addUser={addUser} />
      <SelectUser
        users={users}
        deleteUser={deleteUser}
        toggleUser={toggleUser}
        finishFetchingProblem={finishFetchingProblem}
      />
    </section>
  )
}
