import type { Root } from 'react-dom/client'

import {
  getAllUserProblemIds,
  getExtensionEnabled,
  toggleIsEnabled,
} from '@/services'

import { createShadowDOM } from './main'

type ToggleExtension = {
  type: 'EXTENSION_TOGGLED'
  isEnabled: boolean
}

type UpdateSelectedUsers = {
  type: 'SELECTED_USERS_UPDATED'
  selectedUserIds: string[]
}

export type ContentMessage = ToggleExtension | UpdateSelectedUsers

class UnsolvedACExtension {
  private shadowHost: HTMLDivElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private reactRoot: Root | null = null
  private isInitialized = false
  private selectedUserIds: string[] = []
  private userProblemIds: Array<{ userId: string; problemIds: number[] }> = []

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (this.isInitialized) return

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.enableExtension(),
      )
    } else {
      this.enableExtension()
    }

    this.isInitialized = true
  }

  private async enableExtension() {
    const isEnabled = await getExtensionEnabled()

    if (isEnabled) {
      this.showShadowDOM()
    }
  }

  private async disableExtension() {
    await toggleIsEnabled(false)
    this.removeShadowDOM()
    this.resetAllStyles()
  }

  showShadowDOM() {
    if (this.shadowHost) return

    this.shadowHost = document.createElement('div')
    this.shadowHost.id = 'unsolved-ac-extension'
    this.shadowHost.style.cssText = `
        position: fixed;
        top: 82px;
        right: 10px;
        z-index: 10000000;
      `

    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'closed' })

    this.reactRoot = createShadowDOM(this.shadowRoot, () =>
      this.disableExtension(),
    )

    document.body.appendChild(this.shadowHost)
  }

  removeShadowDOM() {
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }

    if (this.shadowHost && this.shadowHost.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost)
    }

    this.shadowHost = null
    this.shadowRoot = null
  }

  async updateSelectedUsers(selectedUserIds: string[]) {
    this.selectedUserIds = selectedUserIds

    await this.loadUserProblemIdsFromStorage()

    setTimeout(() => {
      this.colorProblemIds()
    }, 100)
  }

  private async loadUserProblemIdsFromStorage() {
    const allUserProblems = await getAllUserProblemIds()

    const selectedUserProblems: Array<{
      userId: string
      problemIds: number[]
    }> = []

    for (const userId of this.selectedUserIds) {
      const problemIds = allUserProblems[userId]
      if (problemIds.length > 0) {
        selectedUserProblems.push({ userId, problemIds })
      }
    }

    this.userProblemIds = selectedUserProblems
  }

  private colorProblemIds() {
    this.resetAllStyles()

    const table = document.querySelector('table')

    if (!table) return

    const links = table.querySelectorAll('tr td:first-child a')

    const { unionSet, intersectionSet } = this.calculateSets()

    links.forEach((link) => {
      const href = link.getAttribute('href')

      if (href) {
        const match = href.match(/\/problem\/(\d+)/)
        if (match) {
          const problemId = parseInt(match[1])

          const color = unionSet.has(problemId)
            ? intersectionSet.has(problemId)
              ? 'black'
              : 'gray'
            : 'purple'

          this.applyColorStyle(link as HTMLElement, color)
        }
      }
    })
  }

  private calculateSets() {
    const unionSet = new Set<number>()
    let intersectionSet = new Set<number>()

    if (this.userProblemIds.length === 0) {
      return { unionSet, intersectionSet }
    }

    this.userProblemIds.forEach(({ problemIds }) => {
      problemIds.forEach((id) => unionSet.add(id))
    })

    for (const { problemIds } of this.userProblemIds) {
      const currentSet = new Set(problemIds)

      if (intersectionSet.size === 0) {
        intersectionSet = currentSet
      } else {
        intersectionSet = new Set(
          [...intersectionSet].filter((id) => currentSet.has(id)),
        )
      }
    }

    return { unionSet, intersectionSet }
  }

  private applyColorStyle(
    link: HTMLElement,
    color: 'black' | 'gray' | 'purple',
  ) {
    link.dataset.unsolvedacColor = color

    link.style.setProperty('font-weight', 'bold', 'important')

    switch (color) {
      case 'black':
        link.style.setProperty('color', '#1f132e', 'important')
        break

      case 'gray':
        link.style.setProperty('color', '#a39ea9', 'important')
        break

      case 'purple':
        link.style.setProperty('color', '#904eee', 'important')
        break
    }
  }

  private resetAllStyles() {
    const styledLinks = document.querySelectorAll('[data-unsolvedac-color]')
    styledLinks.forEach((link) => {
      const htmlLink = link as HTMLElement
      htmlLink.style.removeProperty('color')
      htmlLink.style.removeProperty('font-weight')
      htmlLink.removeAttribute('data-unsolvedac-color')
    })
  }
}

const extension = new UnsolvedACExtension()

chrome.runtime.onMessage.addListener((message: ContentMessage) => {
  if (message.type === 'EXTENSION_TOGGLED') {
    if (message.isEnabled) {
      extension.showShadowDOM()
    } else {
      extension.removeShadowDOM()
    }
    return
  }

  if (message.type === 'SELECTED_USERS_UPDATED') {
    extension.updateSelectedUsers(message.selectedUserIds)
    return
  }
})
