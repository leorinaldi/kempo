import Link from 'next/link'
import { getAllCategories, getAllArticles } from '@/lib/articles'

export default function KempopediaHome() {
  const categories = getAllCategories()
  const allArticles = getAllArticles()
  const totalArticles = allArticles.length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-wiki-border bg-wiki-background">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/kempopedia" className="text-2xl font-serif text-gray-900">
            Kempopedia
          </Link>
          <p className="text-sm text-gray-600">The encyclopedia of the Kempo universe</p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="wiki-content">
          <h1>Welcome to Kempopedia</h1>

          <p>
            <strong>Kempopedia</strong> is the comprehensive encyclopedia of the{' '}
            <Link href="/" className="text-wiki-link hover:underline">Kempo</Link>{' '}
            universe, a fictional world where history diverged from historical reality
            sometime in the late 1800s, at first in minor ways, but with divergence
            increasing over time, especially after 1950 k.y.
          </p>

          <p>
            All dates in Kempopedia use the <strong>k.y.</strong> (Kempo Year) system,
            which matches standard Gregorian years (e.g., 1952 k.y. = 1952 AD).
          </p>

          <p className="text-sm text-gray-600 mt-4">
            Currently documenting <strong>{totalArticles}</strong> articles across {categories.length} categories.
          </p>

          {/* Categories Grid */}
          <h2>Browse by Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {categories.map((category) => (
              <Link
                key={category.type}
                href={`/kempopedia/category/${category.type}`}
                className="block p-4 border border-wiki-border rounded hover:bg-wiki-background transition-colors"
              >
                <h3 className="text-lg font-semibold text-wiki-link mb-1">
                  {category.label}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <p className="text-xs text-gray-500">
                  {category.count} {category.count === 1 ? 'article' : 'articles'}
                </p>
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <h2>Quick Links</h2>

          <ul className="space-y-1">
            <li>
              <Link href="/kempopedia/wiki/master-timeline" className="text-wiki-link hover:underline">
                Master Timeline
              </Link>
              {' — '}
              <span className="text-gray-600">Chronological history of the Kempo universe</span>
            </li>
          </ul>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-wiki-border mt-8 py-4 text-center text-sm text-gray-500">
        <p>Kempopedia is part of the Kempo universe project</p>
      </footer>
    </div>
  )
}
