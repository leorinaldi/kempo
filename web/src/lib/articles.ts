import { remark } from 'remark'
import html from 'remark-html'
import { prisma } from './prisma'
import type { Article as PrismaArticle } from '@prisma/client'
import { slugify } from './slugify'

export interface ArticleFrontmatter {
  title: string
  id: string
  type: string
  subtype?: string
  status: string
  tags?: string[]
  dates?: string[]
}

// Title → ID lookup map type (legacy, kept for compatibility)
export type ArticleLinkMap = Map<string, string>

// Re-export slugify from shared utility (usable on client and server)
export { slugify } from './slugify'

// Convert slug back to approximate title (for DB lookup)
function unslugify(slug: string): string {
  return slug.replace(/-/g, ' ')
}

// Check if a string looks like a CUID (25 chars, starts with 'c')
function isCuid(str: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(str)
}

export interface InlineImage {
  imageId: string
  url: string
  alt: string
  section: string // Which section to insert after (h2 heading text, or "intro" for before first h2)
  position: 'left' | 'right' | 'center'
  caption?: string
}

export interface Article {
  id: string
  frontmatter: ArticleFrontmatter
  content: string
  htmlContent: string
  infobox?: {
    type: string
    image?: { url: string; caption: string }
    fields: Record<string, unknown>
  }
  inlineImages?: InlineImage[]
  media?: Array<{
    type: 'audio' | 'video'
    url: string
    title?: string
    description?: string
    articleId?: string
  }>
  timelineEvents?: Array<{
    date: string
    headline: string
    description: string
  }>
  linkMap?: ArticleLinkMap // For resolving wikilinks in Infobox
}

// Convert k.y. date to timeline page and anchor
function dateToTimelineLink(dateStr: string): { page: string; anchor: string } {
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
    return { page: 'master-timeline', anchor: dateStr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
  }

  const yearNum = parseInt(year, 10)

  if (yearNum < 1950) {
    const decade = Math.floor(yearNum / 10) * 10
    return { page: `${decade}s k.y.`, anchor }
  } else {
    return { page: `${year} k.y.`, anchor }
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

function isDateLink(target: string): boolean {
  return /\d+\s*k\.y\./.test(target)
}

// Extract all wikilink targets from content (for batch ID lookup)
export function extractWikilinkTargets(content: string): string[] {
  const targets: string[] = []
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const target = match[1]
    if (!isDateLink(target)) {
      const [pagePart] = target.split('#')
      targets.push(pagePart.trim())
    } else {
      // For date links, extract the timeline page title (e.g., "1940s")
      const { page } = dateToTimelineLink(target)
      targets.push(page)
    }
  }
  return Array.from(new Set(targets)) // dedupe
}

// Get article IDs by their titles (case-insensitive)
export async function getArticleIdsByTitles(targets: string[]): Promise<ArticleLinkMap> {
  if (targets.length === 0) return new Map()

  // Query articles matching by title
  const articles = await prisma.article.findMany({
    where: {
      title: { in: targets, mode: 'insensitive' }
    },
    select: { id: true, title: true }
  })

  const map = new Map<string, string>()
  for (const article of articles) {
    // Store with lowercase title key for case-insensitive matching
    map.set(article.title.toLowerCase(), article.id)
  }
  return map
}

// Process wikilinks using pre-fetched ID map (legacy - kept for compatibility)
function processWikilinks(content: string, linkMap: ArticleLinkMap): string {
  return content.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target, display) => {
      const linkText = display || target

      if (isDateLink(target)) {
        const { page, anchor } = dateToTimelineLink(target)
        const articleId = linkMap.get(page.toLowerCase())
        if (articleId) {
          return `<a href="/kemponet/kempopedia/wiki/${articleId}#${anchor}" class="wikilink wikilink-date">${linkText}</a>`
        }
        // Fallback: keep title-based link for missing articles
        return `<a href="#" class="wikilink wikilink-date wikilink-missing">${linkText}</a>`
      }

      const [pagePart, anchorPart] = target.split('#')
      const articleId = linkMap.get(pagePart.toLowerCase().trim())
      if (articleId) {
        const href = anchorPart
          ? `/kemponet/kempopedia/wiki/${articleId}#${anchorPart}`
          : `/kemponet/kempopedia/wiki/${articleId}`
        return `<a href="${href}" class="wikilink">${linkText}</a>`
      }
      // Fallback: mark as missing link
      return `<a href="#" class="wikilink wikilink-missing">${linkText}</a>`
    }
  )
}

