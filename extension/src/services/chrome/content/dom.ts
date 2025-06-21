import type { Root } from 'react-dom/client'

import { createShadowDOM } from '@/content'

export class DOMService {
  private static shadowHost: HTMLDivElement | null = null
  private static shadowRoot: ShadowRoot | null = null
  private static reactRoot: Root | null = null

  public static showShadowDOM() {
    if (this.shadowHost && document.body.contains(this.shadowHost)) {
      return
    }

    if (this.shadowHost && !document.body.contains(this.shadowHost)) {
      this.removeShadowDOM()
    }

    this.shadowHost = document.createElement('div')
    this.shadowHost.id = 'unsolved-ac-extension'
    this.shadowHost.style.cssText = `
      position: fixed;
      top: 20px;
      right: 70px;
      z-index: 10000000;
    `

    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'closed' })
    this.reactRoot = createShadowDOM(this.shadowRoot)

    document.body.appendChild(this.shadowHost)
  }

  public static removeShadowDOM() {
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }

    if (this.shadowHost?.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost)
    }

    this.shadowHost = null
    this.shadowRoot = null
  }
}
