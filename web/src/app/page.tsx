import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-serif mb-4">Kempo</h1>
        <p className="text-gray-600 mb-8">A fictional universe simulation</p>
        <Link
          href="/kempopedia"
          className="text-wiki-link hover:underline text-lg"
        >
          Enter Kempopedia
        </Link>
      </div>
    </main>
  )
}
