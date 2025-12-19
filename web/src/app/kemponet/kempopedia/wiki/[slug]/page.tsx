import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlugAsync, getAllArticleSlugs } from '@/lib/articles'
import Infobox from '@/components/Infobox'
import { AudioPlayer } from '@/components/AudioPlayer'
import { VideoPlayer } from '@/components/VideoPlayer'
import { KempopediaHeader } from '@/components/KempopediaHeader'

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
      <KempopediaHeader />

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
                      {item.article && item.title ? (
                        <Link
                          href={`/kemponet/kempopedia/wiki/${item.article}`}
                          className="text-sm font-medium text-wiki-link hover:underline block mb-2"
                        >
                          {item.title}
                        </Link>
                      ) : null}
                      <AudioPlayer src={item.url} title={item.article ? undefined : item.title} />
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div>
                      {item.article && item.title ? (
                        <Link
                          href={`/kemponet/kempopedia/wiki/${item.article}`}
                          className="text-sm font-medium text-wiki-link hover:underline block mb-2"
                        >
                          {item.title}
                        </Link>
                      ) : null}
                      <VideoPlayer src={item.url} title={item.article ? undefined : item.title} />
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
