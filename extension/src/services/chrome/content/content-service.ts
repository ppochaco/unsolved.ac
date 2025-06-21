import { getExtensionEnabledApi } from '@/services/api'
import type { User } from '@/types'

import { DataService } from './data'
import { DOMService } from './dom'
import { StyleService } from './style'

export class ContentService {
  private static isInitialized = false
  private static isEnabled = false

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
    await this.loadInitialData()
  }

  public static async disable() {
    this.isEnabled = false
    StyleService.resetAllStyles()
    DOMService.removeShadowDOM()
  }

  private static async loadInitialData() {
    await DataService.loadUsers()
    this.applyColors()
  }

  public static async updateUsers(users: User[]) {
    await DataService.updateUsers(users)

    const currentEnabled = await getExtensionEnabledApi()
    this.isEnabled = currentEnabled

    const shouldApplyColors = this.isEnabled || this.hasShadowDOM()

    if (shouldApplyColors) {
      this.applyColors()
    }
  }

  public static applyColors() {
    if (!window.location.href.includes('solved.ac')) {
      return
    }

    setTimeout(() => {
      const userProblemIds = DataService.getUserProblemIds()
      StyleService.applyColors(userProblemIds)
    }, 100)
  }

  private static hasShadowDOM(): boolean {
    const shadowHost = document.getElementById('unsolved-ac-extension')
    const exists = shadowHost && document.body.contains(shadowHost)

    return !!exists
  }
}