// Process wikilinks using slug-based URLs (no DB lookup needed)
export function processWikilinksSimple(content: string): string {
  return content.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target, display) => {
      const linkText = display || target

      if (isDateLink(target)) {
        const { page, anchor } = dateToTimelineLink(target)
        const slug = slugify(page)
        return `<a href="/kemponet/kempopedia/wiki/${slug}#${anchor}" class="wikilink wikilink-date">${linkText}</a>`
      }

      const [pagePart, anchorPart] = target.split('#')
      const slug = slugify(pagePart.trim())
      const href = anchorPart
        ? `/kemponet/kempopedia/wiki/${slug}#${anchorPart}`
        : `/kemponet/kempopedia/wiki/${slug}`
      return `<a href="${href}" class="wikilink">${linkText}</a>`
    }
  )
}

// Convert Prisma article to our Article interface
function prismaToArticle(dbArticle: PrismaArticle, linkMap: ArticleLinkMap): Article {
  const processedContent = processWikilinks(dbArticle.content, linkMap)

  return {
    id: dbArticle.id,
    frontmatter: {
      title: dbArticle.title,
      id: dbArticle.id,
      type: dbArticle.type,
      subtype: dbArticle.subtype || undefined,
      status: dbArticle.status,
      tags: dbArticle.tags,
      dates: dbArticle.dates,
    },
    content: processedContent,
    htmlContent: processedContent, // Will be processed to HTML in async version
    infobox: dbArticle.infobox as Article['infobox'],
    media: dbArticle.mediaRefs as Article['media'],
    timelineEvents: dbArticle.timelineEvents as Article['timelineEvents'],
  }
}

export async function getAllArticleIdsAsync(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { id: true },
  })
  return articles.map(a => a.id)
}

// Get all article slugs for static generation
export async function getAllArticleSlugsAsync(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { title: true },
  })
  return articles.map(a => slugify(a.title))
}

