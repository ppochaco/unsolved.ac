import { useEffect, useState } from 'react'

import { Label, Switch } from '@/components'

interface ToggleExtensionMessage {
  type: 'TOGGLE_EXTENSION'
  isEnabled: boolean
}

interface NavigationMessage {
  type: 'NAVIGATE_TO_PROBLEMS'
}

export const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [isProblemsPage, setIsProblemsPage] = useState(false)

  useEffect(() => {
    const loadState = async () => {
      try {
        const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
        setIsEnabled(Boolean(isEnabled))

        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        const activeTab = tabs[0]

        if (activeTab?.url) {
          setIsProblemsPage(activeTab.url.includes('solved.ac/problems'))
        }
      } catch (error) {
        console.error('Popup: 상태 로드 실패', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadState()
  }, [])

  const navigateToProblems = async (): Promise<void> => {
    try {
      const message: NavigationMessage = {
        type: 'NAVIGATE_TO_PROBLEMS',
      }

      await chrome.runtime.sendMessage(message)
    } catch (error) {
      console.error('Popup: 페이지 이동 실패', error)
    }
  }

  const toggleExtension = async (): Promise<void> => {
    const newIsEnabled = !isEnabled
    setIsEnabled(newIsEnabled)

    try {
      await chrome.storage.local.set({ isEnabled: newIsEnabled })

      const message: ToggleExtensionMessage = {
        type: 'TOGGLE_EXTENSION',
        isEnabled: newIsEnabled,
      }

      await chrome.runtime.sendMessage(message)

      if (!isProblemsPage && isEnabled === false) {
        await navigateToProblems()
      }
    } catch (error) {
      console.error('Popup: 상태 저장 실패', error)
      setIsEnabled(!newIsEnabled)
      await chrome.storage.local.set({ isEnabled: !newIsEnabled })
    }
  }

  if (isLoading) {
    return <div className="w-60 py-2 text-center">loading...</div>
  }

  return (
    <div className="flex w-60 flex-col gap-2.5 py-5">
      <h2 className="text-center text-xl font-bold">unsolved-ac</h2>
      <div className="flex justify-center gap-2">
        <Switch
          id="unsolved-mode"
          checked={isEnabled}
          onCheckedChange={toggleExtension}
        />
        <Label>unsolved 모두 찾기</Label>
      </div>
    </div>
  )
}
