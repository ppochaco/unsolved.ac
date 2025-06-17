import axios from 'axios'
import { NextResponse } from 'next/server'

import { userProblemApi } from '@/service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const raw_page = searchParams.get('page') ?? '1'
  const page = isNaN(parseInt(raw_page)) ? 1 : parseInt(raw_page)

  if (userId === null)
    return NextResponse.json(
      { error: 'userId 파라미터는 필수입니다.' },
      { status: 400 },
    )

  try {
    const data = await userProblemApi({ userId, page })
    const problemIds = data.items.map((p) => p.problemId)

    return NextResponse.json({
      count: data.count,
      problemIds,
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500

      return NextResponse.json(
        { error: '데이터를 가져오는데 실패했습니다.' },
        { status },
      )
    }

    return NextResponse.json(
      { error: '알 수 없는 서버 에러가 발생했습니다.' },
      { status: 500 },
    )
  }
}
