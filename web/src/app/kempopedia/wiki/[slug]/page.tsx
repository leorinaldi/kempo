import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlugAsync, getAllArticleSlugs } from '@/lib/articles'
import Infobox from '@/components/Infobox'
import { AudioPlayer } from '@/components/AudioPlayer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlugAsync(slug)

  if (!article) {
    notFound()
  }

  const { frontmatter, htmlContent, infobox, media } = article

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
        <article className="wiki-content">
          {/* Infobox */}
          {infobox && (
            <Infobox
              title={frontmatter.title}
              type={infobox.type}
              image={infobox.image}
              fields={infobox.fields}
            />
          )}

          {/* Title */}
          <h1>{frontmatter.title}</h1>

          {/* Categories */}
          {frontmatter.categories && frontmatter.categories.length > 0 && (
            <div className="text-sm text-gray-500 mb-4">
              Categories:{' '}
              {frontmatter.categories.map((cat, i) => (
                <span key={cat}>
                  {i > 0 && ', '}
                  <Link
                    href={`/kempopedia/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-wiki-link hover:underline"
                  >
                    {cat}
                  </Link>
                </span>
              ))}
            </div>
          )}

          {/* Article content */}
          <div
            className="wiki-article-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Media section */}
          {media && media.length > 0 && (
            <div className="mt-8 border-t border-wiki-border pt-6">
              <h2 className="text-lg font-semibold mb-4">Media</h2>
              {media.map((item, index) => (
                <div key={index} className="mb-4">
                  {item.type === 'audio' && (
                    <div>
                      <AudioPlayer src={item.url} title={item.title} />
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div>
                      {item.title && (
                        <p className="text-sm font-medium text-gray-700 mb-2">{item.title}</p>
                      )}
                      <video
                        src={item.url}
                        controls
                        className="w-full max-w-xl rounded-lg"
                      />
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-wiki-border mt-8 py-4 text-center text-sm text-gray-500">
        <p>Kempopedia is part of the Kempo universe project</p>
      </footer>
    </div>
  )
}
