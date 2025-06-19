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

export const fetchUserInfo = async (userId: string) => {
  const response: BackgroundResponse =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'FETCH_USER_INFO',
      userId,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  if (!response.data) {
    throw new Error('유저를 찾을 수 없습니다.')
  }

  return response.data
}
