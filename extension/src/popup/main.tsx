import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'

import { QueryClientProvider } from '@tanstack/react-query'

import { Spinner } from '../components'
import '../index.css'
import { queryClient } from '../lib'
import { Popup } from './Popup'
import { PopupErrorFallback } from './PopupErrorFallback'

const container = document.getElementById('popup-root')

if (container) {
  const root = createRoot(container)
  root.render(
    <ErrorBoundary
      FallbackComponent={PopupErrorFallback}
      onReset={() => queryClient.clear()}
    >
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div className="w-60 py-5 text-center">
              <Spinner />
            </div>
          }
        >
          <Popup />
        </Suspense>
      </QueryClientProvider>
      ,
    </ErrorBoundary>,
  )
}
