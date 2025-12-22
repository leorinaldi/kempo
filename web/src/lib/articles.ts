import { remark } from 'remark'
import html from 'remark-html'
import { prisma } from './prisma'
import type { Article as PrismaArticle } from '@prisma/client'

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
  media?: Array<{
    type: 'audio' | 'video'
    url: string
    title?: string
    description?: string
    article?: string
  }>
  timelineEvents?: Array<{
    date: string
    headline: string
    description: string
  }>
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

function isDateLink(target: string): boolean {
  return /\d+\s*k\.y\./.test(target)
}

// Process wikilinks in content
function processWikilinks(content: string): string {
  return content.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target, display) => {
      const linkText = display || target

      if (isDateLink(target)) {
        const { page, anchor } = dateToTimelineLink(target)
        return `<a href="/kemponet/kempopedia/wiki/${page}#${anchor}" class="wikilink wikilink-date">${linkText}</a>`
      }

      const [pagePart, anchorPart] = target.split('#')
      const linkSlug = pagePart.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const href = anchorPart
        ? `/kemponet/kempopedia/wiki/${linkSlug}#${anchorPart}`
        : `/kemponet/kempopedia/wiki/${linkSlug}`
      return `<a href="${href}" class="wikilink">${linkText}</a>`
    }
  )
}

// Convert Prisma article to our Article interface
function prismaToArticle(dbArticle: PrismaArticle): Article {
  const processedContent = processWikilinks(dbArticle.content)

  return {
    slug: dbArticle.slug,
    frontmatter: {
      title: dbArticle.title,
      slug: dbArticle.slug,
      type: dbArticle.type,
      subtype: dbArticle.subtype || undefined,
      status: dbArticle.status,
      parallel_switchover: dbArticle.parallelSwitchover as unknown as ParallelSwitchover | undefined,
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

export async function getAllArticleSlugsAsync(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true },
  })
  return articles.map(a => a.slug)
}

// Fast count query - doesn't load all articles
export async function getArticleCountAsync(): Promise<number> {
  return prisma.article.count({
    where: { status: 'published' },
  })
}

export async function getAllArticlesAsync(): Promise<Article[]> {
  const dbArticles = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { title: 'asc' },
  })
  return dbArticles.map(prismaToArticle)
}

export async function getArticleBySlugAsync(slug: string): Promise<Article | null> {
  const dbArticle = await prisma.article.findUnique({
    where: { slug },
  })

  if (!dbArticle) return null

  const article = prismaToArticle(dbArticle)

  // Process markdown to HTML
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(article.content)

  return {
    ...article,
    htmlContent: processedContent.toString(),
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
  institution: { label: 'Institutions', description: 'Organizations, companies, parties, and academies', order: 3 },
  event: { label: 'Events', description: 'Historical events and occurrences', order: 4 },
  timeline: { label: 'Timeline', description: 'Chronological records by decade and year', order: 5 },
  science: { label: 'Science and Technology', description: 'Scientific ideas, technologies', order: 6 },
  culture: { label: 'Culture and Entertainment', description: 'Popular culture, entertainment, and products', order: 7 },
  concept: { label: 'Other Concepts', description: 'Ideas, theories, and abstract topics', order: 99 },
}

// Map article types to display categories
const typeToCategoryMap: Record<string, string> = {
  product: 'culture',
  company: 'institution',
}

export async function getArticlesByTypeAsync(type: string): Promise<Article[]> {
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
    },
    orderBy: { title: 'asc' },
  })

  return dbArticles.map(prismaToArticle)
}

export async function getAllCategoriesAsync(): Promise<CategoryInfo[]> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
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

export async function getWikiLinkStatsAsync(): Promise<WikiLinkStats> {
  // Fast query - just sum up pre-computed link counts
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
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
  slug: string
  title: string
  type: string
  subtype?: string
  status?: string
  content: string
  infobox?: unknown
  timelineEvents?: unknown
  mediaRefs?: unknown
  parallelSwitchover?: unknown
  tags?: string[]
  dates?: string[]
}) {
  return prisma.article.create({
    data: {
      slug: data.slug,
      title: data.title,
      type: data.type,
      subtype: data.subtype,
      status: data.status || 'published',
      content: data.content,
      infobox: data.infobox as Parameters<typeof prisma.article.create>[0]['data']['infobox'],
      timelineEvents: data.timelineEvents as Parameters<typeof prisma.article.create>[0]['data']['timelineEvents'],
      mediaRefs: data.mediaRefs as Parameters<typeof prisma.article.create>[0]['data']['mediaRefs'],
      parallelSwitchover: data.parallelSwitchover as Parameters<typeof prisma.article.create>[0]['data']['parallelSwitchover'],
      tags: data.tags,
      dates: data.dates,
      linkCount: countWikilinks(data.content),
    },
  })
}

// Update article with automatic linkCount recalculation
export async function updateArticle(
  slug: string,
  data: {
    title?: string
    type?: string
    subtype?: string
    status?: string
    content?: string
    infobox?: unknown
    timelineEvents?: unknown
    mediaRefs?: unknown
    parallelSwitchover?: unknown
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
  if (data.parallelSwitchover !== undefined) updateData.parallelSwitchover = data.parallelSwitchover as Parameters<typeof prisma.article.update>[0]['data']['parallelSwitchover']
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.dates !== undefined) updateData.dates = data.dates

  return prisma.article.update({
    where: { slug },
    data: updateData,
  })
}
