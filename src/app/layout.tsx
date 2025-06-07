import { QueryClientProvider } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'

import { queryClient } from '@/lib'

import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  weight: '700', // bold
  variable: '--font-roboto',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // regular, medium, semibold, bold
  variable: '--font-inter',
})

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
    <html lang="ko" className={`${roboto.variable} ${inter.variable}`}>
      <QueryClientProvider client={queryClient}>
        <body>{children}</body>
      </QueryClientProvider>
    </html>
  )
}
