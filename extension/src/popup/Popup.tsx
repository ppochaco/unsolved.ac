import { useEffect, useState } from 'react'

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
    } catch (error) {
      console.error('Popup: 상태 저장 실패', error)
      setIsEnabled(!newIsEnabled)
      await chrome.storage.local.set({ isEnabled: !newIsEnabled })
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          width: '300px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      style={{
        width: '300px',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px' }}>unsolved-ac</h2>
      </div>

      {!isProblemsPage ? (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={navigateToProblems}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            solved.ac 문제집으로 이동
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={toggleExtension}
              style={{ marginRight: '8px' }}
            />
            활성화
          </label>

          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            상태:
            <span
              style={{
                marginLeft: '8px',
                color: isEnabled ? '#28a745' : '#6c757d',
                fontWeight: 'bold',
              }}
            >
              {isEnabled ? '활성화' : '비활성화'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
