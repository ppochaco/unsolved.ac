'use client'

import { useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { updateUserProblemIdsApi } from '@/service/api/user'
import { User } from '@/types'

import { FetchUserProblemIds } from './fetch-user-problem-ids'
import { SearchUserForm } from './search-user-form'
import { SelectUser } from './select-user'

interface UserFilterProps {
  levelImages: Map<number, string>
}

export const UserFilter = ({ levelImages }: UserFilterProps) => {
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [user, setUser] = useState<User>()
  const [progress, setProgress] = useState(0)

  const [urlUpdateTarget, setUrlUpdateTarget] = useState<{
    userId: string
    action: 'add' | 'remove'
  } | null>(null)

  const { mutate: updateUserProblemIds } = useMutation({
    mutationFn: ({
      userId,
      problemIds,
    }: {
      userId: string
      problemIds: number[]
    }) => updateUserProblemIdsApi(userId, problemIds),
    onSuccess: (result) => {
      const params = new URLSearchParams(window.location.search)
      params.append('userId', result.userId)
      router.push(`${window.location.pathname}?${params}`)
    },
  })

  const addUser = (user: User) => {
    setUsers((prev) => {
      if (prev.some((u) => u.userId === user.userId)) {
        return prev
      }

      setProgress(0)
      setUser(user)

      return [...prev, user]
    })
  }

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.userId !== userId))
    setUrlUpdateTarget({ userId, action: 'remove' })
  }

  const toggleUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.userId === userId) {
          const selected = !user.isSelected
          setUrlUpdateTarget({ userId, action: selected ? 'add' : 'remove' })

          return { ...user, isSelected: selected }
        }
        return user
      }),
    )
  }

  useEffect(() => {
    if (urlUpdateTarget) {
      const params = updateUserIdParams(
        urlUpdateTarget.userId,
        urlUpdateTarget.action,
      )

      router.push(`${window.location.pathname}?${params}`)
      setUrlUpdateTarget(null)
    }
  }, [urlUpdateTarget, router])

  return (
    <section className="flex h-fit w-full flex-col items-center">
      <SearchUserForm levelImages={levelImages} addUser={addUser} />
      <SelectUser
        users={users}
        deleteUser={deleteUser}
        toggleUser={toggleUser}
        progress={progress}
      />
      {user && (
        <FetchUserProblemIds
          userId={user.userId}
          setProgress={(p: number) => setProgress(p)}
          resetUser={(userId: string, problemIds: number[]) => {
            setUser(undefined)
            updateUserProblemIds({ userId, problemIds })
          }}
        />
      )}
    </section>
  )
}

const updateUserIdParams = (userId: string, action: 'add' | 'remove') => {
  const params = new URLSearchParams(window.location.search)
  const currentIds = params.getAll('userId')

  params.delete('userId')

  if (action === 'add') {
    currentIds.push(userId)
  }

  const updatedIds =
    action === 'remove' ? currentIds.filter((id) => id !== userId) : currentIds

  updatedIds.forEach((id) => params.append('userId', id))

  return params
}
