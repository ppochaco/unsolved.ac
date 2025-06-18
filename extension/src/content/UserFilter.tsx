import { Button } from '@/components'

interface UserFilterProps {
  onClose: () => void
}

export const UserFilter = ({ onClose }: UserFilterProps) => {
  return (
    <div>
      <Button onClick={onClose}>close button</Button>
    </div>
  )
}
