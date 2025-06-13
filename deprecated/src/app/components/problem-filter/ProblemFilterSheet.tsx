'use client'

import { MixerHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Level, Tag } from '@/generated/prisma'

import { ProblemFilter } from './ProblemFilter'

interface ToggleProblemFilterButtonProps {
  levels: Level[]
  tags: Tag[]
}

export const ProblemFilterSheet = ({
  levels,
  tags,
}: ToggleProblemFilterButtonProps) => {
  return (
    <div className="w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="text-md ml-[-16]">
            <MixerHorizontalIcon />
            <span>필터</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-xs gap-0">
          <SheetHeader>
            <SheetTitle />
          </SheetHeader>
          <ProblemFilter levels={levels} tags={tags} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
