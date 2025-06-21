import axios from 'axios'

import { ERROR_MESSAGES } from '@/constants'
import { fetchUserInfoApi, fetchUserProblemApi } from '@/services/api'
import type { BackgroundMessage, BackgroundResponse, User } from '@/types'

import { StorageService } from './storage'
import { TabService } from './tab'

export class BackgroundService {
  static async initialize() {
    await StorageService.initializeStorage()
  }

  static async toggleExtension(
    isEnabled: boolean,
    sendResponse: (response: BackgroundResponse<'TOGGLE_EXTENSION'>) => void,
  ) {
    try {
      await this.ensureSolvedAcPage()
      await this.updateExtensionEnabled(isEnabled)

      const successMessage = isEnabled ? '익스텐션 활성화' : '익스텐션 비활성화'

      sendResponse({
        success: true,
        message: successMessage,
        data: isEnabled,
      })
    } catch (error) {
      ErrorHandler.handleCommonError(error, sendResponse)
    }
  }

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
      const users = await StorageService.addUser(userData)
      await TabService.sendMessageToAllTabs({
        type: 'USERS_UPDATED',
        users,
      })

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
      const users = await StorageService.removeUser(userId)
      await TabService.sendMessageToAllTabs({
        type: 'USERS_UPDATED',
        users,
      })

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
      const users = await StorageService.toggleUserSelection(userId)
      await TabService.sendMessageToAllTabs({
        type: 'USERS_UPDATED',
        users,
      })

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
      const users = await StorageService.setUserFetchingStatusFalse(
        userId,
        problemIds,
      )
      await TabService.sendMessageToAllTabs({
        type: 'USERS_UPDATED',
        users,
      })

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
