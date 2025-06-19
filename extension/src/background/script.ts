import axios from 'axios'

import { ERROR_MESSAGES } from '@/constants'
import type { ContentMessage } from '@/content'
import { fetchUserInfoApi } from '@/services'
import type { SolvedAcUser } from '@/types'

type ToggleExtension = {
  type: 'TOGGLE_EXTENSION'
  isEnabled: boolean
}

type FetchUserInfo = {
  type: 'FETCH_USER_INFO'
  userId: string
}

export type BackgroundMessage = ToggleExtension | FetchUserInfo

interface SuccessResponse {
  success: true
  message: string
  data?: SolvedAcUser
}

interface ErrorResponse {
  success: false
  error: string
}

export type BackgroundResponse = SuccessResponse | ErrorResponse

const SOLVED_AC_PROBLEMS_URL = 'https://solved.ac/problems'

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

class MessageHandler {
  static async fetchUserInfo(
    userId: string,
    sendResponse: (response: BackgroundResponse) => void,
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

      sendResponse({
        success: false,
        error: '데이터를 가져오는데 실패했습니다.',
      })
    }
  }

  static async toggleExtension(
    message: ToggleExtension,
    sendResponse: (response: BackgroundResponse) => void,
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
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR

      sendResponse({
        success: false,
        error: errorMessage,
      })
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
    sendResponse: (response: BackgroundResponse) => void,
  ) => {
    if (message.type === 'TOGGLE_EXTENSION') {
      MessageHandler.toggleExtension(message, sendResponse)
      return true
    }

    if (message.type === 'FETCH_USER_INFO') {
      MessageHandler.fetchUserInfo(message.userId, sendResponse)
      return true
    }

    return false
  },
)
