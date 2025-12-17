import Link from 'next/link'
import { Suspense } from 'react'
import { KempoNetRedirect } from '@/components/KempoNetRedirect'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Suspense fallback={null}>
        <KempoNetRedirect />
      </Suspense>
      <div className="text-center">
        <h1 className="text-4xl font-serif mb-4">Kempo</h1>
        <p className="text-gray-600 mb-8">A fictional universe simulation</p>
        <div className="flex flex-col gap-4">
          <Link
            href="/radio"
            className="text-amber-700 hover:text-amber-900 hover:underline text-lg"
          >
            Kempo Radio
          </Link>
          <Link
            href="/tv"
            className="text-green-700 hover:text-green-900 hover:underline text-lg"
          >
            Kempo TV
          </Link>
          <Link
            href="/kemponet"
            className="text-purple-700 hover:text-purple-900 hover:underline text-lg"
          >
            KempoNet
          </Link>
        </div>
      </div>
    </main>
  )
}
