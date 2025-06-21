import { ERROR_MESSAGES, SOLVED_AC_PROBLEMS_URL } from '@/constants'
import type { ContentMessage } from '@/types'

export class TabService {
  static async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]

    if (!currentTab?.id) {
      throw new Error(ERROR_MESSAGES.INVALID_TAB)
    }

    return currentTab
  }

  static async isSolvedAcProblemsPage(url?: string) {
    const urlToCheck = url ?? (await this.getCurrentTab()).url
    return urlToCheck?.includes('solved.ac/problems') ?? false
  }

  static async navigateToProblems() {
    await chrome.tabs.create({
      url: SOLVED_AC_PROBLEMS_URL,
      active: true,
    })
  }

  static async sendMessageToAllTabs(message: ContentMessage) {
    const solvedAcTabs = await chrome.tabs.query({ url: '*://solved.ac/*' })

    if (solvedAcTabs.length > 0) {
      for (const tab of solvedAcTabs) {
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, message)
        }
      }
    }
  }
}
