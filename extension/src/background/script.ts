import axios from 'axios'

import { ERROR_MESSAGES, SOLVED_AC_PROBLEMS_URL } from '@/constants'
import type { ContentMessage } from '@/content'
import { fetchUserInfoApi } from '@/services'
import { fetchUserProblemApi } from '@/services/api/solved-ac'
import type { SolvedAcUser } from '@/types'

type UpdateSelectedUsers = {
  type: 'UPDATE_SELECTED_USERS'
  userIds: string[]
}

type StoreUserProblemIds = {
  type: 'STORE_USER_PROBLEM_IDS'
  userId: string
  problemIds: number[]
}

type GetAllUserProblemIds = {
  type: 'GET_ALL_USER_PROBLEM_IDS'
}

type ToggleExtension = {
  type: 'TOGGLE_EXTENSION'
  isEnabled: boolean
}

type FetchUserInfo = {
  type: 'FETCH_USER_INFO'
  userId: string
}

type FetchUserProblem = {
  type: 'FETCH_USER_PROBLEM_IDS'
  userId: string
  page: number
}

export type BackgroundMessage =
  | ToggleExtension
  | FetchUserInfo
  | FetchUserProblem
  | StoreUserProblemIds
  | GetAllUserProblemIds
  | UpdateSelectedUsers

type UserProblemResponse = {
  count: number
  problemIds: number[]
}

type MessageResponseData = {
  TOGGLE_EXTENSION: boolean
  FETCH_USER_INFO: SolvedAcUser
  FETCH_USER_PROBLEM_IDS: UserProblemResponse
  STORE_USER_PROBLEM_IDS: boolean
  GET_ALL_USER_PROBLEM_IDS: Record<string, number[]>
  UPDATE_SELECTED_USERS: boolean
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
    await chrome.storage.local.set({ isEnabled: false })
  }

  static async setEnabled(isEnabled: boolean) {
    await chrome.storage.local.set({ isEnabled })
  }

  static async storeUserProblemIds(userId: string, problemIds: number[]) {
    const key = `user_problems_${userId}`
    await chrome.storage.local.set({ [key]: problemIds })
  }

  static async getUserProblemIds(userId: string) {
    const key = `user_problems_${userId}`
    const result: { [key: string]: number[] } = await chrome.storage.local.get([
      key,
    ])
    return result[key] || []
  }

  static async getAllUserProblemIds() {
    const allData = await chrome.storage.local.get(null)
    const userProblems: Record<string, number[]> = {}

    for (const [key, value] of Object.entries(allData)) {
      if (key.startsWith('user_problems_')) {
        const userId = key.replace('user_problems_', '')
        userProblems[userId] = value
      }
    }

    return userProblems
  }

  static async deleteUserProblemIds(userId: string) {
    const key = `user_problems_${userId}`
    await chrome.storage.local.remove([key])
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

  static async isSolvedAcProblemsPage() {
    const currentTab = await this.getCurrentTab()
    return currentTab.url?.includes('solved.ac/problems') ?? false
  }

  static async navigateToProblems() {
    await chrome.tabs.create({
      url: SOLVED_AC_PROBLEMS_URL,
      active: true,
    })
  }

  static async sendMessageToAllTabs(message: ContentMessage) {
    const tabs = await chrome.tabs.query({ url: SOLVED_AC_PROBLEMS_URL })
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

  static async fetchUserInfo(
    userId: string,
    sendResponse: (response: BackgroundResponse<'FETCH_USER_INFO'>) => void,
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
      await this.updateExtensionisEnabled(message.isEnabled)

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

  static async storeUserProblemIds(
    userId: string,
    problemIds: number[],
    sendResponse: (
      response: BackgroundResponse<'STORE_USER_PROBLEM_IDS'>,
    ) => void,
  ) {
    try {
      await StorageService.storeUserProblemIds(userId, problemIds)

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
      const allUserProblems = await StorageService.getAllUserProblemIds()

      sendResponse({
        success: true,
        message: '모든 유저 문제 ID 조회',
        data: allUserProblems,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

  static async updateSelectedUsers(
    selectedUserIds: string[],
    sendResponse: (
      response: BackgroundResponse<'UPDATE_SELECTED_USERS'>,
    ) => void,
  ) {
    try {
      await TabService.sendMessageToAllTabs({
        type: 'SELECTED_USERS_UPDATED',
        selectedUserIds,
      })

      sendResponse({
        success: true,
        message: '선택된 유저 재설정',
        data: true,
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

  private static async updateExtensionisEnabled(isEnabled: boolean) {
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
      response:
        | SuccessResponse<'TOGGLE_EXTENSION'>
        | SuccessResponse<'FETCH_USER_INFO'>
        | SuccessResponse<'FETCH_USER_PROBLEM_IDS'>
        | SuccessResponse<'STORE_USER_PROBLEM_IDS'>
        | SuccessResponse<'GET_ALL_USER_PROBLEM_IDS'>
        | SuccessResponse<'UPDATE_SELECTED_USERS'>
        | ErrorResponse,
    ) => void,
  ) => {
    if (message.type === 'TOGGLE_EXTENSION') {
      MessageHandler.toggleExtension(message, sendResponse)
      return true
    }

    if (message.type === 'FETCH_USER_INFO') {
      MessageHandler.fetchUserInfo(message.userId, sendResponse)
      return true
    }

    if (message.type === 'FETCH_USER_PROBLEM_IDS') {
      MessageHandler.fetchUserProblemIds(
        message.userId,
        message.page,
        sendResponse,
      )
      return true
    }

    if (message.type === 'STORE_USER_PROBLEM_IDS') {
      MessageHandler.storeUserProblemIds(
        message.userId,
        message.problemIds,
        sendResponse,
      )
      return true
    }

    if (message.type === 'GET_ALL_USER_PROBLEM_IDS') {
      MessageHandler.getAllUserProblemIds(sendResponse)
      return true
    }

    if (message.type === 'UPDATE_SELECTED_USERS') {
      MessageHandler.updateSelectedUsers(message.userIds, sendResponse)
      return true
    }

    return false
  },
)
