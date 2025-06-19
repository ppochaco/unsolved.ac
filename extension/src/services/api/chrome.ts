import type { BackgroundMessage, BackgroundResponse } from '@/background'

const getExtensionEnabled = async () => {
  const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
  return Boolean(isEnabled)
}

const extensionQueries = {
  all: () => ['extension'] as const,
  enabled: () => [...extensionQueries.all(), 'enabled'] as const,
}

const toggleIsEnabled = async (isEnabled: boolean) => {
  const response: BackgroundResponse<'TOGGLE_EXTENSION'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'TOGGLE_EXTENSION',
      isEnabled,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const fetchUserInfo = async (userId: string) => {
  const response: BackgroundResponse<'FETCH_USER_INFO'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'FETCH_USER_INFO',
      userId,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const fetchUserProblemIds = async (userId: string, page: number) => {
  const response: BackgroundResponse<'FETCH_USER_PROBLEM_IDS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'FETCH_USER_PROBLEM_IDS',
      userId,
      page,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  const PROBLEMS_PER_PAGE = 50
  const totalPage = Math.ceil(response.data.count / PROBLEMS_PER_PAGE)

  return {
    problems: response.data,
    nextPageToken: page < totalPage ? page + 1 : undefined,
  }
}

const userQueries = {
  all: () => ['user'] as const,
  user: (userId: string) => [...userQueries.all(), userId] as const,
  info: (userId: string) => [...userQueries.user(userId), 'info'] as const,
  problemId: (userId: string) =>
    [...userQueries.user(userId), 'problem-id'] as const,
}

export {
  getExtensionEnabled,
  extensionQueries,
  toggleIsEnabled,
  fetchUserInfo,
  fetchUserProblemIds,
  userQueries,
}
