export const getExtensionEnabled = async () => {
  try {
    const { isEnabled } = await chrome.storage.local.get(['isEnabled'])
    return Boolean(isEnabled)
  } catch (error) {
    console.warn(error)
    throw new Error('설정을 불러올 수 없습니다')
  }
}

export const getIsSolvedAcPage = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]
    return currentTab?.url?.includes('solved.ac/problems') ?? false
  } catch (error) {
    console.warn(error)
    throw new Error('페이지 정보를 확인할 수 없습니다')
  }
}

export const extensionQueries = {
  all: () => ['extension'] as const,
  enabled: () => [...extensionQueries.all(), 'enabled'] as const,
  isSolvedAcPage: () => [...extensionQueries.all(), 'isSolvedAcPage'] as const,
}

export const setExtensionEnabled = async (isEnabled: boolean) => {
  try {
    await chrome.storage.local.set({ isEnabled })
  } catch (error) {
    console.warn(error)
    throw new Error('설정 저장에 실패했습니다')
  }
}

export const notifyExtensionEnabledChanged = async (isEnabled: boolean) => {
  try {
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_EXTENSION',
      isEnabled,
    })
  } catch (error) {
    console.warn('팝업에 상태 변경 알림 실패:', error)
  }
}

export const toggleIsEnabled = async (isEnabled: boolean) => {
  await setExtensionEnabled(isEnabled)
  await notifyExtensionEnabledChanged(isEnabled)

  return isEnabled
}

export const navigateToSolvedAc = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id) {
      await chrome.tabs.update(tabs[0].id, {
        url: 'https://solved.ac/problems',
      })
    } else {
      throw new Error('활성 탭을 찾을 수 없습니다')
    }
  } catch (error) {
    console.warn(error)
    throw new Error('페이지 이동에 실패했습니다')
  }
}
