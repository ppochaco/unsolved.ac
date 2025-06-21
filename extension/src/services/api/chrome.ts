import type { BackgroundMessage, BackgroundResponse, User } from '@/types'

const getExtensionEnabledApi = async () => {
  const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
  return Boolean(isEnabled)
}

const getAllUserProblemIdsApi = async () => {
  const response: BackgroundResponse<'GET_ALL_USER_PROBLEM_IDS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'GET_ALL_USER_PROBLEM_IDS',
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const toggleIsEnabledApi = async (isEnabled: boolean) => {
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

const fetchUserProblemIdsApi = async (userId: string, page: number) => {
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

const getUserInfoApi = async (userId: string) => {
  const response: BackgroundResponse<'GET_USER_INFO'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'GET_USER_INFO',
      userId,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const addUserApi = async (
  user: Omit<User, 'isSelected' | 'isFetchingProblem'>,
) => {
  const response: BackgroundResponse<'ADD_USER'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'ADD_USER',
      user,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const removeUserApi = async (userId: string) => {
  const response: BackgroundResponse<'REMOVE_USER'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'REMOVE_USER',
      userId,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const toggleUserSelectionApi = async (userId: string) => {
  const response: BackgroundResponse<'TOGGLE_USER_SELECTION'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'TOGGLE_USER_SELECTION',
      userId,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const setUserFetchingStatusApi = async (
  userId: string,
  problemIds?: number[],
) => {
  const response: BackgroundResponse<'SET_USER_FETCHING_STATUS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'SET_USER_FETCHING_STATUS',
      userId,
      problemIds,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const getUsersApi = async () => {
  const response: BackgroundResponse<'GET_USERS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'GET_USERS',
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const addUserProblemIdsApi = async (userId: string, problemIds: number[]) => {
  const response: BackgroundResponse<'ADD_USER_PROBLEM_IDS'> =
    await chrome.runtime.sendMessage<BackgroundMessage>({
      type: 'ADD_USER_PROBLEM_IDS',
      userId,
      problemIds,
    })

  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
}

const storageQueries = {
  all: () => ['chrome', 'storage'] as const,
  enabled: () => [...storageQueries.all(), 'enabled'] as const,
  users: () => [...storageQueries.all(), 'users'] as const,
  allUserProblemIds: () =>
    [...storageQueries.all(), 'user-problem-ids'] as const,
  userProblemIds: (userId: string) =>
    [...storageQueries.allUserProblemIds(), userId] as const,
}

const userQueries = {
  all: () => ['solved-ac', 'user'] as const,
  user: (userId: string) => [...userQueries.all(), userId] as const,
  info: (userId: string) => [...userQueries.user(userId), 'info'] as const,
  problemIds: (userId: string) =>
    [...userQueries.user(userId), 'problem-ids'] as const,
}

export {
  getExtensionEnabledApi,
  getAllUserProblemIdsApi,
  toggleIsEnabledApi,
  fetchUserProblemIdsApi,
  getUserInfoApi,
  addUserApi,
  removeUserApi,
  toggleUserSelectionApi,
  setUserFetchingStatusApi,
  getUsersApi,
  addUserProblemIdsApi,
  storageQueries,
  userQueries,
}
