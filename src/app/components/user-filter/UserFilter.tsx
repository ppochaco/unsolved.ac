'use client'

import { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/lib'
import { User } from '@/types'

import { SearchUserForm } from './search-user-form'

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

  return (
    <section className="flex h-70 flex-col items-center">
      <QueryClientProvider client={queryClient}>
        <SearchUserForm levelImages={levelImages} addUser={addUser} />
        {users.map((user) => (
          <div key={user.userId}>{user.userId}</div>
        ))}
      </QueryClientProvider>
    </section>
  )
}
