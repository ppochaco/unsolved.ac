import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { Label, Switch } from '@/components'
import { SOLVED_AC_PROBLEMS_URL } from '@/constants'
import { queryClient } from '@/libs'
import {
  getExtensionEnabledApi,
  storageQueries,
  toggleIsEnabledApi,
} from '@/services'

export const Popup = () => {
  const { data: isEnabled } = useSuspenseQuery({
    queryKey: storageQueries.enabled(),
    queryFn: getExtensionEnabledApi,
  })

  const { mutate: toggle, status } = useMutation({
    mutationFn: toggleIsEnabledApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageQueries.enabled() })
    },
  })

  return (
    <div className="flex w-60 flex-col gap-4 py-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-center text-xl font-bold hover:cursor-default">
          unsolved-ac
        </h2>
        <div className="flex justify-center">
          <a
            href={SOLVED_AC_PROBLEMS_URL}
            onClick={() => toggle(true)}
            target="_blank"
            rel="noreferrer"
            className="text-plum-600 hover:cursor-default hover:underline hover:underline-offset-3"
          >
            solved.ac에서 문제 목록 보기
          </a>
        </div>
      </div>
      <div className="flex justify-center">
        <Switch
          id="unsolved-mode"
          checked={isEnabled}
          onCheckedChange={() => toggle(!isEnabled)}
          disabled={status === 'pending'}
        />
        <Label htmlFor="unsolved-mode" className="sr-only">
          unsolved 백준 문제 찾기
        </Label>
      </div>
    </div>
  )
}
