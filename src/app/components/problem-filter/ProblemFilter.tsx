'use client'

import { useEffect, useState } from 'react'

import { ReloadIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'

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
  const [startLevel, setStartLevel] = useState<string>(START_LEVEL)
  const [endLevel, setEndLevel] = useState<string>(END_LEVEL)
  const [tag, setTag] = useState<string>()

  const getLevelId = (levelName: string) => {
    return levels.find((level) => level.name === levelName)?.id ?? 0
  }

  const applyFilter = () => {
    const startId = Math.min(getLevelId(startLevel), getLevelId(endLevel))
    const endId = Math.max(getLevelId(startLevel), getLevelId(endLevel))

    const params = new URLSearchParams(window.location.search)
    params.set('startLevel', String(startId))
    params.set('endLevel', String(endId))
    if (tag) params.set('tag', tag)
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  const resetFilter = () => {
    setStartLevel(START_LEVEL)
    setEndLevel(END_LEVEL)
    setTag(undefined)

    const params = new URLSearchParams(window.location.search)
    params.delete('startLevel')
    params.delete('endLevel')
    params.delete('tag')
    router.push(`${window.location.pathname}?${params}`)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.has('tag')) {
      params.delete('tag')
    }

    if (params.has('startLevel')) {
      params.delete('startLevel')
    }

    if (params.has('endLevel')) {
      params.delete('endLevel')
    }

    router.replace(`${window.location.pathname}?${params}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            selectLevel={setStartLevel}
          />
          <LevelSelect
            value={endLevel}
            levels={levels}
            selectLevel={setEndLevel}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>태그</div>
        <TagSelect tags={tags} value={tag} selectTag={setTag} />
      </div>
      <Button onClick={applyFilter} className="w-full font-normal">
        설정
      </Button>
    </div>
  )
}
