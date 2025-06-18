import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { Label, Switch } from '@/components'
import { queryClient } from '@/libs'
import {
  extensionQueries,
  getExtensionEnabled,
  toggleIsEnabled,
} from '@/services'

export const Popup = () => {
  const { data: isEnabled } = useSuspenseQuery({
    queryKey: extensionQueries.enabled(),
    queryFn: getExtensionEnabled,
  })

  const { mutate: toggle, status } = useMutation({
    mutationFn: toggleIsEnabled,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extensionQueries.enabled() })
    },
  })

  return (
    <div className="flex w-60 flex-col gap-2.5 py-5">
      <h2 className="text-center text-xl font-bold">unsolved-ac</h2>
      <div className="flex items-center justify-center gap-2">
        <Switch
          id="unsolved-mode"
          checked={isEnabled}
          onCheckedChange={() => toggle(!isEnabled)}
          disabled={status === 'pending'}
        />
        <Label htmlFor="unsolved-mode">unsolved 모두 찾기</Label>
      </div>
    </div>
  )
}
