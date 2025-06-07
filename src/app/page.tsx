import { prisma } from '@/lib/prisma'

import {
  Footer,
  Header,
  ProblemFilter,
  ProblemList,
  ToggleProblemFilterButton,
  UserFilter,
} from './components'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const { page } = searchParams

  const levels = await prisma.level.findMany()

  return (
    <div className="font-inter text-plum-950 flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="hidden xl:flex">
          <ProblemFilter />
        </div>
        <div className="flex w-full flex-col">
          <UserFilter />
          <div className="flex xl:hidden">
            <ToggleProblemFilterButton />
          </div>
          <ProblemList levels={levels} page={page ? parseInt(page) : 1} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
