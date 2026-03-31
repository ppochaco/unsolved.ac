import type { ContentMessage } from '@/types'
import { watchURLChanges } from '@/utils'

import { ContentService } from './content'

chrome.runtime.onMessage.addListener((message: ContentMessage) => {
  switch (message.type) {
    case 'EXTENSION_TOGGLED':
      if (message.isEnabled) {
        ContentService.enable()
      } else {
        ContentService.disable()
      }
      break

    case 'USERS_UPDATED':
      ContentService.updateUsers(message.users)
      break
  }
})

ContentService.initialize()
watchURLChanges(() => ContentService.applyColors())

const applyInitialColors = () => ContentService.applyColors()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyInitialColors)
} else {
  applyInitialColors()
}
