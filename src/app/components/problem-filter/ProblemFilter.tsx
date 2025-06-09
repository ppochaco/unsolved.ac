'use client'

import { useEffect, useMemo, useState } from 'react'

import { ReloadIcon } from '@radix-ui/react-icons'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components'
import { END_LEVEL, START_LEVEL } from '@/constant'
import { Level, Tag } from '@/generated/prisma'

import { LevelSelect } from './level-select'
import { TagSelect } from './tag-select'

interface ProblemFilterProps {
  levels: Level[]
  tags: Tag[]
}

export const ProblemFilter = ({ levels, tags }: ProblemFilterProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startLevel, setStartLevel] = useState<string>(START_LEVEL)
  const [endLevel, setEndLevel] = useState<string>(END_LEVEL)
  const [tag, setTag] = useState<string>()

  const levelNametoId = useMemo(() => {
    const map = new Map(levels.map((level) => [level.name, level.id]))
    return (name: string) => map.get(name) ?? 0
  }, [levels])

  const levelIdtoName = useMemo(() => {
    const map = new Map(levels.map((level) => [level.id, level.name]))
    return (id: number) => map.get(id)
  }, [levels])

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

  useEffect(() => {
    const startId = searchParams.get('startLevel')
    const endId = searchParams.get('endLevel')
    const tagParam = searchParams.get('tag')

    setStartLevel(levelIdtoName(Number(startId)) ?? START_LEVEL)
    setEndLevel(levelIdtoName(Number(endId)) ?? END_LEVEL)
    setTag(tagParam ?? undefined)
  }, [searchParams, levelIdtoName])

  return (
    <div className="flex h-full w-xs flex-col gap-5 p-4">
      <div className="flex items-center justify-between">
        <div className="font-bold">필터</div>
        <Button variant="ghost" onClick={resetFilter}>
          <ReloadIcon />
          <div>초기화</div>
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div>난이도</div>
        <div className="flex gap-2">
          <LevelSelect
            value={startLevel}
            levels={levels}
            selectLevel={(level) => {
              setStartLevel(level)
              setSearchParam('startLevel', levelNametoId(level).toString())
            }}
          />
          <LevelSelect
            value={endLevel}
            levels={levels}
            selectLevel={(level) => {
              setEndLevel(level)
              setSearchParam('endLevel', levelNametoId(level).toString())
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>태그</div>
        <TagSelect
          tags={tags}
          value={tag}
          selectTag={(tag) => {
            setTag(tag)
            setSearchParam('tag', tag)
          }}
        />
      </div>
    </div>
  )
}