// Get article by slug or ID, with optional date filtering
export async function getArticleBySlugOrId(
  slugOrId: string,
  viewingDate?: { month: number; year: number }
): Promise<Article | null> {
  let dbArticle

  if (isCuid(slugOrId)) {
    // Looks like an ID, fetch by ID
    dbArticle = await prisma.article.findUnique({
      where: { id: slugOrId },
    })
  } else {
    // Treat as slug - first try simple unslugify (dashes to spaces)
    const titleSearch = unslugify(slugOrId)
    dbArticle = await prisma.article.findFirst({
      where: {
        title: { equals: titleSearch, mode: 'insensitive' },
        status: 'published',
      },
    })

    // If not found, search for article where slugified title matches
    // This handles cases like "Portside, New Jersey" → "portside-new-jersey"
    if (!dbArticle) {
      const allArticles = await prisma.article.findMany({
        where: { status: 'published' },
        select: { id: true, title: true },
      })
      const match = allArticles.find(a => slugify(a.title) === slugOrId)
      if (match) {
        dbArticle = await prisma.article.findUnique({
          where: { id: match.id },
        })
      }
    }
  }

  if (!dbArticle) return null

  // Check if we need to use a revision instead of current content
  let contentToUse = dbArticle.content
  let titleToUse = dbArticle.title
  let infoboxToUse = dbArticle.infobox
  let timelineEventsToUse = dbArticle.timelineEvents

  if (viewingDate && dbArticle.publishDate) {
    const viewDate = kyDateToDate(viewingDate)
    if (viewDate < dbArticle.publishDate) {
      // Viewing date is before current publishDate - check for revision
      const revisions = await prisma.revision.findMany({
        where: { articleId: dbArticle.id },
        orderBy: { createdAt: 'desc' },
      })

      // Find the most recent revision that was current at the viewing date
      let matchingRevision = null
      for (const rev of revisions) {
        if (rev.kempoDate) {
          const revDate = parseKempoDateString(rev.kempoDate)
          if (revDate && revDate <= viewDate) {
            matchingRevision = rev
            break // Found most recent revision valid at this date
          }
        }
      }

      if (matchingRevision) {
        // Use revision content instead of current
        contentToUse = matchingRevision.content
        titleToUse = matchingRevision.title
        infoboxToUse = matchingRevision.infobox
        timelineEventsToUse = matchingRevision.timelineEvents
      } else {
        // No revision exists for this viewing date - article doesn't exist yet
        return null
      }
    }
  }

  // Process content with simplified wikilinks (no linkMap needed)
  const processedContent = processWikilinksSimple(contentToUse)

  // Process markdown to HTML
  const htmlResult = await remark()
    .use(html, { sanitize: false })
    .process(processedContent)

  // Fetch inline images
  const inlineImagesConfig = (dbArticle as unknown as { inlineImages?: unknown }).inlineImages as Array<{
    imageId: string
    section: string
    position: string
    caption?: string
  }> | null
  const inlineImages = await fetchInlineImages(inlineImagesConfig)

  return {
    id: dbArticle.id,
    frontmatter: {
      title: titleToUse,
      id: dbArticle.id,
      type: dbArticle.type,
      subtype: dbArticle.subtype || undefined,
      status: dbArticle.status,
      tags: dbArticle.tags,
      dates: dbArticle.dates,
    },
    content: processedContent,
    htmlContent: htmlResult.toString(),
    infobox: infoboxToUse as Article['infobox'],
    inlineImages: inlineImages.length > 0 ? inlineImages : undefined,
    media: dbArticle.mediaRefs as Article['media'],
    timelineEvents: timelineEventsToUse as Article['timelineEvents'],
  }
}

// Fast count query - doesn't load all articles
export async function getArticleCountAsync(
  viewingDate?: { month: number; year: number }
): Promise<number> {
  return prisma.article.count({
    where: {
      status: 'published',
      ...(viewingDate && { publishDate: { lte: kyDateToDate(viewingDate) } }),
    },
  })
}

export async function getAllArticlesAsync(): Promise<Article[]> {
  const dbArticles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { title: 'asc' },
  })

  // Extract all wikilink targets from all articles
  const allTargets: string[] = []
  for (const article of dbArticles) {
    allTargets.push(...extractWikilinkTargets(article.content))
  }

  // Build link map
  const linkMap = await getArticleIdsByTitles(Array.from(new Set(allTargets)))

  return dbArticles.map(a => prismaToArticle(a, linkMap))
}

// Convert {month, year} to end-of-month Date for comparison
export function kyDateToDate(kyDate: { month: number; year: number }): Date {
  // Use last day of month for inclusive comparison
  return new Date(kyDate.year, kyDate.month - 1, 28, 23, 59, 59)
}

// Parse kempoDate string like "January 1, 1950 k.y." to Date
// Fetch inline images for an article from the database
async function fetchInlineImages(
  inlineImagesConfig: Array<{ imageId: string; section: string; position: string; caption?: string }> | null | undefined
): Promise<InlineImage[]> {
  if (!inlineImagesConfig || inlineImagesConfig.length === 0) {
    return []
  }

  const imageIds = inlineImagesConfig.map(img => img.imageId)
  const images = await prisma.image.findMany({
    where: { id: { in: imageIds } },
    select: { id: true, url: true, description: true, altText: true, name: true },
  })

  const imageMap = new Map(images.map(img => [img.id, img]))

  return inlineImagesConfig
    .map(config => {
      const image = imageMap.get(config.imageId)
      if (!image) return null
      return {
        imageId: config.imageId,
        url: image.url,
        alt: image.altText || image.name || 'Image',
        section: config.section,
        position: config.position as 'left' | 'right' | 'center',
        caption: config.caption || image.description || undefined,
      }
    })
    .filter((img): img is InlineImage => img !== null)
}

