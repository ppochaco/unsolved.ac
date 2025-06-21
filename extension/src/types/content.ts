import type { User } from './common'

type ToggleExtension = {
  type: 'EXTENSION_TOGGLED'
  isEnabled: boolean
}

type UsersUpdated = {
  type: 'USERS_UPDATED'
  users: User[]
}

type ContentMessage = ToggleExtension | UsersUpdated

export { type ContentMessage }
