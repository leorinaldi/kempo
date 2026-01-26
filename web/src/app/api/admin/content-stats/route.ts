import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Time boundaries for deltas
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Articles by type
    const articlesByType = await prisma.article.groupBy({
      by: ["type"],
      _count: true,
    })
    const articlesTotal = articlesByType.reduce((sum, a) => sum + a._count, 0)

    // Article word counts
    const allArticlesWithContent = await prisma.article.findMany({
      select: { content: true, createdAt: true },
    })
    const countWords = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length
    const totalWords = allArticlesWithContent.reduce((sum, a) => sum + countWords(a.content), 0)
    const words24h = allArticlesWithContent
      .filter(a => a.createdAt >= oneDayAgo)
      .reduce((sum, a) => sum + countWords(a.content), 0)
    const words7d = allArticlesWithContent
      .filter(a => a.createdAt >= oneWeekAgo)
      .reduce((sum, a) => sum + countWords(a.content), 0)

    // Time-series data: articles and media by year (both K.Y. and real-world)
    const [articlesKy, articlesReal, audioItems, videoItems, images] = await Promise.all([
      prisma.article.findMany({
        select: { publishDate: true },
        where: { publishDate: { not: null } },
      }),
      prisma.article.findMany({
        select: { createdAt: true },
      }),
      prisma.audio.findMany({
        select: { kyDate: true, createdAt: true },
      }),
      prisma.video.findMany({
        select: { kyDate: true, createdAt: true },
      }),
      prisma.image.findMany({
        select: { kyDate: true, createdAt: true },
      }),
    ])

    // K.Y. Timeline - group by publishDate/kyDate year
    const articlesByKyYear: Record<number, number> = {}
    articlesKy.forEach((a) => {
      if (a.publishDate) {
        const year = a.publishDate.getFullYear()
        articlesByKyYear[year] = (articlesByKyYear[year] || 0) + 1
      }
    })

    const mediaByKyYear: Record<number, number> = {}
    ;[...audioItems, ...videoItems, ...images].forEach((m) => {
      if (m.kyDate) {
        const year = m.kyDate.getFullYear()
        mediaByKyYear[year] = (mediaByKyYear[year] || 0) + 1
      }
    })

    const allKyYears = new Set([
      ...Object.keys(articlesByKyYear).map(Number),
      ...Object.keys(mediaByKyYear).map(Number),
    ])
    const kyTimeline = Array.from(allKyYears)
      .sort((a, b) => a - b)
      .map((year) => ({
        year,
        articles: articlesByKyYear[year] || 0,
        media: mediaByKyYear[year] || 0,
      }))

    // Real-world Timeline - group by createdAt (daily)
    const articlesByRealDay: Record<string, number> = {}
    articlesReal.forEach((a) => {
      const date = a.createdAt
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      articlesByRealDay[key] = (articlesByRealDay[key] || 0) + 1
    })

    const mediaByRealDay: Record<string, number> = {}
    ;[...audioItems, ...videoItems, ...images].forEach((m) => {
      const date = m.createdAt
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      mediaByRealDay[key] = (mediaByRealDay[key] || 0) + 1
    })

    const allRealDays = new Set([
      ...Object.keys(articlesByRealDay),
      ...Object.keys(mediaByRealDay),
    ])
    const realTimeline = Array.from(allRealDays)
      .sort()
      .map((day) => ({
        day,
        articles: articlesByRealDay[day] || 0,
        media: mediaByRealDay[day] || 0,
      }))

    // Entity counts
    const [
      personCount,
      organizationCount,
      brandCount,
      productCount,
      nationCount,
      stateCount,
      cityCount,
      placeCount,
      eventCount,
    ] = await Promise.all([
      prisma.person.count(),
      prisma.organization.count(),
      prisma.brand.count(),
      prisma.product.count(),
      prisma.nation.count(),
      prisma.state.count(),
      prisma.city.count(),
      prisma.place.count(),
      prisma.event.count(),
    ])

    // Media counts
    const [audioByType, videoByType, imageByCategory] = await Promise.all([
      prisma.audio.groupBy({
        by: ["type"],
        _count: true,
      }),
      prisma.video.groupBy({
        by: ["type"],
        _count: true,
      }),
      prisma.image.groupBy({
        by: ["category"],
        _count: true,
      }),
    ])

    const audioTotal = audioByType.reduce((sum, a) => sum + a._count, 0)
    const videoTotal = videoByType.reduce((sum, v) => sum + v._count, 0)
    const imageTotal = imageByCategory.reduce((sum, i) => sum + i._count, 0)

    // Publications
    const [publicationSeriesCount, publicationCount] = await Promise.all([
      prisma.publicationSeries.count(),
      prisma.publication.count(),
    ])

    // Delta counts (last 24h and last 7 days)
    const [
      articles24h,
      articles7d,
      people24h,
      people7d,
      orgs24h,
      orgs7d,
      brands24h,
      brands7d,
      products24h,
      products7d,
      nations24h,
      nations7d,
      states24h,
      states7d,
      cities24h,
      cities7d,
      places24h,
      places7d,
      audio24h,
      audio7d,
      video24h,
      video7d,
      images24h,
      images7d,
      pubSeries24h,
      pubSeries7d,
      pubs24h,
      pubs7d,
      events24h,
      events7d,
    ] = await Promise.all([
      prisma.article.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.article.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.person.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.person.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.organization.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.organization.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.brand.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.brand.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.product.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.product.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.nation.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.nation.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.state.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.state.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.city.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.city.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.place.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.place.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.audio.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.audio.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.video.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.video.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.image.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.image.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.publicationSeries.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.publicationSeries.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.publication.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.publication.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    ])

    return NextResponse.json({
      kyTimeline,
      realTimeline,
      articles: {
        total: articlesTotal,
        delta24h: articles24h,
        delta7d: articles7d,
        byType: Object.fromEntries(
          articlesByType.map((a) => [a.type, a._count])
        ),
      },
      words: {
        total: totalWords,
        delta24h: words24h,
        delta7d: words7d,
      },
      entities: {
        people: personCount,
        people24h,
        people7d,
        organizations: organizationCount,
        orgs24h,
        orgs7d,
        brands: brandCount,
        brands24h,
        brands7d,
        products: productCount,
        products24h,
        products7d,
      },
      locations: {
        total: nationCount + stateCount + cityCount + placeCount,
        delta24h: nations24h + states24h + cities24h + places24h,
        delta7d: nations7d + states7d + cities7d + places7d,
        nations: nationCount,
        states: stateCount,
        cities: cityCount,
        places: placeCount,
      },
      media: {
        total: audioTotal + videoTotal + imageTotal,
        delta24h: audio24h + video24h + images24h,
        delta7d: audio7d + video7d + images7d,
        audio: {
          total: audioTotal,
          byType: Object.fromEntries(
            audioByType.map((a) => [a.type, a._count])
          ),
        },
        video: {
          total: videoTotal,
          byType: Object.fromEntries(
            videoByType.map((v) => [v.type, v._count])
          ),
        },
        images: {
          total: imageTotal,
          byCategory: Object.fromEntries(
            imageByCategory.map((i) => [i.category || "uncategorized", i._count])
          ),
        },
      },
      publications: {
        total: publicationSeriesCount + publicationCount,
        delta24h: pubSeries24h + pubs24h,
        delta7d: pubSeries7d + pubs7d,
        series: publicationSeriesCount,
        issues: publicationCount,
      },
      events: {
        total: eventCount,
        delta24h: events24h,
        delta7d: events7d,
      },
    })
  } catch (error) {
    console.error("Failed to fetch content stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
