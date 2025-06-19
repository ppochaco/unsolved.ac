import { Cross2Icon } from '@radix-ui/react-icons'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components'

import { SearchUserForm } from './search-user-form'

interface UserFilterProps {
  onClose: () => void
}

export const UserFilter = ({ onClose }: UserFilterProps) => {
  return (
    <Card className="relative w-fit">
      <CardHeader>
        <CardTitle className="text-center text-lg">unsolved-ac</CardTitle>
      </CardHeader>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="group absolute top-2 right-2 rounded-full"
      >
        <Cross2Icon className="text-plum-200 group-hover:text-plum-400 size-5" />
      </Button>
      <CardContent>
        <SearchUserForm />
      </CardContent>
    </Card>
  )
}
