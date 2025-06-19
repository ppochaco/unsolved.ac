import axios from 'axios'

import { ERROR_MESSAGES, SOLVED_AC_PROBLEMS_URL } from '@/constants'
import type { ContentMessage } from '@/content'
import { fetchUserInfoApi } from '@/services'
import { fetchUserProblemApi } from '@/services/api/solved-ac'
import type { SolvedAcUser } from '@/types'

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

type UserProblemResponse = {
  count: number
  problemIds: number[]
}

type MessageResponseData = {
  TOGGLE_EXTENSION: boolean
  FETCH_USER_INFO: SolvedAcUser
  FETCH_USER_PROBLEM_IDS: UserProblemResponse
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

    return false
  },
)
