import type { BackgroundMessage, BackgroundResponse } from '@/background'

export const getExtensionEnabled = async () => {
  const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
  return Boolean(isEnabled)
}

export const extensionQueries = {
  all: () => ['extension'] as const,
  enabled: () => [...extensionQueries.all(), 'enabled'] as const,
}

export const toggleIsEnabled = async (isEnabled: boolean) => {
  const response: BackgroundResponse =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'TOGGLE_EXTENSION',
      isEnabled,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return isEnabled
}
