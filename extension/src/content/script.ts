import type { Root } from 'react-dom/client'

import {
  getAllUserProblemIdsApi,
  getExtensionEnabledApi,
  toggleIsEnabledApi,
} from '@/services'
import type { User } from '@/types'

import { createShadowDOM } from './main'

type ToggleExtension = {
  type: 'EXTENSION_TOGGLED'
  isEnabled: boolean
}

type UsersUpdated = {
  type: 'USERS_UPDATED'
  users: User[]
}

export type ContentMessage = ToggleExtension | UsersUpdated
interface UserProblemData {
  userId: string
  problemIds: number[]
}

class UnsolvedACExtension {
  private shadowHost: HTMLDivElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private reactRoot: Root | null = null
  private isInitialized = false
  private allUsers: User[] = []
  private userProblemIds: UserProblemData[] = []

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
    const isEnabled = await getExtensionEnabledApi()

    if (isEnabled) {
      this.showShadowDOM()
      await this.loadInitialData()
    }
  }

  private async disableExtension() {
    await toggleIsEnabledApi(false)
    this.removeShadowDOM()
    this.resetAllStyles()
  }

  public showShadowDOM() {
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

  public removeShadowDOM() {
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

  public async loadInitialData() {
    const usersResponse = await chrome.runtime.sendMessage({
      type: 'GET_USERS',
    })

    if (usersResponse.success) {
      await this.updateUsers(usersResponse.data)
    }
  }

  public async updateUsers(users: User[]) {
    this.allUsers = users

    await this.loadSelectedUserProblemIds()

    this.applyColors()
  }

  public applyColors() {
    setTimeout(() => {
      this.colorProblemIds()
    }, 100)
  }

  private async loadSelectedUserProblemIds() {
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

  private colorProblemIds() {
    this.resetAllStyles()

    const table = document.querySelector('table')
    if (!table) return

    const links = table.querySelectorAll('tr td:first-child a')
    if (!links.length) return

    const { unionSet, intersectionSet } = this.calculateSets()

    links.forEach((link) => {
      const href = link.getAttribute('href')

      if (href) {
        const match = href.match(/\/problem\/(\d+)/)
        if (match) {
          const problemId = parseInt(match[1])

          let color: 'black' | 'gray' | 'purple'

          if (unionSet.has(problemId)) {
            color = intersectionSet.has(problemId) ? 'black' : 'gray'
          } else {
            color = 'purple'
          }

          this.applyColorStyle(link as HTMLElement, color)
        }
      }
    })
  }

  private calculateSets() {
    const unionSet = new Set(
      this.userProblemIds.flatMap(({ problemIds }) => problemIds),
    )
    let intersectionSet = new Set<number>()

    if (this.userProblemIds.length === 0) {
      return { unionSet, intersectionSet }
    }

    intersectionSet = new Set(this.userProblemIds[0].problemIds)

    for (let i = 1; i < this.userProblemIds.length; i++) {
      const currentSet = new Set(this.userProblemIds[i].problemIds)
      intersectionSet = new Set(
        [...intersectionSet].filter((id) => currentSet.has(id)),
      )
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
  switch (message.type) {
    case 'EXTENSION_TOGGLED':
      if (message.isEnabled) {
        extension.showShadowDOM()
        extension.loadInitialData()
      } else {
        extension.removeShadowDOM()
      }
      break

    case 'USERS_UPDATED':
      extension.updateUsers(message.users)
      break
  }
})

let lastUrl = location.href
new MutationObserver(() => {
  const currentUrl = location.href
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl
    extension.applyColors()
  }
}).observe(document, { subtree: true, childList: true })

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    extension.applyColors()
  })
} else {
  extension.applyColors()
}
