import { createContext, useContext } from 'react'

const PortalContainerContext = createContext<HTMLElement | null>(null)
const usePortalContainer = () => useContext(PortalContainerContext)

export { PortalContainerContext, usePortalContainer }
