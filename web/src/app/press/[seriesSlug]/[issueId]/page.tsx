'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { remark } from 'remark'
import html from 'remark-html'

// Types
interface Byline {
  name: string
  role: string
  credit: string | null
}

interface Content {
  id: string
  title: string
  subtitle: string | null
  type: string
  content: string
  sortOrder: number
  heroImageUrl: string | null
  heroPosition: string | null
  layoutStyle: string | null
  pullquotes: string[] | null
  useDropcap: boolean | null
  columns: number | null
  accentColor: string | null
  bylines: Byline[]
}

interface Design {
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

interface PublicationData {
  id: string
  title: string
  type: string
  kyDate: string | null
  coverUrl: string | null
  volume: number | null
  issueNumber: number | null
  edition: string | null
  description: string | null
  series: {
    id: string
    name: string
    type: string
    publisherName: string | null
  }
  design: Design
  contents: Content[]
  contributors: Byline[]
  tableOfContents: { title: string; type: string; sortOrder: number; authors: string[] }[]
}

// Fixed virtual page - like a PDF, content is predetermined
// Using 8.5x11 proportions at a fixed resolution
const VIRTUAL_PAGE_WIDTH = 612  // 8.5 inches * 72 dpi
const VIRTUAL_PAGE_HEIGHT = 792 // 11 inches * 72 dpi

// Renderable item - a discrete piece of content that goes on a page
interface RenderableItem {
  type: 'cover' | 'back_cover' | 'toc_header' | 'toc_content' | 'ad' | 'article_header' | 'article_content' | 'continuation'
  contentId: string
  content: Content
  html?: string
  estimatedHeight: number // in virtual pixels
}

// Virtual page structure - contains multiple items that fit together
interface VirtualPage {
  items: RenderableItem[]
  isCover?: boolean
  isBackCover?: boolean
  isAd?: boolean
}

export default function IssueReaderPage() {
  const params = useParams()
  const seriesSlug = params.seriesSlug as string
  const issueId = params.issueId as string
  const [publication, setPublication] = useState<PublicationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSpread, setCurrentSpread] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [pages, setPages] = useState<VirtualPage[]>([])
  const [scale, setScale] = useState(1)

