import { prisma } from './prisma'
import { slugify } from './slugify'
import type { PublicationType, NewsPubContentType } from '@prisma/client'

// ============ TYPE DEFAULTS ============
// Default styling per publication type. Series design overrides these, article overrides series.

export interface PublicationDesignDefaults {
  pageAspectRatio: string
  spreadGap: number
  headlineFont: string
  bodyFont: string
  bylineFont: string
  baseFontSize: number
  headlineWeight: string
  headlineStyle: string
  defaultColumns: number
  columnGap: number
  marginSize: string
  accentColor: string
  backgroundColor: string
  textColor: string
  useDropcaps: boolean
  useRules: boolean
  pullquoteStyle: string
  headerDividers: boolean
}

export const PUBLICATION_TYPE_DEFAULTS: Record<'magazine' | 'newspaper', PublicationDesignDefaults> = {
  magazine: {
    pageAspectRatio: '8.5:11',
    spreadGap: 0.25,
    headlineFont: 'Playfair Display',
    bodyFont: 'Source Serif Pro',
    bylineFont: 'Source Sans Pro',
    baseFontSize: 1.0,
    headlineWeight: 'bold',
    headlineStyle: 'titlecase',
    defaultColumns: 2,
    columnGap: 1.5,
    marginSize: 'normal',
    accentColor: '#c41e3a', // Crimson red
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    useDropcaps: true,
    useRules: false,
    pullquoteStyle: 'italic',
    headerDividers: false,
  },
  newspaper: {
    pageAspectRatio: '11:17',
    spreadGap: 0.125,
    headlineFont: 'Oswald',
    bodyFont: 'Georgia',
    bylineFont: 'Georgia',
    baseFontSize: 0.875,
    headlineWeight: 'bold',
    headlineStyle: 'uppercase',
    defaultColumns: 4,
    columnGap: 1.0,
    marginSize: 'narrow',
    accentColor: '#000000',
    backgroundColor: '#f5f5dc', // Beige/newsprint
    textColor: '#1a1a1a',
    useDropcaps: false,
    useRules: true,
    pullquoteStyle: 'bordered',
    headerDividers: true,
  },
}

// ============ RESOLVED DESIGN ============
// Merge type defaults → series design → article overrides

export interface ResolvedDesign extends PublicationDesignDefaults {
  // Additional computed values can go here
}

export async function getResolvedDesign(
  seriesId: string,
  articleOverrides?: {
    useDropcap?: boolean | null
    columns?: number | null
    accentColor?: string | null
  }
): Promise<ResolvedDesign> {
  const series = await prisma.publicationSeries.findUnique({
    where: { id: seriesId },
    include: { design: true },
  })

  if (!series) {
    throw new Error(`PublicationSeries not found: ${seriesId}`)
  }

  // Get type defaults (only magazine and newspaper supported for now)
  const type = series.type as 'magazine' | 'newspaper'
  if (!PUBLICATION_TYPE_DEFAULTS[type]) {
    throw new Error(`Publication type ${type} not supported for reading view`)
  }
  const typeDefaults = PUBLICATION_TYPE_DEFAULTS[type]

  // Merge series design over type defaults
  const design = series.design
  const merged: ResolvedDesign = {
    pageAspectRatio: design?.pageAspectRatio ?? typeDefaults.pageAspectRatio,
    spreadGap: design?.spreadGap ?? typeDefaults.spreadGap,
    headlineFont: design?.headlineFont ?? typeDefaults.headlineFont,
    bodyFont: design?.bodyFont ?? typeDefaults.bodyFont,
    bylineFont: design?.bylineFont ?? typeDefaults.bylineFont,
    baseFontSize: design?.baseFontSize ?? typeDefaults.baseFontSize,
    headlineWeight: design?.headlineWeight ?? typeDefaults.headlineWeight,
    headlineStyle: design?.headlineStyle ?? typeDefaults.headlineStyle,
    defaultColumns: design?.defaultColumns ?? typeDefaults.defaultColumns,
    columnGap: design?.columnGap ?? typeDefaults.columnGap,
    marginSize: design?.marginSize ?? typeDefaults.marginSize,
    accentColor: design?.accentColor ?? typeDefaults.accentColor,
    backgroundColor: design?.backgroundColor ?? typeDefaults.backgroundColor,
    textColor: design?.textColor ?? typeDefaults.textColor,
    useDropcaps: design?.useDropcaps ?? typeDefaults.useDropcaps,
    useRules: design?.useRules ?? typeDefaults.useRules,
    pullquoteStyle: design?.pullquoteStyle ?? typeDefaults.pullquoteStyle,
    headerDividers: design?.headerDividers ?? typeDefaults.headerDividers,
  }

  // Apply article-level overrides
  if (articleOverrides) {
    if (articleOverrides.useDropcap !== null && articleOverrides.useDropcap !== undefined) {
      merged.useDropcaps = articleOverrides.useDropcap
    }
    if (articleOverrides.columns !== null && articleOverrides.columns !== undefined) {
      merged.defaultColumns = articleOverrides.columns
    }
    if (articleOverrides.accentColor !== null && articleOverrides.accentColor !== undefined) {
      merged.accentColor = articleOverrides.accentColor
    }
  }

  return merged
}

