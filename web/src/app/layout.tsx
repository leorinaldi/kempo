import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Kempo',
  description: 'The Kempo universe',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        <Providers>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  )
}
