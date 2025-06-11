'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Slider } from '@/components'
import { DEFAULT_TIER_SVG, END_LEVEL_ID, START_LEVEL_ID } from '@/constant'
import { Level } from '@/generated/prisma'

interface LevelSliderProps {
  levels: Level[]
  startLevel: number
  endLevel: number
}

export const LevelSlider = ({
  levels,
  startLevel,
  endLevel,
}: LevelSliderProps) => {
  const router = useRouter()

  const [range, setRange] = useState<[number, number]>([
    START_LEVEL_ID,
    END_LEVEL_ID,
  ])

  useEffect(() => {
    setRange([startLevel, endLevel])
  }, [startLevel, endLevel])

  const setSearchParams = (levels: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(levels).forEach(([key, value]) => params.set(key, value))

    router.replace(`${window.location.pathname}?${params}`)
  }

  const handleChange = (value: [number, number]) => {
    setRange(value)
    setSearchParams({
      startLevel: value[0].toString(),
      endLevel: value[1].toString(),
    })
  }

  const LEVEL_MARK_STEP = 5

  return (
    <div>
      <Slider
        value={range}
        onValueChange={handleChange}
        min={START_LEVEL_ID}
        max={END_LEVEL_ID}
        step={1}
      />
      <div className="flex items-center pt-2">
        <div className="flex flex-1 justify-between">
          {levels.map((level) => {
            if (level.id % LEVEL_MARK_STEP === 1)
              return (
                <Image
                  key={level.id}
                  src={level.imageUrl ?? DEFAULT_TIER_SVG}
                  width={20}
                  height={20}
                  className="h-4 w-4"
                  alt={`${level.name} svg`}
                />
              )
          })}
        </div>
        <div className="flex w-9 justify-end">
          <Image
            key={END_LEVEL_ID}
            src={levels[levels.length - 1].imageUrl ?? DEFAULT_TIER_SVG}
            width={20}
            height={20}
            className="h-4 w-4"
            alt={`${levels[levels.length - 1].name} svg`}
          />
        </div>
      </div>
    </div>
  )
}
