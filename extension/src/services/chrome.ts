export const getIsEnabled = async () => {
  const { isEnabled } = await chrome.storage.local.get(['isEnabled'])

  return Boolean(isEnabled)
}

export const getIsSolvedAcPage = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]

  return currentTab?.url?.includes('solved.ac/problems') ?? false
}

export const toggleIsEnabled = async (isEnabled: boolean) => {
  await chrome.storage.local.set({ isEnabled })
  await chrome.runtime.sendMessage({
    type: 'TOGGLE_EXTENSION',
    isEnabled,
  })

  return isEnabled
}

export const navigateToSolvedAc = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })

  if (tabs[0]?.id) {
    await chrome.tabs.update(tabs[0].id, {
      url: 'https://solved.ac/problems',
    })
  }
}
