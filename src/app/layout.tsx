import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'unsolved.ac - 친구들과 안 푼 백준 문제 찾기',
  description:
    '여러 명이 아직 풀지 않은 백준 문제를 쉽게 비교하고, 원하는 조건으로 필터링해보세요.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
