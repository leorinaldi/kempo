import Link from 'next/link'
import { getAllCategoriesAsync, getAllArticlesAsync, getWikiLinkStatsAsync } from '@/lib/articles'
import { KempopediaHeader } from '@/components/KempopediaHeader'

export default async function KempopediaHome() {
  const categories = await getAllCategoriesAsync()
  const allArticles = await getAllArticlesAsync()
  const totalArticles = allArticles.length
  const linkStats = await getWikiLinkStatsAsync()

  return (
    <div className="min-h-screen bg-white">
      <KempopediaHeader />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="wiki-content">
          <h1>Kempopedia</h1>

          <p>
            <strong>Kempopedia</strong> is the comprehensive encyclopedia of the Kempo universe.
            Currently documenting <strong>{totalArticles}</strong> articles across {categories.length} categories,
            connected by <strong>{linkStats.totalLinks.toLocaleString()}</strong> links.
            <em> Note: All dates in k.y. (Kempo Years), unless otherwise indicated.</em>
          </p>
        </div>

        {/* Categories Grid - outside wiki-content to avoid link styling */}
        <div className="max-w-4xl">
          <h2 className="text-2xl font-serif font-normal border-b border-wiki-border pb-1 mt-4 mb-4">Browse by Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {categories.map((category) => (
              <Link
                key={category.type}
                href={`/kemponet/kempopedia/category/${category.type}`}
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
              <Link href="/kemponet/kempopedia/wiki/master-timeline" className="text-wiki-link hover:underline">
                Master Timeline
              </Link>
              {' — '}
              <span className="text-gray-600">Chronological history of the Kempo universe</span>
            </li>
          </ul>
        </div>
      </main>

    </div>
  )
}
