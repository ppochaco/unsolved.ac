import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { Label, Switch } from '@/components'
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
