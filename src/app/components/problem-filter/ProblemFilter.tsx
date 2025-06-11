'use client'

import { useMemo } from 'react'

import { DotFilledIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button, Separator } from '@/components'
import {
  END_LEVEL,
  END_LEVEL_ID,
  START_LEVEL,
  START_LEVEL_ID,
} from '@/constant'
import { Level, Tag } from '@/generated/prisma'
import { cn } from '@/lib'

import { LevelSelect } from './level-select'
import { LevelSlider } from './level-slider'
import { TagSelect } from './tag-select'

interface ProblemFilterProps {
  levels: Level[]
  tags: Tag[]
}

export const ProblemFilter = ({ levels, tags }: ProblemFilterProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const levelNametoId = useMemo(() => {
    const map = new Map(levels.map((level) => [level.name, level.id]))
    return (name: string) => map.get(name) ?? 0
  }, [levels])

  const levelIdtoName = useMemo(() => {
    const map = new Map(levels.map((level) => [level.id, level.name]))
    return (id: number) => map.get(id)
  }, [levels])

  const startLevelId = Number(searchParams.get('startLevel') ?? START_LEVEL_ID)
  const endLevelId = Number(searchParams.get('endLevel') ?? END_LEVEL_ID)
  const startLevel = levelIdtoName(startLevelId) ?? START_LEVEL
  const endLevel = levelIdtoName(endLevelId) ?? END_LEVEL
  const tag = searchParams.get('tag') ?? undefined

  const setSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set(key, value)
    router.push(`${window.location.pathname}?${params}`)
  }

  const resetFilter = () => {
    const params = new URLSearchParams(window.location.search)

    params.delete('startLevel')
    params.delete('endLevel')
    params.delete('tag')

    router.push(`${window.location.pathname}?${params}`)
  }

  return (
    <div className="flex h-full w-xs flex-col gap-4 px-4">
      <div className="flex items-center justify-between">
        <div className="font-bold">필터</div>
        <Button variant="ghost" onClick={resetFilter}>
          <ReloadIcon />
          <div>초기화</div>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <div>난이도</div>
        <LevelSlider
          levels={levels}
          startLevel={startLevelId < endLevelId ? startLevelId : endLevelId}
          endLevel={startLevelId < endLevelId ? endLevelId : startLevelId}
        />
        <div className="flex gap-2">
          <LevelSelect
            value={startLevel}
            levels={levels}
            selectLevel={(level) => {
              setSearchParam('startLevel', levelNametoId(level).toString())
            }}
          />
          <LevelSelect
            value={endLevel}
            levels={levels}
            selectLevel={(level) => {
              setSearchParam('endLevel', levelNametoId(level).toString())
            }}
          />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <div>태그</div>
        <TagSelect
          tags={tags}
          value={tag}
          selectTag={(tag) => {
            setSearchParam('tag', tag)
          }}
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <div>solved 상태</div>
        <ul className="flex flex-col gap-1 text-sm">
          {SOLVED_STATES.map(({ label, textColor, dotColor }) => (
            <li
              key={label}
              className={cn('flex items-center gap-2', textColor)}
            >
              <DotFilledIcon
                className={cn('size-2.5 rounded-full', dotColor)}
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const SOLVED_STATES = [
  {
    label: '모두 unsolved',
    textColor: 'text-primary',
    dotColor: 'bg-primary',
  },
  {
    label: '일부 unsolved',
    textColor: 'text-plum-400',
    dotColor: 'bg-plum-400',
  },
  {
    label: '모두 solved',
    textColor: '',
    dotColor: 'bg-plum-950',
  },
] as const
