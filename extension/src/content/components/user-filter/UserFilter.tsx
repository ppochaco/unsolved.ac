import { useEffect } from 'react'

import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { cn, queryClient } from '@/libs'
import {
  addUserApi,
  getUsersApi,
  removeUserApi,
  setUserFetchingStatusApi,
  storageQueries,
  toggleUserSelectionApi,
} from '@/services'
import type { ContentMessage, UserProblemIds } from '@/types'

import { FetchUserProblemIds } from './fetch-user-problem-ids'
import { SearchUserForm } from './search-user-form'

export const UserFilter = () => {
  const { data: users, refetch: refetchUsers } = useSuspenseQuery({
    queryKey: storageQueries.users(),
    queryFn: getUsersApi,
  })

  const { mutate: addUser } = useMutation({
    mutationFn: addUserApi,
    onSuccess: () => {
      refetchUsers()
    },
  })

  const { mutate: removeUser } = useMutation({
    mutationFn: removeUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageQueries.users() })
      refetchUsers()
    },
  })

  const { mutate: toggleUser } = useMutation({
    mutationFn: toggleUserSelectionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageQueries.users() })
      refetchUsers()
    },
  })

  const { mutate: finishFetchingProblem } = useMutation({
    mutationFn: ({ userId, problemIds }: UserProblemIds) =>
      setUserFetchingStatusApi(userId, problemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageQueries.users() })
      refetchUsers()
    },
  })

  useEffect(() => {
    const handleMessage = (message: ContentMessage) => {
      if (message.type === 'USERS_UPDATED') {
        refetchUsers()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [refetchUsers])

  return (
    <Card className="relative w-fit">
      <CardHeader>
        <CardTitle className="text-center text-lg">unsolved-ac</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SearchUserForm addUser={addUser} />
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
                          !user.isSelected &&
                            'opacity-50 group-hover:opacity-75',
                        )}
                      >
                        {user.userId}
                      </div>
                    </CardContent>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeUser(user.userId)
                      }}
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
      </CardContent>
    </Card>
  )
}
