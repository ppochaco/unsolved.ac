'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export const Header = () => {
  const router = useRouter()

  const resetSearchParams = () => {
    const params = new URLSearchParams(window.location.search)
    const userIds = params.getAll('userId')

    const newParams = new URLSearchParams()
    userIds.forEach((userId) => newParams.append('userId', userId))

    router.push(`/?${newParams}`)
  }

  return (
    <header className="flex h-18 w-full items-center px-4">
      <div
        onClick={() => resetSearchParams()}
        className="flex items-center gap-1.5 hover:cursor-pointer"
      >
        <Image
          src="/favicon.ico"
          width={32}
          height={32}
          alt="unsolve.ac logo"
          className="object-contain"
        />
        <div className="font-roboto text-md">unsolved.ac</div>
      </div>
    </header>
  )
}
