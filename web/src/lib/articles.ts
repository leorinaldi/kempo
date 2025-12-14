import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

// Path to articles in the content folder
const articlesDirectory = path.join(process.cwd(), 'content', 'articles')

export interface ArticleFrontmatter {
  title: string
  slug: string
  type: string
  status: string
  categories: string[]
}

export interface Article {
  slug: string
  frontmatter: ArticleFrontmatter
  content: string
  htmlContent: string
  infobox?: {
    type: string
    image?: { url: string; caption: string }
    fields: Record<string, unknown>
  }
  timelineEvents?: Array<{
    date: string
    headline: string
    description: string
  }>
}

export function getAllArticleSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(articlesDirectory)
    return fileNames
      .filter(name => name.endsWith('.md'))
      .map(name => name.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

export function getAllArticles(): Article[] {
  const slugs = getAllArticleSlugs()
  return slugs
    .map(slug => getArticleBySlug(slug))
    .filter((article): article is Article => article !== null)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Parse frontmatter
    const { data, content } = matter(fileContents)

    // Extract JSON infobox from content if present
    let cleanContent = content
    let infobox = undefined
    let timelineEvents = undefined

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1])
        infobox = jsonData.infobox
        timelineEvents = jsonData.timeline_events
      } catch {
        // Invalid JSON, ignore
      }
      cleanContent = content.replace(/```json\n[\s\S]*?\n```\n?/, '')
    }

    // Convert wikilinks [[Article Name]] to HTML links
    cleanContent = cleanContent.replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (_, target, display) => {
        const linkText = display || target
        const linkSlug = target.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return `<a href="/kempopedia/wiki/${linkSlug}" class="wikilink">${linkText}</a>`
      }
    )

    // Convert markdown to HTML synchronously for simplicity
    // In production, you'd want to handle this async
    const processedContent = cleanContent

    return {
      slug,
      frontmatter: data as ArticleFrontmatter,
      content: cleanContent,
      htmlContent: processedContent,
      infobox,
      timelineEvents,
    }
  } catch {
    return null
  }
}

export async function getArticleBySlugAsync(slug: string): Promise<Article | null> {
  const article = getArticleBySlug(slug)
  if (!article) return null

  // Process markdown to HTML
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(article.content)

  return {
    ...article,
    htmlContent: processedContent.toString(),
  }
}
