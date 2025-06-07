import { GitHubLogoIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="text-plum-600 bg-plum-50 flex h-30 w-full flex-col items-center gap-1 pt-5 text-sm">
      <div className="flex items-center gap-2">
        <div>© 2025 unsolved.ac by ppochaco</div>
        <Link href="https://github.com/ppochaco/unsolved.ac">
          <GitHubLogoIcon />
        </Link>
      </div>
      <div>unsolved.ac는 solved.ac API 기반 비공식 서비스입니다.</div>
    </footer>
  )
}
