import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticlesByTypeAsOf, getAllCategoriesAsync, isValidCategory, slugify } from '@/lib/articles'
import { KempopediaHeader } from '@/components/KempopediaHeader'
import { getKYDateFromCookie } from '@/lib/ky-date'

// Category metadata for display
const categoryMeta: Record<string, { label: string; description: string }> = {
  person: { label: 'People', description: 'Biographical articles about individuals in the Kempo universe' },
  place: { label: 'Places', description: 'Cities, states, regions, and other locations' },
  organization: { label: 'Organizations', description: 'Institutions, companies, parties, and academies' },
  event: { label: 'Events', description: 'Historical events and occurrences in Kempo history' },
  timeline: { label: 'Timeline', description: 'Chronological records by decade and year' },
  culture: { label: 'Culture and Entertainment', description: 'Popular culture, entertainment, and products' },
  concept: { label: 'Concepts', description: 'Ideas, theories, and abstract topics' },
}

interface PageProps {
  params: Promise<{ category: string }>
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getAllCategoriesAsync()
  return categories.map((cat) => ({
    category: cat.type,
  }))
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { category } = await params
  const meta = categoryMeta[category]
  if (!meta) {
    return { title: 'Category Not Found - Kempopedia' }
  }
  return {
    title: `${meta.label} - Kempopedia`,
    description: meta.description,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params

  // Check if valid category
  if (!isValidCategory(category)) {
    notFound()
  }

  const viewingDate = await getKYDateFromCookie()
  const articles = await getArticlesByTypeAsOf(category, viewingDate)
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
            <Link href="/kemponet/kempopedia" className="hover:underline">Kempopedia</Link>
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
                  <li key={article.id}>
                    <Link
                      href={`/kemponet/kempopedia/wiki/${slugify(article.frontmatter.title)}`}
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
            <Link href="/kemponet/kempopedia" className="text-wiki-link hover:underline">
              ← Back to Kempopedia
            </Link>
          </div>
        </div>
      </main>

    </div>
  )
}