// ============ SERIES LOOKUP BY SLUG ============

export async function getSeriesBySlug(slug: string) {
  // Try to find by slugified name
  const allSeries = await prisma.publicationSeries.findMany({
    where: {
      type: { in: ['magazine', 'newspaper'] },
    },
    include: {
      publisher: true,
      design: true,
      publications: {
        orderBy: { kyDate: 'desc' },
        take: 1,
        include: { coverImage: true },
      },
    },
  })

  return allSeries.find(s => slugify(s.name) === slug) ?? null
}

// ============ PUBLICATION HELPERS ============

export async function getPublicationWithContents(publicationId: string) {
  return prisma.publication.findUnique({
    where: { id: publicationId },
    include: {
      series: {
        include: {
          design: true,
          publisher: true,
        },
      },
      coverImage: true,
      contents: {
        orderBy: { sortOrder: 'asc' },
        include: {
          heroImage: true,
          elements: {
            include: { person: true },
          },
        },
      },
      elements: {
        include: { person: true },
      },
    },
  })
}

// ============ SPREAD GROUPING ============
// Groups articles into spreads (two pages side-by-side)

export interface Spread {
  left: SpreadPage | null
  right: SpreadPage | null
}

export interface SpreadPage {
  contentId: string
  type: NewsPubContentType
  title: string
  subtitle?: string | null
  content: string
  heroImageUrl?: string | null
  heroPosition?: string | null
  layoutStyle?: string | null
  pullquotes?: string[]
  bylines: Array<{
    name: string
    role: string
    credit?: string | null
  }>
}

type ContentWithRelations = NonNullable<Awaited<ReturnType<typeof getPublicationWithContents>>>['contents'][number]

export function groupContentsIntoSpreads(contents: ContentWithRelations[]): Spread[] {
  const spreads: Spread[] = []
  let i = 0

  while (i < contents.length) {
    const content = contents[i]

    // Cover is always a single page on the right (left empty)
    if (content.type === 'cover') {
      spreads.push({
        left: null,
        right: contentToSpreadPage(content),
      })
      i++
      continue
    }

    // Back cover is always a single page on the left (right empty)
    if (content.type === 'back_cover') {
      spreads.push({
        left: contentToSpreadPage(content),
        right: null,
      })
      i++
      continue
    }

    // Feature articles can span full spread or take one page
    // For now, treat all features as full spread (both pages)
    if (content.type === 'feature' && content.layoutStyle === 'full_bleed') {
      spreads.push({
        left: contentToSpreadPage(content),
        right: contentToSpreadPage(content), // Same content spans both
      })
      i++
      continue
    }

    // Regular content: pair two articles per spread
    const leftContent = content
    const rightContent = contents[i + 1]

    // If next content is a special type that needs its own spread, don't pair
    if (rightContent && (rightContent.type === 'back_cover' || (rightContent.type === 'feature' && rightContent.layoutStyle === 'full_bleed'))) {
      spreads.push({
        left: contentToSpreadPage(leftContent),
        right: null,
      })
      i++
      continue
    }

    spreads.push({
      left: contentToSpreadPage(leftContent),
      right: rightContent ? contentToSpreadPage(rightContent) : null,
    })
    i += rightContent ? 2 : 1
  }

  return spreads
}

function contentToSpreadPage(content: ContentWithRelations): SpreadPage {
  return {
    contentId: content.id,
    type: content.type,
    title: content.title,
    subtitle: content.subtitle,
    content: content.content,
    heroImageUrl: content.heroImage?.url,
    heroPosition: content.heroPosition,
    layoutStyle: content.layoutStyle,
    pullquotes: content.pullquotes as string[] | undefined,
    bylines: content.elements.map(el => ({
      name: el.person.stageName || `${el.person.firstName} ${el.person.lastName}`,
      role: el.role,
      credit: el.credit,
    })),
  }
}

// ============ AUTO-GENERATE TABLE OF CONTENTS ============

export function generateTableOfContents(
  contents: ContentWithRelations[]
): Array<{ title: string; type: string; sortOrder: number; authors: string[] }> {
  return contents
    .filter(c => !['cover', 'table_of_contents', 'back_cover', 'advertisement'].includes(c.type))
    .map(c => ({
      title: c.title,
      type: c.type,
      sortOrder: c.sortOrder,
      authors: c.elements
        .filter(el => el.role === 'author')
        .map(el => el.person.stageName || `${el.person.firstName} ${el.person.lastName}`),
    }))
}

// ============ BROWSABLE SERIES LIST ============

export async function getAllReadableSeries() {
  return prisma.publicationSeries.findMany({
    where: {
      type: { in: ['magazine', 'newspaper'] },
    },
    include: {
      publisher: true,
      _count: {
        select: { publications: true },
      },
      publications: {
        orderBy: { kyDate: 'desc' },
        take: 1,
        include: { coverImage: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getSeriesWithIssues(seriesId: string) {
  return prisma.publicationSeries.findUnique({
    where: { id: seriesId },
    include: {
      publisher: true,
      design: true,
      publications: {
        orderBy: { kyDate: 'desc' },
        include: {
          coverImage: true,
          _count: {
            select: { contents: true },
          },
        },
      },
    },
  })
}
