import { ERROR_MESSAGES } from '@/constant'
import type { ContentMessage } from '@/content'

export type BackgroundMessage = {
  type: 'TOGGLE_EXTENSION'
  isEnabled: boolean
}

interface SuccessResponse {
  success: true
  message: string
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
  static async toggleExtension(
    message: BackgroundMessage,
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

    return false
  },
)
