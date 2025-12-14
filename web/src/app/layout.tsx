import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Kempopedia',
  description: 'The encyclopedia of the Kempo universe',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
