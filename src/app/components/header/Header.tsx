import Image from 'next/image'
import Link from 'next/link'

export const Header = () => {
  return (
    <header className="flex h-18 w-full items-center px-4">
      <Link href="/" className="flex items-center gap-1.5">
        <Image
          src="/favicon.ico"
          width={32}
          height={32}
          alt="unsolve.ac logo"
          className="object-contain"
        />
        <div className="font-roboto text-md">unsolved.ac</div>
      </Link>
    </header>
  )
}
