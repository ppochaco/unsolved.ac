'use client'

import { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/lib'
import { User } from '@/types'

import { SearchUserForm } from './search-user-form'
import { SelectUser } from './select-user'

interface UserFilterProps {
  levelImages: Map<number, string>
}

export const UserFilter = ({ levelImages }: UserFilterProps) => {
  const [users, setUsers] = useState<User[]>([])

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
          return { ...user, isSelected: !user.isSelected }
        }
        return user
      }),
    )
  }

  return (
    <section className="flex h-fit w-full flex-col items-center">
      <QueryClientProvider client={queryClient}>
        <SearchUserForm levelImages={levelImages} addUser={addUser} />
        <SelectUser
          users={users}
          deleteUser={deleteUser}
          toggleUser={toggleUser}
        />
      </QueryClientProvider>
    </section>
  )
}
