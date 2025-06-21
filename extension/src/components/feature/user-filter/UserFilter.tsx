import { useEffect } from 'react'

import {
  CheckIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import {
  Button,
  Card,
  CardContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components'
import { usePortalContainer } from '@/components'
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
import { SolvedStatusList } from './solved-status-list'

export const UserFilter = () => {
  const portalContainer = usePortalContainer()

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
    <Popover>
      <PopoverTrigger>
        <Button
          variant="outline"
          className="group text-primary-700 hover:text-primary-700 border-primary-50 relative ml-10 h-10 w-10 rounded-full hover:cursor-pointer"
        >
          <PersonIcon className="absolute right-2.5 size-5.5" />
          <MagnifyingGlassIcon className="absolute right-2 bottom-2 size-3 rounded-full bg-white transition-all group-hover:bg-[#FAF7FE]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mt-5 mr-2 flex w-sm flex-col gap-4"
        container={portalContainer}
      >
        <SolvedStatusList />
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
      </PopoverContent>
    </Popover>
  )
}
