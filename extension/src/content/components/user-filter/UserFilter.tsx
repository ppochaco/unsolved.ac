import { useState } from 'react'

import { Cross2Icon } from '@radix-ui/react-icons'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components'
import type { User } from '@/types'

import { SearchUserForm } from './search-user-form'

interface UserFilterProps {
  onClose: () => void
}

export const UserFilter = ({ onClose }: UserFilterProps) => {
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
      <CardContent>
        <SearchUserForm addUser={addUser} />
        <div>
          {users?.map((user) => <div key={user.userId}>{user.userId}</div>)}
        </div>
      </CardContent>
    </Card>
  )
}
