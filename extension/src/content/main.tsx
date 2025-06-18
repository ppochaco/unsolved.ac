import { createRoot } from 'react-dom/client'

import tailwindStyles from '../index.css?inline'
import { UserFilter } from './components'

export const createShadowDOM = (
  shadowRoot: ShadowRoot,
  onClose: () => void,
) => {
  const reactContainer = document.createElement('div')
  shadowRoot.appendChild(reactContainer)

  const styleElement = document.createElement('style')
  styleElement.textContent = tailwindStyles
  shadowRoot.appendChild(styleElement)

  const root = createRoot(reactContainer)

  root.render(<UserFilter onClose={onClose} />)

  return root
}
