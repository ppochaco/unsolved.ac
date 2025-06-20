import { useEffect, useMemo, useState } from 'react'

import { Cross2Icon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { updateSelectedUsersApi } from '@/services'
import type { User } from '@/types'

import { SearchUserForm } from './search-user-form'
import { SelectUser } from './select-user'

interface UserFilterProps {
  onClose: () => void
}

export const UserFilter = ({ onClose }: UserFilterProps) => {
  const { mutate: updateSelectedUsers } = useMutation({
    mutationFn: updateSelectedUsersApi,
  })

  const [users, setUsers] = useState<User[]>([])

  const selectedUserIds = useMemo(() => {
    return users
      .filter((user) => user.isSelected && !user.isFetchingProblem)
      .map((user) => user.userId)
  }, [users])

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
  }

  const toggleUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.userId === userId) {
          const selected = !user.isSelected

          return { ...user, isSelected: selected }
        }

        return user
      }),
    )
  }

  const finishFetchingProblem = (userId: string, problemIds: number[]) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.userId === userId) {
          return { ...user, isFetchingProblem: false, problemIds }
        }

        return user
      }),
    )
  }

  useEffect(() => {
    updateSelectedUsers(selectedUserIds)
  }, [selectedUserIds, updateSelectedUsers])

  return (
    <Card className="relative w-fit">
      <CardHeader>
        <CardTitle className="text-center text-lg">unsolved-ac</CardTitle>
      </CardHeader>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="group absolute top-2 right-2 rounded-full"
      >
        <Cross2Icon className="text-plum-200 group-hover:text-plum-400 size-5" />
      </Button>
      <CardContent className="flex flex-col gap-4">
        <SearchUserForm addUser={addUser} />
        <SelectUser
          users={users}
          deleteUser={deleteUser}
          toggleUser={toggleUser}
          finishFetchingProblem={finishFetchingProblem}
        />
      </CardContent>
    </Card>
  )
}
