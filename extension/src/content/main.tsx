import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'

import { Spinner } from '@/components'
import { queryClient } from '@/libs'

import tailwindStyles from '../index.css?inline'
import { UserFilter } from './components'

export const createShadowDOM = (shadowRoot: ShadowRoot) => {
  const reactContainer = document.createElement('div')
  shadowRoot.appendChild(reactContainer)

  const styleElement = document.createElement('style')
  styleElement.textContent = tailwindStyles
  shadowRoot.appendChild(styleElement)

  const root = createRoot(reactContainer)

  root.render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Spinner />}>
        <UserFilter />
      </Suspense>
    </QueryClientProvider>,
  )

  return root
}
