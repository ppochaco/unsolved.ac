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
      <SelectTrigger className="w-full">
        <SelectValue placeholder="태그를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.key} className="flex w-full">
              <div>{tag.name}</div>
              <div className="text-plum-400">#{tag.key}</div>
              <div>{tag.problemCount}</div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
