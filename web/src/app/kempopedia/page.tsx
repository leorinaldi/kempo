import Link from 'next/link'
import { getAllCategories, getAllArticles, getWikiLinkStats } from '@/lib/articles'
import { KempopediaHeader } from '@/components/KempopediaHeader'

export default function KempopediaHome() {
  const categories = getAllCategories()
  const allArticles = getAllArticles()
  const totalArticles = allArticles.length
  const linkStats = getWikiLinkStats()

  return (
    <div className="min-h-screen bg-white">
      <KempopediaHeader />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="wiki-content">
          <h1>Welcome to Kempopedia</h1>

          <p>
            <strong>Kempopedia</strong> is the comprehensive encyclopedia of the Kempo
            universe—an alternate branch of reality that diverged from our own around the
            late 1800s. By the 1950s, most major people, companies, and products have
            different names and variations from base reality, though technological progress
            follows a similar pace. Larger cities and nations retain their real-world names,
            but colleges and smaller towns often don&apos;t.
          </p>

          <p>
            All dates in Kempopedia use the <strong>k.y.</strong> (Kempo Year) system,
            which corresponds to Gregorian calendar numbering (e.g., 1952 k.y. ≈ 1952 AD
            in terms of the passage of time since the common era began).
          </p>

          <p className="text-sm text-gray-600 mt-4">
            Currently documenting <strong>{totalArticles}</strong> articles across {categories.length} categories,
            connected by <strong>{linkStats.totalLinks.toLocaleString()}</strong> internal links.
          </p>
        </div>

        {/* Categories Grid - outside wiki-content to avoid link styling */}
        <div className="max-w-4xl">
          <h2 className="text-2xl font-serif font-normal border-b border-wiki-border pb-1 mt-8 mb-4">Browse by Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {categories.map((category) => (
              <Link
                key={category.type}
                href={`/kempopedia/category/${category.type}`}
                className="block p-4 border border-wiki-border rounded hover:bg-wiki-background transition-colors no-underline"
              >
                <h3 className="text-lg font-semibold text-wiki-link mb-1">
                  {category.label}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <p className="text-xs text-gray-500">
                  {category.count} {category.count === 1 ? 'article' : 'articles'}
                  {linkStats.linksByCategory[category.type] > 0 && (
                    <> · {linkStats.linksByCategory[category.type]?.toLocaleString() || 0} links</>
                  )}
                </p>
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <h2 className="text-2xl font-serif font-normal border-b border-wiki-border pb-1 mt-8 mb-4">Quick Links</h2>

          <ul className="space-y-1 list-disc ml-6 mb-4">
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
