import type { BackgroundMessage, BackgroundResponse } from '@/background'

const getExtensionEnabled = async () => {
  const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
  return Boolean(isEnabled)
}

const getAllUserProblemIds = async () => {
  const response: BackgroundResponse<'GET_ALL_USER_PROBLEM_IDS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'GET_ALL_USER_PROBLEM_IDS',
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const extensionQueries = {
  all: () => ['extension'] as const,
  enabled: () => [...extensionQueries.all(), 'enabled'] as const,
  allUserProblemIds: () =>
    [...extensionQueries.all(), 'user-problem-ids'] as const,
  userProblemIds: (userId: string) =>
    [...extensionQueries.allUserProblemIds(), userId] as const,
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

const storeProblemIdsApi = async (userId: string, problemIds: number[]) => {
  const response: BackgroundResponse<'STORE_USER_PROBLEM_IDS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'STORE_USER_PROBLEM_IDS',
      userId,
      problemIds,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const updateSelectedUsersApi = async (userIds: string[]) => {
  const response: BackgroundResponse<'UPDATE_SELECTED_USERS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'UPDATE_SELECTED_USERS',
      userIds,
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
  getAllUserProblemIds,
  extensionQueries,
  toggleIsEnabled,
  storeProblemIdsApi,
  updateSelectedUsersApi,
  fetchUserInfo,
  fetchUserProblemIds,
  userQueries,
}
