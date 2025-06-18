import type { Root } from 'react-dom/client'

import { getExtensionEnabled, toggleIsEnabled } from '@/services'

import { createShadowDOM } from './main'

interface ContentMessage {
  type: 'EXTENSION_TOGGLED'
  isEnabled: boolean
}

class UnsolvedACExtension {
  private shadowHost: HTMLDivElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private reactRoot: Root | null = null
  private isInitialized = false

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
  }

  showShadowDOM() {
    if (this.shadowHost) return

    this.shadowHost = document.createElement('div')
    this.shadowHost.id = 'unsolved-ac-extension'
    this.shadowHost.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
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
}

const extension = new UnsolvedACExtension()

chrome.runtime.onMessage.addListener((message: ContentMessage) => {
  if (message.type !== 'EXTENSION_TOGGLED') return

  try {
    if (message.isEnabled) {
      extension.showShadowDOM()
    } else {
      extension.removeShadowDOM()
    }
  } catch (error) {
    console.warn('UI 생성/제거 실패:', error)
  }
})
