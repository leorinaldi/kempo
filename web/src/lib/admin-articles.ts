import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

// Path to admin content
const adminDirectory = path.join(process.cwd(), 'content', 'admin')

export interface AdminArticleFrontmatter {
  title: string
  slug: string
  type: string
  subtype?: string
  status: string
  tags?: string[]
}

export interface AdminArticle {
  slug: string
  frontmatter: AdminArticleFrontmatter
  content: string
  htmlContent: string
  infobox?: {
    type: string
    image?: { url: string; caption: string }
    fields: Record<string, unknown>
  }
}

export function getAdminArticleBySlug(slug: string): AdminArticle | null {
  try {
    const fullPath = path.join(adminDirectory, `${slug}.md`)
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Parse frontmatter
    const { data, content } = matter(fileContents)

    // Extract JSON infobox from content if present
    let cleanContent = content
    let infobox = undefined

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1])
        infobox = jsonData.infobox
      } catch {
        // Invalid JSON, ignore
      }
      cleanContent = content.replace(/```json\n[\s\S]*?\n```\n?/, '')
    }

    // Convert wikilinks [[Article Name]] to admin links for admin docs
    // or Kempopedia links for other content
    cleanContent = cleanContent.replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (_, target, display) => {
        const linkText = display || target
        const linkSlug = target.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        // Check if this is a simulation admin document
        const simulationDocs = [
          'simulation-advancement-approach',
          'spawn-registry',
          'possible-spawns',
          'real-world-events',
          'character-development-plan',
          'human-drama-amplification',
          'products-companies-culture',
          'additional-tasks'
        ]

        // Check if this is a project history document
        const projectHistoryDocs = [
          'project-history'
        ]

        if (simulationDocs.includes(linkSlug)) {
          return `<a href="/admin/simulation/${linkSlug}" class="wikilink">${linkText}</a>`
        }

        if (projectHistoryDocs.includes(linkSlug)) {
          return `<a href="/admin/project-history/${linkSlug}" class="wikilink">${linkText}</a>`
        }

        // Regular Kempopedia link
        return `<a href="/kempopedia/wiki/${linkSlug}" class="wikilink">${linkText}</a>`
      }
    )

    return {
      slug,
      frontmatter: data as AdminArticleFrontmatter,
      content: cleanContent,
      htmlContent: cleanContent,
      infobox,
    }
  } catch {
    return null
  }
}

export async function getAdminArticleBySlugAsync(slug: string): Promise<AdminArticle | null> {
  const article = getAdminArticleBySlug(slug)
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

export function getAllAdminArticleSlugs(): string[] {
  try {
    const files = fs.readdirSync(adminDirectory)
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => path.basename(file, '.md'))
  } catch {
    return []
  }
}
