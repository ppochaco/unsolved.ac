import { useMutation, useSuspenseQueries } from '@tanstack/react-query'

import { Label, Switch } from '@/components'
import { queryClient } from '@/lib'
import {
  extensionQueries,
  getExtensionEnabled,
  getIsSolvedAcPage,
  navigateToSolvedAc,
  toggleIsEnabled,
} from '@/services'

export const Popup = () => {
  const [{ data: isEnabled }, { data: isSolvedAcPage }] = useSuspenseQueries({
    queries: [
      { queryKey: extensionQueries.enabled(), queryFn: getExtensionEnabled },
      {
        queryKey: extensionQueries.isSolvedAcPage(),
        queryFn: getIsSolvedAcPage,
      },
    ],
  })

  const { mutate: toggle, isPending: isToggling } = useMutation({
    mutationFn: toggleIsEnabled,
    onSuccess: (newIsEnabled) => {
      queryClient.invalidateQueries({ queryKey: extensionQueries.enabled() })

      if (newIsEnabled && !isSolvedAcPage) {
        navigate()
      }
    },
  })

  const { mutate: navigate, isPending: isNavigating } = useMutation({
    mutationFn: navigateToSolvedAc,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: extensionQueries.isSolvedAcPage(),
      })
    },
  })

  const onClickSwitch = () => {
    toggle(!isEnabled)
  }

  return (
    <div className="flex w-60 flex-col gap-2.5 py-5">
      <h2 className="text-center text-xl font-bold">unsolved-ac</h2>
      <div className="flex justify-center gap-2">
        <Switch
          id="unsolved-mode"
          checked={isEnabled}
          onCheckedChange={onClickSwitch}
          disabled={isToggling || isNavigating}
        />
        <Label>unsolved 모두 찾기</Label>
      </div>
    </div>
  )
}
