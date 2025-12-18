import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticlesByType, getAllCategories, isValidCategory } from '@/lib/articles'
import { KempopediaHeader } from '@/components/KempopediaHeader'

// Category metadata for display
const categoryMeta: Record<string, { label: string; description: string }> = {
  person: { label: 'People', description: 'Biographical articles about individuals in the Kempo universe' },
  place: { label: 'Places', description: 'Cities, states, regions, and other locations' },
  institution: { label: 'Institutions', description: 'Organizations, political parties, academies, and agencies' },
  event: { label: 'Events', description: 'Historical events and occurrences in Kempo history' },
  nation: { label: 'Nations', description: 'Countries and sovereign states' },
  concept: { label: 'Concepts', description: 'Ideas, theories, and abstract topics' },
  company: { label: 'Companies', description: 'Businesses and corporations' },
  product: { label: 'Products', description: 'Goods and manufactured items' },
}

// Generate static params for all categories
export function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((cat) => ({
    category: cat.type,
  }))
}

// Generate metadata for the page
export function generateMetadata({ params }: { params: { category: string } }) {
  const meta = categoryMeta[params.category]
  if (!meta) {
    return { title: 'Category Not Found - Kempopedia' }
  }
  return {
    title: `${meta.label} - Kempopedia`,
    description: meta.description,
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params

  // Check if valid category
  if (!isValidCategory(category)) {
    notFound()
  }

  const articles = getArticlesByType(category)
  const meta = categoryMeta[category] || {
    label: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Articles about ${category}s`,
  }

  return (
    <div className="min-h-screen bg-white">
      <KempopediaHeader />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="wiki-content">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/kempopedia" className="hover:underline">Kempopedia</Link>
            {' › '}
            <span>Category: {meta.label}</span>
          </nav>

          <h1>Category: {meta.label}</h1>

          <p className="text-gray-600 mb-6">{meta.description}</p>

          {articles.length === 0 ? (
            <p className="text-gray-500 italic">No articles in this category yet.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this category
              </p>

              <ul className="space-y-2">
                {articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/kempopedia/wiki/${article.slug}`}
                      className="text-wiki-link hover:underline"
                    >
                      {article.frontmatter.title}
                    </Link>
                    {article.frontmatter.subtype && (
                      <span className="text-gray-500 text-sm ml-2">
                        ({article.frontmatter.subtype.replace(/-/g, ' ')})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Back link */}
          <div className="mt-8 pt-4 border-t border-wiki-border">
            <Link href="/kempopedia" className="text-wiki-link hover:underline">
              ← Back to Kempopedia
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-wiki-border mt-8 py-4 text-center text-sm text-gray-500">
        <p>Kempopedia is part of the Kempo universe project</p>
      </footer>
    </div>
  )
}
