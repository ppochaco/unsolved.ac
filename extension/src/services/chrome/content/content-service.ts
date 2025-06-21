import { SOLVED_AC_PROBLEMS_URL } from '@/constants'
import { getExtensionEnabledApi } from '@/services/api'
import type { User } from '@/types'

import { DataService } from './data'
import { DOMService } from './dom'
import { StyleService } from './style'

export class ContentService {
  private static isInitialized = false

  static initialize() {
    if (this.isInitialized) return

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.checkInitialState(),
      )
    } else {
      this.checkInitialState()
    }

    this.isInitialized = true
  }

  private static async checkInitialState() {
    const isEnabled = await getExtensionEnabledApi()
    if (isEnabled) {
      this.enable()
    }
  }

  public static async enable() {
    DOMService.showShadowDOM()
    await DataService.loadUsers()
    this.applyColors()
  }

  public static async disable() {
    StyleService.resetAllStyles()
    DOMService.removeShadowDOM()
  }

  public static async updateUsers(users: User[]) {
    await DataService.updateUsers(users)

    const isEnabled = await getExtensionEnabledApi()

    if (isEnabled || this.hasShadowDOM()) {
      this.applyColors()
    }
  }

  public static async applyColors() {
    if (!this.isProblemsPage()) {
      StyleService.resetAllStyles()
      DOMService.removeShadowDOM()
      return
    }

    const isEnabled = await getExtensionEnabledApi()

    if (isEnabled && !this.hasShadowDOM()) {
      DOMService.showShadowDOM()
      await DataService.loadUsers()
    }

    setTimeout(() => {
      const userProblemIds = DataService.getUserProblemIds()
      StyleService.applyColors(userProblemIds)
    }, 100)
  }

  private static hasShadowDOM() {
    const shadowHost = document.getElementById('unsolved-ac-extension')
    const exists = shadowHost && document.body.contains(shadowHost)

    return !!exists
  }

  private static isProblemsPage() {
    const url = window.location.href

    return url.startsWith(SOLVED_AC_PROBLEMS_URL)
  }
}
