import type { User } from '@/types'

export class StorageService {
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

    return users
  }

  static async removeUser(userId: string) {
    const users = await this.getUsers()
    const filteredUsers = users.filter((u) => u.userId !== userId)

    await chrome.storage.local.set({ users: filteredUsers })

    await this.removeUserProblemIds(userId)

    return filteredUsers
  }

  static async toggleUserSelection(userId: string) {
    const users = await this.getUsers()
    const userIndex = users.findIndex((u) => u.userId === userId)

    if (0 <= userIndex) {
      const user = users[userIndex]
      const newIsSelected = !user.isSelected

      users[userIndex] = { ...user, isSelected: newIsSelected }

      await chrome.storage.local.set({ users })
    }

    return users
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
    }
    return users
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
}
