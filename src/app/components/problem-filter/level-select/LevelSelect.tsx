import Image from 'next/image'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components'
import { DEFAULT_TIER_SVG } from '@/constant'
import { Level } from '@/generated/prisma'

interface LevelSelectProps {
  levels: Level[]
  value: string
  selectLevel: (level: string) => void
}

export const LevelSelect = ({
  levels,
  value,
  selectLevel,
}: LevelSelectProps) => {
  return (
    <Select value={value} onValueChange={selectLevel}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {levels.map((level) => (
            <SelectItem key={level.id} value={level.name}>
              <Image
                src={level.imageUrl ?? DEFAULT_TIER_SVG}
                width={20}
                height={20}
                className="h-4 w-4"
                alt={`${level.name} svg`}
              />
              <div>{level.name}</div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
