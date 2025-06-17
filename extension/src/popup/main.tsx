import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'

import '../index.css'
import { queryClient } from '../lib'
import { Popup } from './Popup'

const container = document.getElementById('popup-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <QueryClientProvider client={queryClient}>
      <Popup />
    </QueryClientProvider>,
  )
}
