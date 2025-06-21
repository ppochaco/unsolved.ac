import axios from 'axios'

import { ERROR_MESSAGES, SOLVED_AC_PROBLEMS_URL } from '@/constants'
import type { ContentMessage } from '@/content'
import { fetchUserInfoApi } from '@/services'
import { fetchUserProblemApi } from '@/services/api/solved-ac'
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

export type BackgroundMessage =
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

export type BackgroundResponse<T extends BackgroundMessage['type']> =
  | SuccessResponse<T>
  | ErrorResponse

class StorageService {
  static async initializeStorage() {
    await chrome.storage.local.set({
      isEnabled: false,
      users: [],
    })
  }

  static async setEnabled(isEnabled: boolean) {
    await chrome.storage.local.set({ isEnabled })
  }

  static async addUser(
    userData: Omit<User, 'isSelected' | 'isFetchingProblem'>,
  ) {
    const users = await this.getUsers()

    const usersIndex = users.findIndex((u) => u.userId === userData.userId)

    const newUser: User = {
      ...userData,
      isSelected: true,
      isFetchingProblem: true,
    }

    if (0 <= usersIndex) {
      users[usersIndex] = { ...users[usersIndex], ...newUser }
    } else {
      users.push(newUser)
    }

    await chrome.storage.local.set({ users })
    await this.notifyUsersChanged(users)
  }

  static async removeUser(userId: string) {
    const users = await this.getUsers()
    const filteredUsers = users.filter((u) => u.userId !== userId)

    await chrome.storage.local.set({ users: filteredUsers })

    await this.removeUserProblemIds(userId)
    await this.notifyUsersChanged(filteredUsers)
  }

  static async toggleUserSelection(userId: string) {
    const users = await this.getUsers()
    const userIndex = users.findIndex((u) => u.userId === userId)

    if (0 <= userIndex) {
      const user = users[userIndex]
      const newIsSelected = !user.isSelected

      users[userIndex] = { ...user, isSelected: newIsSelected }

      await chrome.storage.local.set({ users })
      await this.notifyUsersChanged(users)
    }
  }

  static async setUserFetchingStatusFalse(
    userId: string,
    problemIds?: number[],
  ) {
    const users = await this.getUsers()
    const userIndex = users.findIndex((u) => u.userId === userId)

    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], isFetchingProblem: false }
      await chrome.storage.local.set({ users })

      if (problemIds) {
        await this.addUserProblemIds(userId, problemIds)
      }

      await this.notifyUsersChanged(users)
    }
  }

  static async getUsers() {
    const result: Record<string, User[]> = await chrome.storage.local.get([
      'users',
    ])
    return result.users || []
  }

  static async addUserProblemIds(userId: string, problemIds: number[]) {
    const key = `userProblems_${userId}`
    await chrome.storage.local.set({ [key]: problemIds })
  }

  private static async removeUserProblemIds(userId: string) {
    const key = `userProblems_${userId}`
    await chrome.storage.local.remove([key])
  }

  static async getAllUserProblemIds() {
    const allData = await chrome.storage.local.get()
    const userProblemsMap = new Map<string, number[]>()

    for (const [key, value] of Object.entries(allData)) {
      if (key.startsWith('userProblems_')) {
        const userId = key.replace('userProblems_', '')
        userProblemsMap.set(userId, value as number[])
      }
    }

    return userProblemsMap
  }

  private static async notifyUsersChanged(users: User[]) {
    await TabService.sendMessageToAllTabs({
      type: 'USERS_UPDATED',
      users,
    })
  }
}

class TabService {
  static async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]

    if (!currentTab?.id) {
      throw new Error(ERROR_MESSAGES.INVALID_TAB)
    }

    return currentTab
  }

  static async isSolvedAcProblemsPage(url?: string) {
    const urlToCheck = url ?? (await this.getCurrentTab()).url
    return urlToCheck?.includes('solved.ac/problems') ?? false
  }

  static async navigateToProblems() {
    await chrome.tabs.create({
      url: SOLVED_AC_PROBLEMS_URL,
      active: true,
    })
  }

  static async sendMessageToAllTabs(message: ContentMessage) {
    const tabs = await chrome.tabs.query({ url: '*://solved.ac/problems*' })
    for (const tab of tabs) {
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, message)
      }
    }
  }
}

class ErrorHandler {
  static handleCommonError<T extends BackgroundMessage['type']>(
    error: unknown,
    sendResponse: (response: BackgroundResponse<T>) => void,
  ) {
    if (axios.isAxiosError(error)) {
      sendResponse({
        success: false,
        error: error.message,
      })
      return
    }

    sendResponse({
      success: false,
      error: ERROR_MESSAGES.UNKNOWN_ERROR,
    })
  }
}