function parseKempoDateString(kempoDate: string): Date | null {
  // Match patterns like "January 1, 1950 k.y." or "January 1950 k.y."
  const fullMatch = kempoDate.match(/(\w+)\s+(\d+),?\s+(\d+)\s*k\.y\./i)
  const monthYearMatch = kempoDate.match(/(\w+)\s+(\d+)\s*k\.y\./i)

  const monthNames: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  }

  if (fullMatch) {
    const [, month, day, year] = fullMatch
    const monthNum = monthNames[month.toLowerCase()]
    if (monthNum !== undefined) {
      return new Date(parseInt(year), monthNum, parseInt(day))
    }
  } else if (monthYearMatch) {
    const [, month, year] = monthYearMatch
    const monthNum = monthNames[month.toLowerCase()]
    if (monthNum !== undefined) {
      return new Date(parseInt(year), monthNum, 1)
    }
  }

  return null
}

// Get article by ID, filtered by viewing date
// Returns revision content if viewing date is before current publishDate but a revision exists
export async function getArticleByIdAsOf(
  id: string,
  viewingDate?: { month: number; year: number }
): Promise<Article | null> {
  const dbArticle = await prisma.article.findUnique({
    where: { id },
  })

  if (!dbArticle) return null

  // Check if we need to use a revision instead of current content
  let contentToUse = dbArticle.content
  let titleToUse = dbArticle.title
  let infoboxToUse = dbArticle.infobox
  let timelineEventsToUse = dbArticle.timelineEvents

  if (viewingDate && dbArticle.publishDate) {
    const viewDate = kyDateToDate(viewingDate)
    if (viewDate < dbArticle.publishDate) {
      // Viewing date is before current publishDate - check for revision
      const revisions = await prisma.revision.findMany({
        where: { articleId: dbArticle.id },
        orderBy: { createdAt: 'desc' },
      })

      // Find the most recent revision that was current at the viewing date
      let matchingRevision = null
      for (const rev of revisions) {
        if (rev.kempoDate) {
          const revDate = parseKempoDateString(rev.kempoDate)
          if (revDate && revDate <= viewDate) {
            matchingRevision = rev
            break // Found most recent revision valid at this date
          }
        }
      }

      if (matchingRevision) {
        // Use revision content instead of current
        contentToUse = matchingRevision.content
        titleToUse = matchingRevision.title
        infoboxToUse = matchingRevision.infobox
        timelineEventsToUse = matchingRevision.timelineEvents
      } else {
        // No revision exists for this viewing date - article doesn't exist yet
        return null
      }
    }
  }

  // Extract wikilink targets and build link map
  const targets = extractWikilinkTargets(contentToUse)
  // Also extract from infobox fields if present
  const infobox = infoboxToUse as Article['infobox']
  if (infobox?.fields) {
    for (const value of Object.values(infobox.fields)) {
      if (typeof value === 'string') {
        targets.push(...extractWikilinkTargets(value))
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') {
            targets.push(...extractWikilinkTargets(item))
          }
        }
      }
    }
  }

  const linkMap = await getArticleIdsByTitles(Array.from(new Set(targets)))

  // Build article object with appropriate content
  const article: Article = {
    id: dbArticle.id,
    frontmatter: {
      title: titleToUse,
      id: dbArticle.id,
      type: dbArticle.type,
      subtype: dbArticle.subtype || undefined,
      status: dbArticle.status,
      tags: dbArticle.tags,
      dates: dbArticle.dates,
    },
    content: processWikilinks(contentToUse, linkMap),
    htmlContent: '', // Will be set below
    infobox: infoboxToUse as Article['infobox'],
    media: dbArticle.mediaRefs as Article['media'],
    timelineEvents: timelineEventsToUse as Article['timelineEvents'],
  }

  // Process markdown to HTML
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(article.content)

  return {
    ...article,
    htmlContent: processedContent.toString(),
    linkMap, // For Infobox to use
  }
}

