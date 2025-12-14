import Link from 'next/link'
import { getAllArticles } from '@/lib/articles'

export default function KempopediaHome() {
  const articles = getAllArticles()

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
            universe, a fictional world where history diverged starting in 1950 k.y.
          </p>

          <p>
            All dates in Kempopedia use the <strong>k.y.</strong> (Kempo Year) system,
            which matches standard Gregorian years (e.g., 1952 k.y. = 1952 AD).
          </p>

          <h2>All Articles</h2>

          {articles.length === 0 ? (
            <p className="text-gray-500 italic">No articles yet.</p>
          ) : (
            <ul>
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/kempopedia/wiki/${article.slug}`}
                    className="text-wiki-link hover:underline"
                  >
                    {article.frontmatter.title}
                  </Link>
                  {article.frontmatter.type && (
                    <span className="text-gray-500 text-sm ml-2">
                      ({article.frontmatter.type})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <h2>About the Calendar</h2>

          <p>
            The <strong>k.y.</strong> (Kempo Year) system uses the same numbering as
            standard Gregorian years. The suffix simply indicates that events occur
            within the Kempo fictional universe rather than real-world history.
          </p>
          <p>
            The Kempo timeline diverges from real-world history beginning in <strong>1950 k.y.</strong>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-wiki-border mt-8 py-4 text-center text-sm text-gray-500">
        <p>Kempopedia is part of the Kempo universe project</p>
      </footer>
    </div>
  )
}
