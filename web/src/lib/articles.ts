import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

// Path to articles in the content folder
const articlesDirectory = path.join(process.cwd(), 'content', 'articles')

export interface ParallelSwitchover {
  real_world: string
  wikipedia: string
}

export interface ArticleFrontmatter {
  title: string
  slug: string
  type: string
  subtype?: string
  status: string
  parallel_switchover?: ParallelSwitchover
  tags?: string[]
  dates?: string[]
  categories?: string[] // legacy support
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

// Recursively get all markdown files from a directory
function getAllMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        getAllMarkdownFiles(filePath, fileList)
      } else if (file.endsWith('.md')) {
        fileList.push(filePath)
      }
    })
  } catch {
    // Directory doesn't exist or can't be read
  }
  return fileList
}

export function getAllArticleSlugs(): string[] {
  const files = getAllMarkdownFiles(articlesDirectory)
  return files.map(file => {
    const relativePath = path.relative(articlesDirectory, file)
    // Remove .md extension and use just the filename as slug
    const fileName = path.basename(relativePath, '.md')
    return fileName
  })
}

export function getAllArticles(): Article[] {
  const files = getAllMarkdownFiles(articlesDirectory)
  const articles = files
    .map(file => {
      const slug = path.basename(file, '.md')
      return getArticleBySlug(slug, file)
    })
    .filter((article): article is Article => article !== null)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))

  return articles
}

// Find article file by slug (searches all subdirectories)
function findArticleFile(slug: string): string | null {
  const files = getAllMarkdownFiles(articlesDirectory)
  const match = files.find(file => path.basename(file, '.md') === slug)
  return match || null
}

// Convert k.y. date to timeline page and anchor
function dateToTimelineLink(dateStr: string): { page: string; anchor: string } {
  // Match patterns like "March 15, 1945 k.y." or "1945 k.y." or "June 1962 k.y."
  const fullDateMatch = dateStr.match(/(\w+)\s+(\d+),?\s+(\d+)\s*k\.y\./)
  const monthYearMatch = dateStr.match(/(\w+)\s+(\d+)\s*k\.y\./)
  const yearOnlyMatch = dateStr.match(/^(\d+)\s*k\.y\./)

  let year: string
  let anchor: string

  if (fullDateMatch) {
    const [, month, day, yearStr] = fullDateMatch
    year = yearStr
    const monthNum = getMonthNumber(month)
    anchor = `${year}-${monthNum}-${day.padStart(2, '0')}-ky`
  } else if (monthYearMatch && !fullDateMatch) {
    const [, month, yearStr] = monthYearMatch
    year = yearStr
    const monthNum = getMonthNumber(month)
    anchor = `${year}-${monthNum}-ky`
  } else if (yearOnlyMatch) {
    year = yearOnlyMatch[1]
    anchor = `${year}-ky`
  } else {
    // Fallback
    return { page: 'master-timeline', anchor: dateStr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
  }

  const yearNum = parseInt(year, 10)

  // Pre-1950: link to decade page
  // 1950+: link to year page
  if (yearNum < 1950) {
    const decade = Math.floor(yearNum / 10) * 10
    return { page: `${decade}s`, anchor }
  } else {
    return { page: year, anchor }
  }
}

function getMonthNumber(month: string): string {
  const months: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  }
  return months[month.toLowerCase()] || '01'
}

// Check if a wikilink target is a date
function isDateLink(target: string): boolean {
  return /\d+\s*k\.y\./.test(target)
}

export function getArticleBySlug(slug: string, filePath?: string): Article | null {
  try {
    const fullPath = filePath || findArticleFile(slug)
    if (!fullPath) {
      // Try direct path as fallback
      const directPath = path.join(articlesDirectory, `${slug}.md`)
      if (!fs.existsSync(directPath)) {
        return null
      }
      return getArticleBySlug(slug, directPath)
    }

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

        // Check if this is a date link (contains k.y.)
        if (isDateLink(target)) {
          const { page, anchor } = dateToTimelineLink(target)
          return `<a href="/kempopedia/wiki/${page}#${anchor}" class="wikilink wikilink-date">${linkText}</a>`
        }

        // Regular article link
        const linkSlug = target.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return `<a href="/kempopedia/wiki/${linkSlug}" class="wikilink">${linkText}</a>`
      }
    )

    return {
      slug,
      frontmatter: data as ArticleFrontmatter,
      content: cleanContent,
      htmlContent: cleanContent,
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

// Get all articles of a specific type/category
export function getArticlesByType(type: string): Article[] {
  const allArticles = getAllArticles()
  return allArticles.filter(article => article.frontmatter.type === type)
}

// Get all unique categories with their article counts
export interface CategoryInfo {
  type: string
  count: number
  label: string
  description: string
}

const categoryMeta: Record<string, { label: string; description: string; order: number }> = {
  person: { label: 'People', description: 'Biographical articles about individuals', order: 1 },
  place: { label: 'Places', description: 'Cities, states, nations, and locations', order: 2 },
  institution: { label: 'Institutions', description: 'Organizations, companies, parties, and academies', order: 3 },
  event: { label: 'Events', description: 'Historical events and occurrences', order: 4 },
  timeline: { label: 'Timeline', description: 'Chronological records by decade and year', order: 5 },
  science: { label: 'Science and Technology', description: 'Scientific ideas, technologies', order: 6 },
  culture: { label: 'Culture and Entertainment', description: 'Popular culture, entertainment, products, and celebrities', order: 7 },
  concept: { label: 'Other Concepts', description: 'Ideas, theories, and abstract topics', order: 99 },
}

export function getAllCategories(): CategoryInfo[] {
  const allArticles = getAllArticles()
  const typeCounts: Record<string, number> = {}

  // Initialize all defined categories with 0
  Object.keys(categoryMeta).forEach(type => {
    typeCounts[type] = 0
  })

  allArticles.forEach(article => {
    const type = article.frontmatter.type
    if (type && categoryMeta[type]) {
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
  })

  return Object.entries(categoryMeta)
    .map(([type, meta]) => ({
      type,
      count: typeCounts[type] || 0,
      label: meta.label,
      description: meta.description,
    }))
    .sort((a, b) => (categoryMeta[a.type]?.order || 99) - (categoryMeta[b.type]?.order || 99))
}

// Get valid category types
export function isValidCategory(type: string): boolean {
  return Object.keys(categoryMeta).includes(type)
}
