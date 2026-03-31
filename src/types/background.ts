import type { SolvedAcUser, User } from '@/types'

type ToggleExtension = {
  type: 'TOGGLE_EXTENSION'
  isEnabled: boolean
}

type GetUserInfo = {
  type: 'GET_USER_INFO'
  userId: string
}

type FetchUserProblemIds = {
  type: 'FETCH_USER_PROBLEM_IDS'
  userId: string
  page: number
}

type AddUser = {
  type: 'ADD_USER'
  user: Omit<User, 'isSelected' | 'isFetchingProblem'>
}

type RemoveUser = {
  type: 'REMOVE_USER'
  userId: string
}

type ToggleUserSelection = {
  type: 'TOGGLE_USER_SELECTION'
  userId: string
}

type SetUserFetchingStatus = {
  type: 'SET_USER_FETCHING_STATUS'
  userId: string
  problemIds?: number[]
}

type GetUsers = {
  type: 'GET_USERS'
}

type AddUserProblemIds = {
  type: 'ADD_USER_PROBLEM_IDS'
  userId: string
  problemIds: number[]
}

type GetAllUserProblemIds = {
  type: 'GET_ALL_USER_PROBLEM_IDS'
}

type GetExtensionEnabled = {
  type: 'GET_EXTENSION_ENABLED'
}

type BackgroundMessage =
  | ToggleExtension
  | GetUserInfo
  | FetchUserProblemIds
  | AddUser
  | RemoveUser
  | ToggleUserSelection
  | SetUserFetchingStatus
  | GetUsers
  | AddUserProblemIds
  | GetAllUserProblemIds
  | GetExtensionEnabled

type UserProblemResponse = {
  count: number
  problemIds: number[]
}

type MessageResponseData = {
  TOGGLE_EXTENSION: boolean
  GET_USER_INFO: SolvedAcUser
  FETCH_USER_PROBLEM_IDS: UserProblemResponse
  ADD_USER: boolean
  REMOVE_USER: boolean
  TOGGLE_USER_SELECTION: boolean
  SET_USER_FETCHING_STATUS: boolean
  GET_USERS: User[]
  ADD_USER_PROBLEM_IDS: boolean
  REMOVE_USER_PROBLEM_IDS: boolean
  GET_ALL_USER_PROBLEM_IDS: Record<string, number[]>
  GET_USER_PROBLEM_IDS: number[]
  GET_EXTENSION_ENABLED: boolean
}

type SuccessResponse<T extends BackgroundMessage['type']> = {
  success: true
  message: string
  data: MessageResponseData[T]
}

interface ErrorResponse {
  success: false
  error: string
}

type BackgroundResponse<T extends BackgroundMessage['type']> =
  | SuccessResponse<T>
  | ErrorResponse

export { type BackgroundMessage, type BackgroundResponse }
