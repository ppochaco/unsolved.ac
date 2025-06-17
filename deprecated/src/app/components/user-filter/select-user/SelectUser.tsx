import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons'
import Image from 'next/image'

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  Skeleton,
} from '@/components'
import { cn } from '@/lib'
import { User } from '@/types'

import { FetchUserProblemIds } from './fetch-user-problem-ids'

interface SelectUserProps {
  users: User[]
  deleteUser: (userId: string) => void
  toggleUser: (userId: string) => void
  finishFetchingProblem: (userId: string) => void
}

export const SelectUser = ({
  users,
  deleteUser,
  toggleUser,
  finishFetchingProblem,
}: SelectUserProps) => {
  return (
    <div className="flex w-full flex-col gap-2 pb-5">
      <div className="flex gap-1">
        <span className="font-bold">선택</span>
        <span className="text-primary font-bold">
          {users.filter((user) => user.isSelected).length}
        </span>
      </div>
      <div className="flex w-full gap-6 overflow-x-auto">
        {users.map((user) => (
          <Card key={user.userId} className="gap-0 py-2">
            <CardHeader className="px-2">
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteUser(user.userId)}
                  className="group rounded-full"
                >
                  <Cross2Icon className="text-plum-200 group-hover:text-plum-400 size-5" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent
              onClick={() => toggleUser(user.userId)}
              className="group flex h-38 w-40 flex-col items-center gap-2 px-2 hover:cursor-pointer"
            >
              {user.isFetchingProblem ? (
                <FetchUserProblemIds
                  user={user}
                  finishFetchingProblem={finishFetchingProblem}
                />
              ) : user.isSelected ? (
                <CheckIcon className="bg-primary size-21 rounded-full text-white" />
              ) : (
                <Image
                  src={user.imageUrl}
                  width={84}
                  height={84}
                  alt={`${user.userId} profile image`}
                  className="rounded-full opacity-50 group-hover:opacity-75"
                />
              )}
              <div
                className={cn(
                  'text-center text-lg font-bold break-all whitespace-normal group-hover:opacity-75',
                  user.userId.length > 10 && 'text-md',
                  !user.isSelected && 'opacity-50',
                )}
              >
                {user.userId}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const SelectUserSkeleton = ({ userIds }: { userIds: string[] }) => {
  return (
    <div className="flex w-full flex-col gap-2 pb-5">
      <div className="flex gap-1">
        <span className="font-bold">선택</span>
      </div>
      <div className="flex w-full gap-6 overflow-x-auto">
        {userIds.map((userId) => (
          <Card key={userId} className="gap-0 py-2">
            <CardHeader className="px-2">
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  disabled
                >
                  <Cross2Icon className="text-plum-200 size-5" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex h-38 w-40 flex-col items-center gap-2 px-2">
              <Skeleton className="size-21 rounded-full" />
              <Skeleton className="mt-2 h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
