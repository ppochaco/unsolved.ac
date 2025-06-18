import type { BackgroundMessage, BackgroundResponse } from '@/background'

export const getExtensionEnabled = async () => {
  try {
    const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
    return Boolean(isEnabled)
  } catch (error) {
    console.warn(error)
    throw new Error('설정을 불러올 수 없습니다')
  }
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
