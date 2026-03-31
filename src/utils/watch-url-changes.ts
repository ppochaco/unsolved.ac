let lastUrl = location.href
let observer: MutationObserver | null = null

export function watchURLChanges(onUrlChange: () => void): void {
  if (observer) {
    observer.disconnect()
  }

  observer = new MutationObserver(() => {
    const currentUrl = location.href
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl
      onUrlChange()
    }
  })

  observer.observe(document, { subtree: true, childList: true })
}
