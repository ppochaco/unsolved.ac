import type { ContentMessage } from '@/types'

export class TabService {
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
