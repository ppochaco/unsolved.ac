import { getAllUserProblemIdsApi } from '@/services'
import type { User, UserProblemIds } from '@/types'

export class DataService {
  private static allUsers: User[] = []
  private static userProblemIds: UserProblemIds[] = []

  public static async loadUsers() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_USERS' })

    if (response.success) {
      this.allUsers = response.data
      await this.loadSelectedUserProblemIds()
    }

    return this.allUsers
  }

  public static async updateUsers(users: User[]) {
    this.allUsers = users
    await this.loadSelectedUserProblemIds()
  }

  private static async loadSelectedUserProblemIds() {
    const allUserProblems = await getAllUserProblemIdsApi()
    const selectedUsers = this.allUsers.filter(
      (user) => user.isSelected && !user.isFetchingProblem,
    )

    this.userProblemIds = selectedUsers
      .map((user) => ({
        userId: user.userId,
        problemIds: allUserProblems[user.userId] || [],
      }))
      .filter((userData) => userData.problemIds.length > 0)
  }

  public static getUserProblemIds() {
    return this.userProblemIds
  }
}
