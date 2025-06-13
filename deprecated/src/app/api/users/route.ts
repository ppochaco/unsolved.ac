import axios from 'axios'
import { NextResponse } from 'next/server'

import { userApi } from '@/service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId)
    return NextResponse.json(
      { error: 'userId 파라미터는 필수입니다.' },
      { status: 400 },
    )

  try {
    const data = await userApi({ userId })

    return NextResponse.json(data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500
      const errorMessage =
        status === 404
          ? '유저를 찾을 수 없습니다.'
          : '데이터를 가져오는데 실패했습니다.'

      return NextResponse.json({ error: errorMessage }, { status })
    }

    return NextResponse.json(
      { error: '알 수 없는 서버 에러가 발생했습니다.' },
      { status: 500 },
    )
  }
}
