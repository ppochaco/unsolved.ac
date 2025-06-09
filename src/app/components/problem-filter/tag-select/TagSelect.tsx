import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components'
import { Tag } from '@/generated/prisma'

interface TagSelectProps {
  tags: Tag[]
  value?: string
  selectTag: (value: string) => void
}

export const TagSelect = ({ tags, value, selectTag }: TagSelectProps) => {
  return (
    <Select value={value || ''} onValueChange={selectTag}>
      <SelectTrigger className="relative w-full flex-1">
        <SelectValue placeholder="태그를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="max-w-min">
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.key} className="relative pr-16">
              <div className="flex max-w-52 flex-col items-start">
                <div>{tag.name}</div>
                <div className="text-plum-400">#{tag.key}</div>
              </div>
              <div className="absolute right-8 text-sm">{tag.problemCount}</div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
