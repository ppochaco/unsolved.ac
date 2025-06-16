import { ERROR_MESSAGES } from '@/constant'

interface ToggleExtensionMessage {
  type: 'TOGGLE_EXTENSION'
  isEnabled: boolean
}

type BackgroundMessage = ToggleExtensionMessage

interface SuccessResponse {
  success: true
  message: string
}

interface ErrorResponse {
  success: false
  error: string
}

type BackgroundResponse = SuccessResponse | ErrorResponse

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ isEnabled: false })
})

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    _sender,
    sendResponse: (response: BackgroundResponse) => void,
  ) => {
    if (message.type === 'TOGGLE_EXTENSION') {
      handleToggleExtension(message, sendResponse)
      return true
    }

    sendResponse({ success: false, error: ERROR_MESSAGES.UNKNOWN_MESSAGE })
  },
)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'NAVIGATE_TO_PROBLEMS') {
    navigateToProblemsPage(sendResponse)
    return true
  }
})

async function navigateToProblemsPage(
  sendResponse: (response: BackgroundResponse) => void,
) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const activeTab = tabs[0]

    if (!activeTab?.id) {
      sendResponse({ success: false, error: ERROR_MESSAGES.INVALID_TAB })
      return
    }

    await chrome.tabs.update(activeTab.id, {
      url: 'https://solved.ac/problems',
    })

    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === activeTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener)
        sendResponse({ success: true, message: '페이지 이동 완료' })
      }
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR

    sendResponse({ success: false, error: errorMessage })
  }
}

async function handleToggleExtension(
  message: ToggleExtensionMessage,
  sendResponse: (response: BackgroundResponse) => void,
): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const activeTab = tabs[0]

    if (!activeTab?.id || !activeTab.url) {
      sendResponse({ success: false, error: ERROR_MESSAGES.INVALID_TAB })
      return
    }

    try {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: 'EXTENSION_TOGGLED',
        isEnabled: message.isEnabled,
      })

      sendResponse({ success: true, message: '상태 변경 완료' })
    } catch (error) {
      console.warn('Background: Content Script 응답 없음', error)

      sendResponse({
        success: false,
        error: ERROR_MESSAGES.CONTENT_SCRIPT_NOT_READY,
      })
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR

    sendResponse({ success: false, error: errorMessage })
  }
}
