import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlugOrId, getAllArticleSlugsAsync, slugify, type InlineImage } from '@/lib/articles'
import Infobox from '@/components/Infobox'
import { ArticleImage } from '@/components/ArticleImage'
import { AudioPlayer } from '@/components/AudioPlayer'
import { VideoPlayer } from '@/components/VideoPlayer'
import { KempopediaHeader } from '@/components/KempopediaHeader'
import { getKYDateFromCookie } from '@/lib/ky-date'

// Force dynamic rendering to respect viewing date from cookies
export const dynamic = 'force-dynamic'

/**
 * Split HTML content by h2 headings and render with inline images
 */
function ArticleContentWithImages({
  htmlContent,
  inlineImages,
}: {
  htmlContent: string
  inlineImages?: InlineImage[]
}) {
  if (!inlineImages || inlineImages.length === 0) {
    // No inline images, render content directly
    return (
      <div
        className="wiki-article-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    )
  }

  // Split content by h2 headings
  // Match: <h2>...</h2> or <h2 id="...">...</h2>
  const sectionRegex = /<h2[^>]*>(.*?)<\/h2>/gi
  const sections: { heading: string | null; content: string }[] = []
  let lastIndex = 0
  let match

  // First, collect all h2 matches
  const matches: { heading: string; index: number; fullMatch: string }[] = []
  const contentCopy = htmlContent
  const regex = new RegExp(sectionRegex)

  while ((match = regex.exec(contentCopy)) !== null) {
    matches.push({
      heading: match[1].replace(/<[^>]+>/g, '').trim(), // Strip inner HTML tags
      index: match.index,
      fullMatch: match[0],
    })
  }

  // Build sections
  if (matches.length === 0) {
    // No h2 headings, treat entire content as intro
    sections.push({ heading: null, content: htmlContent })
  } else {
    // Content before first h2 is intro
    if (matches[0].index > 0) {
      sections.push({
        heading: null,
        content: htmlContent.slice(0, matches[0].index),
      })
    }

    // Each h2 starts a new section
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index
      const end = i + 1 < matches.length ? matches[i + 1].index : htmlContent.length
      sections.push({
        heading: matches[i].heading,
        content: htmlContent.slice(start, end),
      })
    }
  }

  // Group images by section
  const imagesBySection = new Map<string, InlineImage[]>()
  for (const img of inlineImages) {
    const sectionKey = img.section.toLowerCase()
    if (!imagesBySection.has(sectionKey)) {
      imagesBySection.set(sectionKey, [])
    }
    imagesBySection.get(sectionKey)!.push(img)
  }

  return (
    <div className="wiki-article-content">
      {sections.map((section, index) => {
        const sectionKey = section.heading?.toLowerCase() || 'intro'
        const sectionImages = imagesBySection.get(sectionKey) || []

        return (
          <div key={index} className="wiki-section">
            {/* Render images for this section */}
            {sectionImages.map((img, imgIndex) => (
              <ArticleImage
                key={`${img.imageId}-${imgIndex}`}
                src={img.url}
                alt={img.alt}
                caption={img.caption}
                position={img.position}
              />
            ))}
            {/* Render section content */}
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        )
      })}
    </div>
  )
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugsAsync()
  return slugs.map((slug) => ({ slug }))
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const viewingDate = await getKYDateFromCookie()
  const article = await getArticleBySlugOrId(slug, viewingDate)

  if (!article) {
    notFound()
  }

  const { frontmatter, htmlContent, infobox, inlineImages, media } = article

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

          {/* Article content with inline images */}
          <ArticleContentWithImages
            htmlContent={htmlContent}
            inlineImages={inlineImages}
          />

          {/* Media section */}
          {media && media.length > 0 && (
            <div className="mt-8 border-t border-wiki-border pt-6">
              <h2 className="text-lg font-semibold mb-4">Media</h2>
              {media.map((item, index) => (
                <div key={index} className="mb-4">
                  {item.type === 'audio' && (
                    <div>
                      {item.articleId && item.title ? (
                        <Link
                          href={`/kemponet/kempopedia/wiki/${item.articleId}`}
                          className="text-sm font-medium text-wiki-link hover:underline block mb-2"
                        >
                          {item.title}
                        </Link>
                      ) : null}
                      <AudioPlayer src={item.url} title={item.articleId ? undefined : item.title} />
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div>
                      {item.articleId && item.title ? (
                        <Link
                          href={`/kemponet/kempopedia/wiki/${item.articleId}`}
                          className="text-sm font-medium text-wiki-link hover:underline block mb-2"
                        >
                          {item.title}
                        </Link>
                      ) : null}
                      <VideoPlayer src={item.url} title={item.articleId ? undefined : item.title} />
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

    </div>
  )
}
