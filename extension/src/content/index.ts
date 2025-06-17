import { ERROR_MESSAGES } from '@/constant'

interface ContentMessage {
  type: 'EXTENSION_TOGGLED'
  isEnabled: boolean
}

interface ContentScriptResponse {
  success: boolean
  message: string
  action?: 'UI_CREATED' | 'UI_REMOVED'
}

chrome.runtime.onMessage.addListener(
  (
    message: ContentMessage,
    _sender,
    sendResponse: (response: ContentScriptResponse) => void,
  ) => {
    if (message.type !== 'EXTENSION_TOGGLED') {
      sendResponse({
        success: false,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      })

      return true
    }

    if (message.isEnabled) {
      // TODO: UI 생성
      sendResponse({
        success: true,
        message: '익스텐션 활성화 완료',
        action: 'UI_CREATED',
      })
    } else {
      // TODO: UI 제거
      sendResponse({
        success: true,
        message: '익스텐션 비활성화 완료',
        action: 'UI_REMOVED',
      })
    }

    return true
  },
)