// Original function - no date filtering (backward compatibility)
export async function getArticleByIdAsync(id: string): Promise<Article | null> {
  const dbArticle = await prisma.article.findUnique({
    where: { id },
  })

  if (!dbArticle) return null

  // Extract wikilink targets and build link map
  const targets = extractWikilinkTargets(dbArticle.content)
  // Also extract from infobox fields if present
  const infobox = dbArticle.infobox as Article['infobox']
  if (infobox?.fields) {
    for (const value of Object.values(infobox.fields)) {
      if (typeof value === 'string') {
        targets.push(...extractWikilinkTargets(value))
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') {
            targets.push(...extractWikilinkTargets(item))
          }
        }
      }
    }
  }

  const linkMap = await getArticleIdsByTitles(Array.from(new Set(targets)))
  const article = prismaToArticle(dbArticle, linkMap)

  // Process markdown to HTML
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(article.content)

  return {
    ...article,
    htmlContent: processedContent.toString(),
    linkMap, // For Infobox to use
  }
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
  organization: { label: 'Organizations', description: 'Institutions, companies, parties, and academies', order: 3 },
  event: { label: 'Events', description: 'Historical events and occurrences', order: 4 },
  timeline: { label: 'Timeline', description: 'Chronological records by decade and year', order: 5 },
  science: { label: 'Science and Technology', description: 'Scientific ideas, technologies', order: 6 },
  culture: { label: 'Culture and Entertainment', description: 'Popular culture, entertainment, and products', order: 7 },
  concept: { label: 'Other Concepts', description: 'Ideas, theories, and abstract topics', order: 99 },
}

// Map article types to display categories
const typeToCategoryMap: Record<string, string> = {
  product: 'culture',
  company: 'organization',
}

// Get articles by type, filtered by viewing date
export async function getArticlesByTypeAsOf(
  type: string,
  viewingDate?: { month: number; year: number }
): Promise<Article[]> {
  // Get types that map to this category
  const typesToQuery = [type]
  Object.entries(typeToCategoryMap).forEach(([articleType, category]) => {
    if (category === type) {
      typesToQuery.push(articleType)
    }
  })

  const dbArticles = await prisma.article.findMany({
    where: {
      status: 'published',
      type: { in: typesToQuery },
      ...(viewingDate && { publishDate: { lte: kyDateToDate(viewingDate) } }),
    },
    orderBy: { title: 'asc' },
  })

  // For category listing, we don't need to resolve wikilinks (they're not rendered)
  const emptyMap = new Map<string, string>()
  return dbArticles.map(a => prismaToArticle(a, emptyMap))
}

// Original function - no date filtering (backward compatibility)
export async function getArticlesByTypeAsync(type: string): Promise<Article[]> {
  return getArticlesByTypeAsOf(type)
}

