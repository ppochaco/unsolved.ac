import { NextRequest, NextResponse } from 'next/server'

import { PrismaClient } from '../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const match = pathname.match(/\/api\/users\/([^/]+)\/problem-ids/)
  const userId = match?.[1]

  if (!userId) {
    return NextResponse.json({ error: 'userId 파싱 실패' }, { status: 400 })
  }

  const { problemIds } = await req.json()

  await prisma.userProblemId.upsert({
    where: { userId },
    update: { problemIds },
    create: { userId, problemIds },
  })

  return NextResponse.json({ userId })
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')

  if (userId === null) {
    return NextResponse.json(
      { error: 'userId 파라미터는 필수입니다.' },
      { status: 400 },
    )
  }

  const result = await prisma.userProblemId.findUnique({
    where: { userId },
  })

  if (!result) {
    return NextResponse.json(
      { error: '데이터를 가져오는데 실패했습니다.' },
      { status: 404 },
    )
  }

  return NextResponse.json({
    problemIds: result.problemIds,
  })
}
