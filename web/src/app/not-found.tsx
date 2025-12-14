import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/kempopedia" className="text-wiki-link hover:underline">
          Return to Kempopedia
        </Link>
      </div>
    </div>
  )
}