// Get all categories with counts, filtered by viewing date
export async function getAllCategoriesAsOf(
  viewingDate?: { month: number; year: number }
): Promise<CategoryInfo[]> {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      ...(viewingDate && { publishDate: { lte: kyDateToDate(viewingDate) } }),
    },
    select: { type: true },
  })

  const typeCounts: Record<string, number> = {}

  // Initialize all defined categories with 0
  Object.keys(categoryMeta).forEach(type => {
    typeCounts[type] = 0
  })

  articles.forEach(article => {
    const type = article.type
    const category = typeToCategoryMap[type] || type
    if (category && categoryMeta[category]) {
      typeCounts[category] = (typeCounts[category] || 0) + 1
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

// Original function - no date filtering (backward compatibility)
export async function getAllCategoriesAsync(): Promise<CategoryInfo[]> {
  return getAllCategoriesAsOf()
}

export function isValidCategory(type: string): boolean {
  return Object.keys(categoryMeta).includes(type)
}

// Count wikilinks in content (excludes k.y. date links)
export function countWikilinks(content: string): number {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  let count = 0
  let match

  while ((match = wikiLinkRegex.exec(content)) !== null) {
    // Don't count k.y. date links
    if (!match[1].includes('k.y.')) {
      count++
    }
  }

  return count
}

// Get wikilink statistics - uses pre-computed linkCount field for speed
export interface WikiLinkStats {
  totalLinks: number
  linksByCategory: Record<string, number>
}

export async function getWikiLinkStatsAsync(
  viewingDate?: { month: number; year: number }
): Promise<WikiLinkStats> {
  // Fast query - just sum up pre-computed link counts
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      ...(viewingDate && { publishDate: { lte: kyDateToDate(viewingDate) } }),
    },
    select: { type: true, linkCount: true },
  })

  let totalLinks = 0
  const linksByCategory: Record<string, number> = {}

  articles.forEach(article => {
    totalLinks += article.linkCount
    const category = typeToCategoryMap[article.type] || article.type
    if (category) {
      linksByCategory[category] = (linksByCategory[category] || 0) + article.linkCount
    }
  })

  return {
    totalLinks,
    linksByCategory
  }
}

// Recalculate link counts for all articles (run after migration or manually)
export async function recalculateAllLinkCounts(): Promise<number> {
  const articles = await prisma.article.findMany({
    select: { id: true, content: true },
  })

  let updated = 0
  for (const article of articles) {
    const linkCount = countWikilinks(article.content)
    await prisma.article.update({
      where: { id: article.id },
      data: { linkCount },
    })
    updated++
  }

  return updated
}

// Create article with automatic linkCount calculation
export async function createArticle(data: {
  title: string
  type: string
  subtype?: string
  status?: string
  content: string
  infobox?: unknown
  timelineEvents?: unknown
  mediaRefs?: unknown
  tags?: string[]
  dates?: string[]
}) {
  return prisma.article.create({
    data: {
      title: data.title,
      type: data.type,
      subtype: data.subtype,
      status: data.status || 'published',
      content: data.content,
      infobox: data.infobox as Parameters<typeof prisma.article.create>[0]['data']['infobox'],
      timelineEvents: data.timelineEvents as Parameters<typeof prisma.article.create>[0]['data']['timelineEvents'],
      mediaRefs: data.mediaRefs as Parameters<typeof prisma.article.create>[0]['data']['mediaRefs'],
      tags: data.tags,
      dates: data.dates,
      linkCount: countWikilinks(data.content),
    },
  })
}

// Update article with automatic linkCount recalculation (by ID)
export async function updateArticleById(
  id: string,
  data: {
    title?: string
    type?: string
    subtype?: string
    status?: string
    content?: string
    infobox?: unknown
    timelineEvents?: unknown
    mediaRefs?: unknown
    tags?: string[]
    dates?: string[]
  }
) {
  // Build update data with proper types
  const updateData: Parameters<typeof prisma.article.update>[0]['data'] = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.type !== undefined) updateData.type = data.type
  if (data.subtype !== undefined) updateData.subtype = data.subtype
  if (data.status !== undefined) updateData.status = data.status
  if (data.content !== undefined) {
    updateData.content = data.content
    updateData.linkCount = countWikilinks(data.content)
  }
  if (data.infobox !== undefined) updateData.infobox = data.infobox as Parameters<typeof prisma.article.update>[0]['data']['infobox']
  if (data.timelineEvents !== undefined) updateData.timelineEvents = data.timelineEvents as Parameters<typeof prisma.article.update>[0]['data']['timelineEvents']
  if (data.mediaRefs !== undefined) updateData.mediaRefs = data.mediaRefs as Parameters<typeof prisma.article.update>[0]['data']['mediaRefs']
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.dates !== undefined) updateData.dates = data.dates

  return prisma.article.update({
    where: { id },
    data: updateData,
  })
}