class MessageHandler {
  static async getUserInfo(
    userId: string,
    sendResponse: (response: BackgroundResponse<'GET_USER_INFO'>) => void,
  ) {
    try {
      const data = await fetchUserInfoApi(userId)

      sendResponse({
        success: true,
        message: `${userId} 정보`,
        data,
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          sendResponse({
            success: false,
            error: ERROR_MESSAGES.BAD_REQUEST,
          })
          return
        }

        if (error.response?.status === 404) {
          sendResponse({
            success: false,
            error: ERROR_MESSAGES.USER_NOT_FOUND,
          })
          return
        }
      }

      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async toggleExtension(
    message: ToggleExtension,
    sendResponse: (response: BackgroundResponse<'TOGGLE_EXTENSION'>) => void,
  ) {
    try {
      await this.ensureSolvedAcPage()
      await this.updateExtensionEnabled(message.isEnabled)

      const successMessage = message.isEnabled
        ? '익스텐션 활성화'
        : '익스텐션 비활성화'

      sendResponse({
        success: true,
        message: successMessage,
        data: message.isEnabled,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async fetchUserProblemIds(
    userId: string,
    page: number,
    sendResponse: (
      response: BackgroundResponse<'FETCH_USER_PROBLEM_IDS'>,
    ) => void,
  ) {
    try {
      const data = await fetchUserProblemApi(userId, page)
      const problemIds = data.items.map((p) => p.problemId)

      sendResponse({
        success: true,
        message: `${userId} solved problem ids`,
        data: {
          count: data.count,
          problemIds,
        },
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async addUser(
    userData: Omit<User, 'isSelected' | 'isFetchingProblem'>,
    sendResponse: (response: BackgroundResponse<'ADD_USER'>) => void,
  ) {
    try {
      await StorageService.addUser(userData)
      sendResponse({
        success: true,
        message: `${userData.userId} 추가`,
        data: true,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async removeUser(
    userId: string,
    sendResponse: (response: BackgroundResponse<'REMOVE_USER'>) => void,
  ) {
    try {
      await StorageService.removeUser(userId)
      sendResponse({
        success: true,
        message: `${userId} 제거`,
        data: true,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async toggleUserSelection(
    userId: string,
    sendResponse: (
      response: BackgroundResponse<'TOGGLE_USER_SELECTION'>,
    ) => void,
  ) {
    try {
      await StorageService.toggleUserSelection(userId)
      sendResponse({
        success: true,
        message: `${userId} isSelected 변경`,
        data: true,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async setUserFetchingStatus(
    userId: string,
    problemIds: number[] | undefined,
    sendResponse: (
      response: BackgroundResponse<'SET_USER_FETCHING_STATUS'>,
    ) => void,
  ) {
    try {
      await StorageService.setUserFetchingStatusFalse(userId, problemIds)
      sendResponse({
        success: true,
        message: `${userId} isFetching  변경`,
        data: true,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async getUsers(
    sendResponse: (response: BackgroundResponse<'GET_USERS'>) => void,
  ) {
    try {
      const users = await StorageService.getUsers()
      sendResponse({
        success: true,
        message: '유저 목록 조회',
        data: users,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async addUserProblemIds(
    userId: string,
    problemIds: number[],
    sendResponse: (
      response: BackgroundResponse<'ADD_USER_PROBLEM_IDS'>,
    ) => void,
  ) {
    try {
      await StorageService.addUserProblemIds(userId, problemIds)
      sendResponse({
        success: true,
        message: `${userId} 문제 ID 저장`,
        data: true,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async getAllUserProblemIds(
    sendResponse: (
      response: BackgroundResponse<'GET_ALL_USER_PROBLEM_IDS'>,
    ) => void,
  ) {
    try {
      const userProblemsMap = await StorageService.getAllUserProblemIds()
      const userProblemsObject = Object.fromEntries(userProblemsMap)

      sendResponse({
        success: true,
        message: '모든 유저 문제 ID 조회',
        data: userProblemsObject,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  private static async ensureSolvedAcPage() {
    const isSolvedAcPage = await TabService.isSolvedAcProblemsPage()

    if (!isSolvedAcPage) {
      await TabService.navigateToProblems()
      chrome.action.openPopup()
    }
  }

  private static async updateExtensionEnabled(isEnabled: boolean) {
    await Promise.all([
      StorageService.setEnabled(isEnabled),
      TabService.sendMessageToAllTabs({
        type: 'EXTENSION_TOGGLED',
        isEnabled,
      }),
    ])
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await StorageService.initializeStorage()
})

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    _sender,
    sendResponse: (
      response: BackgroundResponse<BackgroundMessage['type']>,
    ) => void,
  ) => {
    switch (message.type) {
      case 'TOGGLE_EXTENSION':
        MessageHandler.toggleExtension(message, sendResponse)
        return true

      case 'GET_USER_INFO':
        MessageHandler.getUserInfo(message.userId, sendResponse)
        return true

      case 'FETCH_USER_PROBLEM_IDS':
        MessageHandler.fetchUserProblemIds(
          message.userId,
          message.page,
          sendResponse,
        )
        return true

      case 'ADD_USER':
        MessageHandler.addUser(message.user, sendResponse)
        return true

      case 'REMOVE_USER':
        MessageHandler.removeUser(message.userId, sendResponse)
        return true

      case 'TOGGLE_USER_SELECTION':
        MessageHandler.toggleUserSelection(message.userId, sendResponse)
        return true

      case 'SET_USER_FETCHING_STATUS':
        MessageHandler.setUserFetchingStatus(
          message.userId,
          message.problemIds,
          sendResponse,
        )
        return true

      case 'GET_USERS':
        MessageHandler.getUsers(sendResponse)
        return true

      case 'ADD_USER_PROBLEM_IDS':
        MessageHandler.addUserProblemIds(
          message.userId,
          message.problemIds,
          sendResponse,
        )
        return true

      case 'GET_ALL_USER_PROBLEM_IDS':
        MessageHandler.getAllUserProblemIds(sendResponse)
        return true

      default:
        return false
    }
  },
)
