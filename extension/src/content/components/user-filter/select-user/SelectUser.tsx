import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons'

import { Button, Card, CardContent } from '@/components'
import { cn } from '@/libs'
import type { User } from '@/types'

import { FetchUserProblemIds } from './fetch-user-problem-ids'

interface SelectUserProps {
  users: User[]
  deleteUser: (userId: string) => void
  toggleUser: (userId: string) => void
  finishFetchingProblem: (userId: string, problemIds: number[]) => void
}

export const SelectUser = ({
  users,
  deleteUser,
  toggleUser,
  finishFetchingProblem,
}: SelectUserProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex gap-1">
        <span className="font-bold">선택</span>
        <span className="text-primary font-bold">
          {users.filter((user) => user.isSelected).length}
        </span>
      </div>
      <div className="flex w-full flex-col gap-1 overflow-y-auto">
        {users.map((user) => (
          <div key={user.userId} className="w-full">
            {user.isFetchingProblem ? (
              <Card className="bg-plum-50 gap-0 rounded-full border-none px-1 py-1 shadow-none">
                <CardContent>
                  <FetchUserProblemIds
                    user={user}
                    finishFetchingProblem={finishFetchingProblem}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card
                onClick={() => toggleUser(user.userId)}
                className="hover:bg-plum-50 relative gap-0 rounded-full border-none px-1 py-1 shadow-none"
              >
                <CardContent className="group relative flex items-center gap-2 px-2">
                  {user.isSelected ? (
                    <CheckIcon className="bg-primary size-[24px] rounded-full text-white" />
                  ) : (
                    <img
                      src={user.imageUrl}
                      width={24}
                      height={24}
                      alt={`${user.userId} profile image`}
                      className="rounded-full opacity-50 group-hover:opacity-75"
                    />
                  )}
                  <div
                    className={cn(
                      'cursor-default text-center text-lg font-bold',
                      !user.isSelected && 'opacity-50 group-hover:opacity-75',
                    )}
                  >
                    {user.userId}
                  </div>
                </CardContent>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteUser(user.userId)}
                  className="group absolute top-0 right-1 rounded-full hover:bg-transparent"
                >
                  <Cross2Icon className="text-plum-200 group-hover:text-plum-700 size-5" />
                </Button>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
