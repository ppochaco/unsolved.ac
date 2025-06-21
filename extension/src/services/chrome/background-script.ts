import type { BackgroundMessage, BackgroundResponse } from '@/types'

import { BackgroundService } from './background'

chrome.runtime.onInstalled.addListener(async () => {
  await BackgroundService.initialize()
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
        BackgroundService.toggleExtension(message.isEnabled, sendResponse)
        return true

      case 'GET_USER_INFO':
        BackgroundService.getUserInfo(message.userId, sendResponse)
        return true

      case 'FETCH_USER_PROBLEM_IDS':
        BackgroundService.fetchUserProblemIds(
          message.userId,
          message.page,
          sendResponse,
        )
        return true

      case 'ADD_USER':
        BackgroundService.addUser(message.user, sendResponse)
        return true

      case 'REMOVE_USER':
        BackgroundService.removeUser(message.userId, sendResponse)
        return true

      case 'TOGGLE_USER_SELECTION':
        BackgroundService.toggleUserSelection(message.userId, sendResponse)
        return true

      case 'SET_USER_FETCHING_STATUS':
        BackgroundService.setUserFetchingStatus(
          message.userId,
          message.problemIds,
          sendResponse,
        )
        return true

      case 'GET_USERS':
        BackgroundService.getUsers(sendResponse)
        return true

      case 'ADD_USER_PROBLEM_IDS':
        BackgroundService.addUserProblemIds(
          message.userId,
          message.problemIds,
          sendResponse,
        )
        return true

      case 'GET_ALL_USER_PROBLEM_IDS':
        BackgroundService.getAllUserProblemIds(sendResponse)
        return true

      default:
        return false
    }
  },
)