  // Prevent body scroll when this page is mounted
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    // Save original styles
    const originalStyles = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyHeight: body.style.height,
      bodyWidth: body.style.width,
      bodyTouchAction: body.style.touchAction,
    }

    // Lock scroll completely
    html.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = '0'
    body.style.left = '0'
    body.style.height = '100%'
    body.style.width = '100%'
    body.style.touchAction = 'none'

    return () => {
      // Restore original styles on unmount
      html.style.overflow = originalStyles.htmlOverflow
      html.style.height = ''
      body.style.overflow = originalStyles.bodyOverflow
      body.style.position = originalStyles.bodyPosition
      body.style.top = originalStyles.bodyTop
      body.style.left = originalStyles.bodyLeft
      body.style.height = originalStyles.bodyHeight
      body.style.width = originalStyles.bodyWidth
      body.style.touchAction = originalStyles.bodyTouchAction
    }
  }, [])

  // Detect mobile/single-page mode based on width
  // Only use single page on phone-sized screens
  useEffect(() => {
    const checkLayout = () => {
      const vw = window.innerWidth
      // Switch to single page only on phone screens
      setIsMobile(vw < 480)
    }
    checkLayout()
    window.addEventListener('resize', checkLayout)
    return () => window.removeEventListener('resize', checkLayout)
  }, [])

  // Calculate scale to fit pages in viewport - always fits, never scrolls
  useEffect(() => {
    const calculateScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      // Main container is vh - 56px (below top bar)
      const containerHeight = vh - 56

      if (isMobile) {
        // Single page - fit within mobile viewport
        // Account for sub-header (~44px), dots (~44px)
        const availableHeight = containerHeight - 88 - 16 // header + dots + padding
        const availableWidth = vw - 16
        const scaleByWidth = availableWidth / VIRTUAL_PAGE_WIDTH
        const scaleByHeight = availableHeight / VIRTUAL_PAGE_HEIGHT
        const finalScale = Math.min(scaleByWidth, scaleByHeight, 1)
        setScale(finalScale)
      } else {
        // Spread - fit two pages side by side
        // Account for sub-header (~44px)
        const availableHeight = containerHeight - 44 - 32 // header + padding
        const availableWidth = vw - 64
        const spreadWidth = VIRTUAL_PAGE_WIDTH * 2 + 8
        const scaleByWidth = availableWidth / spreadWidth
        const scaleByHeight = availableHeight / VIRTUAL_PAGE_HEIGHT
        const finalScale = Math.min(scaleByWidth, scaleByHeight, 1)
        setScale(finalScale)
      }
    }
    calculateScale()
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [isMobile])

  // Fetch publication and build fixed pages
  useEffect(() => {
    fetch(`/api/press/issue/${issueId}`)
      .then(res => {
        if (!res.ok) throw new Error('Publication not found')
        return res.json()
      })
      .then(async (data: PublicationData) => {
        setPublication(data)

        // Process markdown to HTML for each content
        const processedContents: { content: Content; html: string }[] = []
        for (const content of data.contents) {
          const result = await remark().use(html).process(content.content)
          processedContents.push({ content, html: result.toString() })
        }

        // Constants for layout estimation
        const PAGE_PADDING = 36 * 2 // top + bottom
        const SAFETY_BUFFER = 24 // prevent overflow from undiscovered spacing
        const USABLE_HEIGHT = VIRTUAL_PAGE_HEIGHT - PAGE_PADDING - SAFETY_BUFFER
        const LINE_HEIGHT = 22 // ~14px font * 1.55 effective
        const CHARS_PER_LINE = 50 // estimate for single column
        const CHARS_PER_LINE_2COL = 100 // two columns combined

        // Estimate height of a paragraph
        const estimateParagraphHeight = (html: string, columns: number = 2): number => {
          const text = html.replace(/<[^>]+>/g, '')
          const charsPerLine = columns > 1 ? CHARS_PER_LINE_2COL : CHARS_PER_LINE
          const lines = Math.ceil(text.length / charsPerLine)
          return Math.max(LINE_HEIGHT, lines * LINE_HEIGHT + 4) // +4 for paragraph spacing
        }

        // Build all renderable items
        const allItems: RenderableItem[] = []

        for (const { content, html: processedHtml } of processedContents) {
          const effectiveColumns = content.columns ?? data.design.defaultColumns

          // Special full-page types
          if (content.type === 'cover') {
            allItems.push({
              type: 'cover',
              contentId: content.id,
              content,
              html: processedHtml,
              estimatedHeight: USABLE_HEIGHT, // full page
            })
            continue
          }

          if (content.type === 'back_cover') {
            allItems.push({
              type: 'back_cover',
              contentId: content.id,
              content,
              html: processedHtml,
              estimatedHeight: USABLE_HEIGHT,
            })
            continue
          }

          if (content.type === 'advertisement') {
            allItems.push({
              type: 'ad',
              contentId: content.id,
              content,
              html: processedHtml,
              estimatedHeight: USABLE_HEIGHT,
            })
            continue
          }

          // Table of contents
          if (content.type === 'table_of_contents') {
            allItems.push({
              type: 'toc_header',
              contentId: content.id,
              content,
              estimatedHeight: 52, // "Contents" header
            })

            const paragraphs = splitIntoParagraphs(processedHtml)
            for (const para of paragraphs) {
              allItems.push({
                type: 'toc_content',
                contentId: content.id,
                content,
                html: para,
                estimatedHeight: estimateParagraphHeight(para, 1),
              })
            }
            continue
          }

          // Regular articles - create header item
          // Note: 32px spacing is added during packing only when not first on page
          let headerHeight = 40 // headline
          headerHeight += 16 // mb-4 bottom margin on header container
          if (content.heroImageUrl && content.heroPosition !== 'background') {
            headerHeight += 216 // image + margin
          }
          if (content.subtitle) headerHeight += 28
          if (data.design.headerDividers) headerHeight += 12
          if (content.bylines?.length > 0) headerHeight += 32

          allItems.push({
            type: 'article_header',
            contentId: content.id,
            content,
            estimatedHeight: headerHeight,
          })

          // Split content into paragraphs
          const paragraphs = splitIntoParagraphs(processedHtml)
          for (const para of paragraphs) {
            allItems.push({
              type: 'article_content',
              contentId: content.id,
              content,
              html: para,
              estimatedHeight: estimateParagraphHeight(para, effectiveColumns),
            })
          }
        }

        // Pack items into pages
        const allPages: VirtualPage[] = []
        let currentPage: VirtualPage = { items: [] }
        let currentHeight = 0
        let lastContentId: string | null = null

        let lastContentType: string | null = null

        for (const item of allItems) {
          // Full-page items always get their own page
          if (item.type === 'cover' || item.type === 'back_cover' || item.type === 'ad') {
            // Save current page if it has content
            if (currentPage.items.length > 0) {
              allPages.push(currentPage)
              currentPage = { items: [] }
              currentHeight = 0
            }
            allPages.push({
              items: [item],
              isCover: item.type === 'cover',
              isBackCover: item.type === 'back_cover',
              isAd: item.type === 'ad',
            })
            lastContentId = item.contentId
            lastContentType = item.content.type
            continue
          }

          // Force new page after table of contents ends (when starting a new article)
          const isTocItem = item.type === 'toc_header' || item.type === 'toc_content'
          const wasInToc = lastContentType === 'table_of_contents'
          if (!isTocItem && wasInToc && currentPage.items.length > 0) {
            allPages.push(currentPage)
            currentPage = { items: [] }
            currentHeight = 0
          }

          // Check if this item fits on current page
          // For article headers, add 32px spacing if page already has content
          const isArticleHeader = item.type === 'article_header'
          const spacingNeeded = isArticleHeader && currentPage.items.length > 0 ? 32 : 0
          const effectiveHeight = item.estimatedHeight + spacingNeeded
          const fitsOnPage = currentHeight + effectiveHeight <= USABLE_HEIGHT

          // Article headers should have at least some content with them
          // Don't put a header at the very bottom of a page
          const isHeader = isArticleHeader || item.type === 'toc_header'
          const headerNeedsSpace = isHeader && (USABLE_HEIGHT - currentHeight) < 120

          if (!fitsOnPage || headerNeedsSpace) {
            // Start new page
            if (currentPage.items.length > 0) {
              allPages.push(currentPage)
            }
            currentPage = { items: [] }
            currentHeight = 0

            // Add continuation marker if we're continuing an article
            if (!isHeader && item.contentId === lastContentId && item.type === 'article_content') {
              const contItem: RenderableItem = {
                type: 'continuation',
                contentId: item.contentId,
                content: item.content,
                estimatedHeight: 24,
              }
              currentPage.items.push(contItem)
              currentHeight += 24
            }
          }

          // Recalculate spacing - it's 0 if this item is first on the page
          const actualSpacing = isArticleHeader && currentPage.items.length > 0 ? 32 : 0
          currentPage.items.push(item)
          currentHeight += item.estimatedHeight + actualSpacing
          lastContentId = item.contentId
          lastContentType = item.content.type
        }

        // Don't forget the last page
        if (currentPage.items.length > 0) {
          allPages.push(currentPage)
        }

        setPages(allPages)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load publication:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [issueId])

  // Build spreads from pages
  // Cover is on right of first spread, left is empty
  // Then pages pair: [1,2], [3,4], etc.
  // Back cover is on left of last spread if odd
  const spreads: { left: VirtualPage | null; right: VirtualPage | null }[] = []
  if (pages.length > 0) {
    // First spread: empty left, cover on right
    spreads.push({ left: null, right: pages[0] })

    // Remaining pages pair up
    for (let i = 1; i < pages.length; i += 2) {
      const left = pages[i]
      const right = pages[i + 1] || null
      spreads.push({ left, right })
    }
  }

  const maxSpread = spreads.length - 1

  // For mobile, we show individual pages
  // Page 0 = cover, then sequential
  const maxMobilePage = pages.length - 1
  const [currentMobilePage, setCurrentMobilePage] = useState(0)

  // Navigation
  const goNext = useCallback(() => {
    if (isMobile) {
      setCurrentMobilePage(prev => Math.min(prev + 1, maxMobilePage))
    } else {
      setCurrentSpread(prev => Math.min(prev + 1, maxSpread))
    }
  }, [maxSpread, maxMobilePage, isMobile])

  const goPrev = useCallback(() => {
    if (isMobile) {
      setCurrentMobilePage(prev => Math.max(prev - 1, 0))
    } else {
      setCurrentSpread(prev => Math.max(prev - 1, 0))
    }
  }, [isMobile])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  // Touch/swipe and pinch-to-zoom handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null)

  const getPinchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start - prevent browser zoom
      e.preventDefault()
      setPinchStartDistance(getPinchDistance(e.touches))
    } else if (e.touches.length === 1) {
      const touch = e.touches[0]
      if (zoomLevel > 1) {
        // Pan start when zoomed
        setLastPanPoint({ x: touch.clientX, y: touch.clientY })
      } else {
        // Swipe start when not zoomed
        setTouchStart({ x: touch.clientX, y: touch.clientY })
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance !== null) {
      // Pinch move - prevent browser zoom
      e.preventDefault()
      const currentDistance = getPinchDistance(e.touches)
      const pinchScale = currentDistance / pinchStartDistance
      const newZoom = Math.max(1, Math.min(3, zoomLevel * pinchScale))
      setZoomLevel(newZoom)
      setPinchStartDistance(currentDistance)

      // Reset pan when zooming back to 1
      if (newZoom === 1) {
        setPanOffset({ x: 0, y: 0 })
      }
    } else if (e.touches.length === 1 && zoomLevel > 1 && lastPanPoint) {
      // Pan when zoomed
      e.preventDefault()
      const touch = e.touches[0]
      const dx = touch.clientX - lastPanPoint.x
      const dy = touch.clientY - lastPanPoint.y
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastPanPoint({ x: touch.clientX, y: touch.clientY })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setLastPanPoint(null)

    if (pinchStartDistance !== null) {
      // Pinch end - snap back to 1 if close
      if (zoomLevel < 1.15) {
        setZoomLevel(1)
        setPanOffset({ x: 0, y: 0 })
      }
      setPinchStartDistance(null)
      return
    }

    if (touchStart === null || zoomLevel > 1) {
      setTouchStart(null)
      return
    }

    const diff = touchStart.x - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }

  // Reset zoom when changing pages
  useEffect(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [currentSpread, currentMobilePage])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </main>
    )
  }

  if (error || !publication) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-lg">{error || 'Publication not found'}</p>
          <Link href={`/press/${seriesSlug}`} className="text-amber-500 hover:text-amber-400 mt-4 inline-block">
            Back to Series
          </Link>
        </div>
      </main>
    )
  }

  const { design } = publication
  const currentSpreadData = spreads[currentSpread]
  const currentMobilePageData = pages[currentMobilePage]

  return (
      <main
        className="flex flex-col"
        style={{
          backgroundColor: '#0c0a09',
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          height: 'calc(100dvh - 56px)',
          overflow: 'hidden',
          touchAction: 'none',
          overscrollBehavior: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <header className="flex-shrink-0 bg-stone-950 border-b border-stone-800 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/press/${seriesSlug}`}
              className="text-stone-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-sm font-medium text-white">{publication.title}</h1>
              <p className="text-xs text-stone-500">{publication.series.name}</p>
            </div>
          </div>

          {/* Page indicator */}
          <div className="text-stone-500 text-sm">
            {isMobile
              ? `${currentMobilePage + 1} / ${pages.length}`
              : `${currentSpread + 1} / ${spreads.length}`
            }
          </div>
        </div>
      </header>

      {/* Reader Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Navigation Arrows (desktop) */}
          {!isMobile && (
            <>
              <button
                onClick={goPrev}
                disabled={currentSpread === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-stone-800/50 text-white flex items-center justify-center hover:bg-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                disabled={currentSpread === maxSpread}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-stone-800/50 text-white flex items-center justify-center hover:bg-stone-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Spread View (Desktop) */}
          {!isMobile && currentSpreadData && (
            <div
              style={{
                width: (VIRTUAL_PAGE_WIDTH * 2 + 8) * scale,
                height: VIRTUAL_PAGE_HEIGHT * scale,
              }}
            >
              <div
                className="flex"
                style={{
                  gap: '4px',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
              {/* Left Page - click to go back */}
              <div
                className={`shadow-2xl overflow-hidden flex-shrink-0 relative ${currentSpread > 0 ? 'cursor-pointer' : ''}`}
                style={{
                  width: VIRTUAL_PAGE_WIDTH,
                  height: VIRTUAL_PAGE_HEIGHT,
                  backgroundColor: currentSpreadData.left ? '#ffffff' : '#1c1917',
                }}
                onClick={() => currentSpread > 0 && goPrev()}
              >
                {currentSpreadData.left && (
                  <div style={{ pointerEvents: 'none' }}>
                    <PageRenderer
                      page={currentSpreadData.left}
                      design={design}
                    />
                  </div>
                )}
              </div>

              {/* Right Page - click to go forward */}
              <div
                className={`shadow-2xl overflow-hidden flex-shrink-0 relative ${currentSpread < maxSpread ? 'cursor-pointer' : ''}`}
                style={{
                  width: VIRTUAL_PAGE_WIDTH,
                  height: VIRTUAL_PAGE_HEIGHT,
                  backgroundColor: currentSpreadData.right ? '#ffffff' : '#1c1917',
                }}
                onClick={() => currentSpread < maxSpread && goNext()}
              >
                {currentSpreadData.right && (
                  <div style={{ pointerEvents: 'none' }}>
                    <PageRenderer
                      page={currentSpreadData.right}
                      design={design}
                    />
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* Single Page View (Mobile) - click to go forward, pinch to zoom, drag to pan */}
          {isMobile && currentMobilePageData && (
            <div
              className="shadow-2xl overflow-hidden relative cursor-pointer"
              style={{
                width: VIRTUAL_PAGE_WIDTH * scale,
                height: VIRTUAL_PAGE_HEIGHT * scale,
                backgroundColor: '#ffffff',
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                transition: zoomLevel === 1 && panOffset.x === 0 && panOffset.y === 0 ? 'transform 0.2s ease-out' : 'none',
              }}
              onClick={zoomLevel === 1 ? goNext : () => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
            >
              <div
                style={{
                  pointerEvents: 'none',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: VIRTUAL_PAGE_WIDTH,
                  height: VIRTUAL_PAGE_HEIGHT,
                }}
              >
                <PageRenderer
                  page={currentMobilePageData}
                  design={design}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dots */}
      {isMobile && (
        <div className="flex-shrink-0 flex justify-center gap-1.5 py-3">
          {pages.slice(0, Math.min(12, pages.length)).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentMobilePage(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentMobilePage ? 'bg-amber-500' : 'bg-stone-700'
              }`}
            />
          ))}
          {pages.length > 12 && (
            <span className="text-stone-600 text-xs ml-1">+{pages.length - 12}</span>
          )}
        </div>
      )}
      </main>
  )
}

// Split HTML into paragraphs
function splitIntoParagraphs(html: string): string[] {
  const regex = /<(p|h[1-6]|ul|ol|li|blockquote|div)[^>]*>[\s\S]*?<\/\1>/gi
  const matches = html.match(regex) || []
  if (matches.length === 0 && html.trim()) {
    return [`<p>${html}</p>`]
  }
  return matches
}

// Page Renderer Component - renders multiple items on a page
function PageRenderer({
  page,
  design,
}: {
  page: VirtualPage
  design: Design
}) {
  const padding = 36

  // Headline style
  const headlineClass = design.headlineStyle === 'uppercase' ? 'uppercase' : ''

  // Full-page types
  if (page.isCover && page.items[0]) {
    const item = page.items[0]
    const effectiveAccent = item.content.accentColor ?? design.accentColor
    return (
      <div className="relative w-full h-full">
        {item.content.heroImageUrl ? (
          <Image
            src={item.content.heroImageUrl}
            alt={item.content.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ backgroundColor: effectiveAccent, padding }}
          >
            <h1
              className={`text-6xl font-bold text-white text-center ${headlineClass}`}
              style={{ fontFamily: design.headlineFont }}
            >
              {item.content.title}
            </h1>
            {item.content.subtitle && (
              <p className="text-xl text-white/80 mt-6 text-center" style={{ fontFamily: design.bodyFont }}>
                {item.content.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  if (page.isBackCover && page.items[0]) {
    const item = page.items[0]
    return (
      <div className="relative w-full h-full">
        {item.content.heroImageUrl ? (
          <Image
            src={item.content.heroImageUrl}
            alt={item.content.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: design.backgroundColor, padding }}
          >
            <p
              className="text-base text-center opacity-60"
              style={{ color: design.textColor, fontFamily: design.bodyFont }}
            >
              {item.content.content || item.content.title}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (page.isAd && page.items[0]) {
    const item = page.items[0]
    return (
      <div className="relative w-full h-full bg-stone-100">
        {item.content.heroImageUrl ? (
          <Image
            src={item.content.heroImageUrl}
            alt={item.content.title}
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-200" style={{ padding }}>
            <p className="text-xs uppercase tracking-wider text-stone-500 mb-4">Advertisement</p>
            <h3 className="text-2xl font-bold text-center">{item.content.title}</h3>
          </div>
        )}
      </div>
    )
  }

  // Regular page with multiple items
  // Group consecutive article_content items together for proper column layout
  const groupedItems: { type: 'single' | 'content_group'; items: RenderableItem[] }[] = []

  for (let i = 0; i < page.items.length; i++) {
    const item = page.items[i]

    if (item.type === 'article_content') {
      // Check if we can add to existing content group
      const lastGroup = groupedItems[groupedItems.length - 1]
      if (lastGroup?.type === 'content_group' && lastGroup.items[0].contentId === item.contentId) {
        lastGroup.items.push(item)
      } else {
        groupedItems.push({ type: 'content_group', items: [item] })
      }
    } else {
      groupedItems.push({ type: 'single', items: [item] })
    }
  }

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: design.backgroundColor, padding }}
    >
      {groupedItems.map((group, groupIdx) => {
        if (group.type === 'single') {
          const item = group.items[0]
          const idx = page.items.indexOf(item)
          return (
            <ItemRenderer
              key={`${item.contentId}-${groupIdx}`}
              item={item}
              design={design}
              headlineClass={headlineClass}
              isFirstContentItem={idx === 0 || page.items[idx - 1]?.contentId !== item.contentId}
              isFirstOnPage={groupIdx === 0}
            />
          )
        } else {
          // Content group - render all paragraphs in a single columned container
          const firstItem = group.items[0]
          const effectiveColumns = firstItem.content.columns ?? design.defaultColumns
          const firstItemIdx = page.items.indexOf(firstItem)
          const isFirstContent = firstItemIdx === 0 || page.items[firstItemIdx - 1]?.contentId !== firstItem.contentId
          const effectiveDropcap = (firstItem.content.useDropcap ?? design.useDropcaps) && isFirstContent

          return (
            <div
              key={`content-group-${firstItem.contentId}-${groupIdx}`}
              className={`prose prose-base max-w-none ${
                effectiveDropcap ? 'first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none' : ''
              }`}
              style={{
                fontFamily: design.bodyFont,
                fontSize: '14px',
                lineHeight: 1.7,
                color: design.textColor,
                columnCount: effectiveColumns > 1 ? effectiveColumns : undefined,
                columnGap: effectiveColumns > 1 ? '24px' : undefined,
              }}
              dangerouslySetInnerHTML={{
                __html: group.items.map(item => item.html || '').join('')
              }}
            />
          )
        }
      })}
    </div>
  )
}

// Individual item renderer
function ItemRenderer({
  item,
  design,
  headlineClass,
  isFirstContentItem,
  isFirstOnPage,
}: {
  item: RenderableItem
  design: Design
  headlineClass: string
  isFirstContentItem: boolean
  isFirstOnPage: boolean
}) {
  const effectiveColumns = item.content.columns ?? design.defaultColumns
  const effectiveAccent = item.content.accentColor ?? design.accentColor
  const effectiveDropcap = (item.content.useDropcap ?? design.useDropcaps) && isFirstContentItem

  switch (item.type) {
    case 'toc_header':
      return (
        <h2
          className={`text-3xl font-bold mb-6 ${headlineClass}`}
          style={{ fontFamily: design.headlineFont, fontWeight: design.headlineWeight, color: design.textColor }}
        >
          Contents
        </h2>
      )

    case 'toc_content':
      return (
        <div
          className="prose prose-base max-w-none"
          style={{
            fontFamily: design.bodyFont,
            color: design.textColor,
            fontSize: '14px',
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: item.html || '' }}
        />
      )

    case 'article_header':
      return (
        <div className="mb-4" style={{ marginTop: isFirstOnPage ? 0 : 32 }}>
          {/* Hero Image */}
          {item.content.heroImageUrl && item.content.heroPosition !== 'background' && (
            <div className="mb-4">
              <div className="relative" style={{ height: 200 }}>
                <Image
                  src={item.content.heroImageUrl}
                  alt={item.content.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Headline */}
          <h2
            className={`text-3xl mb-2 ${headlineClass}`}
            style={{
              fontFamily: design.headlineFont,
              fontWeight: design.headlineWeight,
              color: design.textColor,
              lineHeight: 1.2,
            }}
          >
            {item.content.title}
          </h2>

          {/* Subtitle/Deck */}
          {item.content.subtitle && (
            <p
              className="text-base mb-3 opacity-80"
              style={{ fontFamily: design.bodyFont, color: design.textColor }}
            >
              {item.content.subtitle}
            </p>
          )}

          {/* Divider */}
          {design.headerDividers && (
            <div className="border-b mb-3" style={{ borderColor: effectiveAccent }} />
          )}

          {/* Bylines */}
          {item.content.bylines.length > 0 && (
            <p
              className="text-sm mb-4 uppercase tracking-wider"
              style={{ fontFamily: design.bylineFont, color: design.textColor, opacity: 0.7 }}
            >
              By {item.content.bylines.filter(b => b.role === 'author').map(b => b.credit || b.name).join(', ')}
            </p>
          )}
        </div>
      )

    case 'continuation':
      return (
        <p
          className="text-xs uppercase tracking-wider mb-3 opacity-50"
          style={{ fontFamily: design.bylineFont, color: design.textColor }}
        >
          {item.content.title} (continued)
        </p>
      )

    case 'article_content':
      // Note: article_content items are grouped and rendered together in PageRenderer
      // This fallback is for any edge cases where they're rendered individually
      return (
        <div
          className="prose prose-base max-w-none"
          style={{
            fontFamily: design.bodyFont,
            fontSize: '14px',
            lineHeight: 1.7,
            color: design.textColor,
          }}
          dangerouslySetInnerHTML={{ __html: item.html || '' }}
        />
      )

    default:
      return null
  }
}
