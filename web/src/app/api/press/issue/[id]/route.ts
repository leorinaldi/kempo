import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLICATION_TYPE_DEFAULTS, type ResolvedDesign } from '@/lib/publications'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        series: {
          include: {
            design: true,
            publisher: {
              select: { name: true },
            },
          },
        },
        coverImage: {
          select: { url: true },
        },
        contents: {
          orderBy: { sortOrder: 'asc' },
          include: {
            heroImage: {
              select: { url: true },
            },
            elements: {
              include: {
                person: {
                  select: {
                    firstName: true,
                    lastName: true,
                    stageName: true,
                  },
                },
              },
            },
          },
        },
        elements: {
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
                stageName: true,
              },
            },
          },
        },
      },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    if (!publication.series) {
      return NextResponse.json({ error: 'Publication has no series' }, { status: 400 })
    }

    // Resolve design (type defaults + series overrides)
    const typeKey = publication.series.type as 'magazine' | 'newspaper'
    if (!PUBLICATION_TYPE_DEFAULTS[typeKey]) {
      return NextResponse.json({ error: 'Unsupported publication type' }, { status: 400 })
    }

    const typeDefaults = PUBLICATION_TYPE_DEFAULTS[typeKey]
    const seriesDesign = publication.series.design

    const design: ResolvedDesign = {
      pageAspectRatio: seriesDesign?.pageAspectRatio ?? typeDefaults.pageAspectRatio,
      spreadGap: seriesDesign?.spreadGap ?? typeDefaults.spreadGap,
      headlineFont: seriesDesign?.headlineFont ?? typeDefaults.headlineFont,
      bodyFont: seriesDesign?.bodyFont ?? typeDefaults.bodyFont,
      bylineFont: seriesDesign?.bylineFont ?? typeDefaults.bylineFont,
      baseFontSize: seriesDesign?.baseFontSize ?? typeDefaults.baseFontSize,
      headlineWeight: seriesDesign?.headlineWeight ?? typeDefaults.headlineWeight,
      headlineStyle: seriesDesign?.headlineStyle ?? typeDefaults.headlineStyle,
      defaultColumns: seriesDesign?.defaultColumns ?? typeDefaults.defaultColumns,
      columnGap: seriesDesign?.columnGap ?? typeDefaults.columnGap,
      marginSize: seriesDesign?.marginSize ?? typeDefaults.marginSize,
      accentColor: seriesDesign?.accentColor ?? typeDefaults.accentColor,
      backgroundColor: seriesDesign?.backgroundColor ?? typeDefaults.backgroundColor,
      textColor: seriesDesign?.textColor ?? typeDefaults.textColor,
      useDropcaps: seriesDesign?.useDropcaps ?? typeDefaults.useDropcaps,
      useRules: seriesDesign?.useRules ?? typeDefaults.useRules,
      pullquoteStyle: seriesDesign?.pullquoteStyle ?? typeDefaults.pullquoteStyle,
      headerDividers: seriesDesign?.headerDividers ?? typeDefaults.headerDividers,
    }

    // Format contents for frontend
    const contents = publication.contents.map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      type: c.type,
      content: c.content,
      sortOrder: c.sortOrder,
      heroImageUrl: c.heroImage?.url ?? null,
      heroPosition: c.heroPosition,
      layoutStyle: c.layoutStyle,
      pullquotes: c.pullquotes as string[] | null,
      useDropcap: c.useDropcap,
      columns: c.columns,
      accentColor: c.accentColor,
      bylines: c.elements.map(el => ({
        name: el.person.stageName || `${el.person.firstName} ${el.person.lastName}`,
        role: el.role,
        credit: el.credit,
      })),
    }))

    // Format issue-level contributors
    const contributors = publication.elements.map(el => ({
      name: el.person.stageName || `${el.person.firstName} ${el.person.lastName}`,
      role: el.role,
      credit: el.credit,
    }))

    // Auto-generate table of contents from articles
    const tableOfContents = contents
      .filter(c => !['cover', 'table_of_contents', 'back_cover', 'advertisement'].includes(c.type))
      .map(c => ({
        title: c.title,
        type: c.type,
        sortOrder: c.sortOrder,
        authors: c.bylines.filter(b => b.role === 'author').map(b => b.name),
      }))

    const result = {
      id: publication.id,
      title: publication.title,
      type: publication.type,
      kyDate: publication.kyDate,
      coverUrl: publication.coverImage?.url ?? null,
      volume: publication.volume,
      issueNumber: publication.issueNumber,
      edition: publication.edition,
      description: publication.description,
      series: {
        id: publication.series.id,
        name: publication.series.name,
        type: publication.series.type,
        publisherName: publication.series.publisher?.name ?? null,
      },
      design,
      contents,
      contributors,
      tableOfContents,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch publication:', error)
    return NextResponse.json({ error: 'Failed to fetch publication' }, { status: 500 })
  }
}
