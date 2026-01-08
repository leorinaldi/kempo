'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  heroImageWidth: number | null
  heroImageHeight: number | null
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
const PAGE_PADDING = 36
const MEASUREMENT_BUFFER = 12 // Safety buffer to prevent overflow due to measurement/render differences
const USABLE_HEIGHT = VIRTUAL_PAGE_HEIGHT - (PAGE_PADDING * 2) - MEASUREMENT_BUFFER // 708px
const USABLE_WIDTH = VIRTUAL_PAGE_WIDTH - (PAGE_PADDING * 2) // 540px

// Renderable item - a discrete piece of content that goes on a page
interface RenderableItem {
  type: 'cover' | 'back_cover' | 'toc_header' | 'toc_content' | 'ad' | 'article_header' | 'article_content' | 'continuation' | 'inline_image'
  contentId: string
  content: Content
  html?: string
  // For inline images
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  imageCaption?: string
  imagePosition?: 'left' | 'right'
  // Split index calculated during measurement - how many following items go beside the image
  besideSplitIndex?: number
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
  const [allItems, setAllItems] = useState<RenderableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSpread, setCurrentSpread] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [pages, setPages] = useState<VirtualPage[]>([])
  const [scale, setScale] = useState(1)
  const measurementContainerRef = useRef<HTMLDivElement>(null)

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

  // Phase 1: Fetch publication and build renderable items (no height estimation)
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

        // Build all renderable items (heights will be measured via DOM)
        const items: RenderableItem[] = []

        for (const { content, html: processedHtml } of processedContents) {
          // Special full-page types
          if (content.type === 'cover') {
            items.push({
              type: 'cover',
              contentId: content.id,
              content,
              html: processedHtml,
            })
            continue
          }

          if (content.type === 'back_cover') {
            items.push({
              type: 'back_cover',
              contentId: content.id,
              content,
              html: processedHtml,
            })
            continue
          }

          if (content.type === 'advertisement') {
            items.push({
              type: 'ad',
              contentId: content.id,
              content,
              html: processedHtml,
            })
            continue
          }

          // Table of contents
          if (content.type === 'table_of_contents') {
            items.push({
              type: 'toc_header',
              contentId: content.id,
              content,
            })

            const paragraphs = splitIntoParagraphs(processedHtml)
            for (const para of paragraphs) {
              items.push({
                type: 'toc_content',
                contentId: content.id,
                content,
                html: para,
              })
            }
            continue
          }

          // Regular articles - create header item
          items.push({
            type: 'article_header',
            contentId: content.id,
            content,
          })

          // Split content into paragraphs and inline images
          const contentElements = splitIntoContentElements(processedHtml)
          for (const element of contentElements) {
            if (element.type === 'image') {
              items.push({
                type: 'inline_image',
                contentId: content.id,
                content,
                imageUrl: element.imageUrl,
                imageWidth: element.imageWidth,
                imageHeight: element.imageHeight,
                imageCaption: element.imageCaption,
                imagePosition: element.imagePosition,
              })
            } else {
              items.push({
                type: 'article_content',
                contentId: content.id,
                content,
                html: element.html,
              })
            }
          }
        }

        setAllItems(items)
        setIsLoading(false)
        setIsMeasuring(true) // Trigger measurement phase
      })
      .catch(err => {
        console.error('Failed to load publication:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [issueId])

  // Phase 2: Measure items and pack into pages using actual DOM heights
  useEffect(() => {
    if (!isMeasuring || !publication || allItems.length === 0) return

    const measureAndPack = async () => {
      // Wait for fonts to load
      await document.fonts.ready

      const container = measurementContainerRef.current
      if (!container) return

      const { design } = publication
      const headlineClass = design.headlineStyle === 'uppercase' ? 'uppercase' : ''

      // Helper to measure an element's height
      const measureHeight = (): number => {
        return container.getBoundingClientRect().height
      }

      // Helper to clear the measurement container
      const clearContainer = () => {
        container.innerHTML = ''
      }

      // Helper to render an item into the container and return its HTML
      // IMPORTANT: Uses pure inline styles (no Tailwind classes) because the measurement
      // container is dynamically created and Tailwind classes won't be processed
      const renderItemForMeasurement = (
        item: RenderableItem,
        isFirstOnPage: boolean,
        isFirstContentItem: boolean,
        existingContentHtml: string = ''
      ): string => {
        const effectiveColumns = item.content.columns ?? design.defaultColumns
        const effectiveAccent = item.content.accentColor ?? design.accentColor
        const textTransform = design.headlineStyle === 'uppercase' ? 'uppercase' : 'none'

        switch (item.type) {
          case 'toc_header':
            // text-3xl = 30px, font-bold = 700, mb-6 = 24px
            return `<h2 style="font-family: ${design.headlineFont}; font-weight: 700; color: ${design.textColor}; font-size: 30px; line-height: 1.2; margin: 0 0 24px 0; text-transform: ${textTransform};">Contents</h2>`

          case 'toc_content':
            // Prose styles add margins to nested p tags
            return `<div style="font-family: ${design.bodyFont}; color: ${design.textColor}; font-size: 14px; line-height: 1.6;">${addProseMargins(item.html || '')}</div>`

          case 'article_header': {
            const marginTop = isFirstOnPage ? 0 : 32
            // mb-4 = 16px
            let headerHtml = `<div style="margin-top: ${marginTop}px; margin-bottom: 16px;">`

            // Hero image (if not background)
            if (item.content.heroImageUrl && item.content.heroPosition !== 'background') {
              const imgWidth = item.content.heroImageWidth || 800
              const imgHeight = item.content.heroImageHeight || 600
              const position = item.content.heroPosition || 'top'

              let displayHeight: number
              let displayWidth: number
              let floatStyle = ''

              if (position === 'left' || position === 'right') {
                displayWidth = Math.round(USABLE_WIDTH * 0.4)
                displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
                floatStyle = `float: ${position}; margin-${position === 'left' ? 'right' : 'left'}: 16px; margin-bottom: 12px;`
              } else {
                displayWidth = USABLE_WIDTH
                displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
                displayHeight = Math.min(displayHeight, Math.round(USABLE_HEIGHT * 0.5))
              }

              // mb-4 = 16px
              headerHtml += `<div style="margin-bottom: 16px; ${floatStyle}"><div style="height: ${displayHeight}px; width: ${displayWidth}px; background: #e5e5e5;"></div></div>`
            }

            // Headline: text-3xl = 30px, mb-2 = 8px
            headerHtml += `<h2 style="font-family: ${design.headlineFont}; font-weight: ${design.headlineWeight}; color: ${design.textColor}; font-size: 30px; line-height: 1.2; margin: 0 0 8px 0; text-transform: ${textTransform};">${item.content.title}</h2>`

            // Subtitle: text-base = 16px, mb-3 = 12px
            if (item.content.subtitle) {
              headerHtml += `<p style="font-family: ${design.bodyFont}; color: ${design.textColor}; font-size: 16px; margin: 0 0 12px 0; opacity: 0.8;">${item.content.subtitle}</p>`
            }

            // Divider: mb-3 = 12px
            if (design.headerDividers) {
              headerHtml += `<div style="border-bottom: 1px solid ${effectiveAccent}; margin-bottom: 12px;"></div>`
            }

            // Bylines: text-sm = 14px, mb-4 = 16px
            if (item.content.bylines?.length > 0) {
              const authors = item.content.bylines.filter(b => b.role === 'author').map(b => b.credit || b.name).join(', ')
              if (authors) {
                headerHtml += `<p style="font-family: ${design.bylineFont}; color: ${design.textColor}; font-size: 14px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7;">By ${authors}</p>`
              }
            }

            headerHtml += '</div>'
            return headerHtml
          }

          case 'article_content': {
            const combinedHtml = existingContentHtml + (item.html || '')
            const styledHtml = addProseMargins(combinedHtml)

            // If there's a pending image (grid layout), split content into beside and below
            if (pendingImageHeight > 0 && charsBesidePendingImage > 0) {
              const plainText = combinedHtml.replace(/<[^>]*>/g, '')
              const totalChars = plainText.length

              if (totalChars <= charsBesidePendingImage) {
                // All content fits beside the image - goes in the grid's beside cell
                charsAccumulatedBesideImage = totalChars
                // Content will be placed in the beside-image-text div by the grid
                return `<div style="font-family: ${design.bodyFont}; font-size: 14px; line-height: 1.7; color: ${design.textColor};">${styledHtml}</div>`
              } else {
                // Content overflows - split into beside (in grid cell) and below (columned)
                const besideRatio = charsBesidePendingImage / totalChars

                // Add column-span: all to headers in the below section
                const subheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em; color: ${design.textColor}; column-span: all;`
                const belowHtml = styledHtml.substring(Math.floor(styledHtml.length * besideRatio))
                  .replace(/<h2 style="[^"]*">/g, `<h2 style="${subheaderStyle}">`)
                  .replace(/<h3 style="[^"]*">/g, `<h3 style="${subheaderStyle}">`)

                charsAccumulatedBesideImage = charsBesidePendingImage
                pendingImageHeight = 0 // Clear after handling

                // Grid row 1 content (beside image) + row 2 (columned below)
                return `<div style="font-family: ${design.bodyFont}; font-size: 14px; line-height: 1.7; color: ${design.textColor};">
                  <div style="margin-bottom: 12px;">${styledHtml.substring(0, Math.floor(styledHtml.length * besideRatio))}</div>
                  <div style="column-count: ${effectiveColumns > 1 ? effectiveColumns : 1}; column-gap: ${effectiveColumns > 1 ? '24px' : '0'};">${belowHtml}</div>
                </div>`
              }
            }

            // Normal case - no pending image, use columns
            return `<div style="font-family: ${design.bodyFont}; font-size: 14px; line-height: 1.7; color: ${design.textColor}; column-count: ${effectiveColumns > 1 ? effectiveColumns : 1}; column-gap: ${effectiveColumns > 1 ? '24px' : '0'};">${styledHtml}</div>`
          }

          case 'continuation':
            // text-xs = 12px, mb-3 = 12px
            return `<p style="font-family: ${design.bylineFont}; color: ${design.textColor}; font-size: 12px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">${item.content.title} (continued)</p>`

          case 'inline_image': {
            // Use CSS Grid layout matching the rendering code
            const columnGap = 24
            const columnWidth = Math.round((USABLE_WIDTH - columnGap) / 2)

            const imgWidth = item.imageWidth || 800
            const imgHeight = item.imageHeight || 600
            const displayWidth = columnWidth
            const displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
            // Cap height at 50% of usable page height (matching rendering)
            const cappedHeight = Math.min(displayHeight, Math.round(USABLE_HEIGHT * 0.5))
            const finalWidth = cappedHeight < displayHeight
              ? Math.round((cappedHeight / imgHeight) * imgWidth)
              : displayWidth

            // Caption height estimate
            const captionHeight = item.imageCaption ? 20 : 0
            const imageRowHeight = cappedHeight + captionHeight

            // Calculate how many characters fit beside the image (matching rendering)
            const lineHeight = 23.8
            const charWidthEst = 5
            const linesNextToImage = Math.floor(imageRowHeight / lineHeight)
            const charsPerLine = Math.floor(columnWidth / charWidthEst)

            // Store for measuring subsequent content - NO buffer, exact match with rendering
            pendingImageHeight = imageRowHeight
            charsBesidePendingImage = linesNextToImage * charsPerLine
            charsAccumulatedBesideImage = 0

            // Use CSS Grid for measurement (matching rendering layout)
            const isLeftImage = item.imagePosition === 'left'
            const gridCols = isLeftImage
              ? `${finalWidth}px 1fr`
              : `1fr ${finalWidth}px`

            let imageHtml = `<div style="display: grid; grid-template-columns: ${gridCols}; gap: ${columnGap}px; margin-bottom: 12px;">`
            // Image cell
            imageHtml += `<figure style="margin: 0; grid-column: ${isLeftImage ? 1 : 2}; grid-row: 1;">`
            imageHtml += `<div style="height: ${cappedHeight}px; width: ${finalWidth}px; background: #e5e5e5;"></div>`
            if (item.imageCaption) {
              imageHtml += `<figcaption style="font-family: ${design.bodyFont}; font-size: 11px; color: ${design.textColor}; opacity: 0.7; margin-top: 6px; font-style: italic; text-align: center;">${item.imageCaption}</figcaption>`
            }
            imageHtml += `</figure>`
            // Text beside cell (will be filled by subsequent content)
            imageHtml += `<div style="grid-column: ${isLeftImage ? 2 : 1}; grid-row: 1; overflow: hidden; max-height: ${imageRowHeight}px;" class="beside-image-text"></div>`
            imageHtml += `</div>`
            return imageHtml
          }

          default:
            return ''
        }
      }

      // Add prose-like margins to HTML content
      // Using tighter margins (0.5em) than default prose (1.25em) for magazine density
      // Section subheaders (h2/h3) get headline font styling
      const addProseMargins = (html: string): string => {
        const subheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em; color: ${design.textColor};`
        return html
          .replace(/<p>/g, '<p style="margin: 0.5em 0;">')
          .replace(/<p class="/g, '<p style="margin: 0.5em 0;" class="')
          .replace(/<h2>/g, `<h2 style="${subheaderStyle}">`)
          .replace(/<h2 class="/g, `<h2 style="${subheaderStyle}" class="`)
          .replace(/<h3>/g, `<h3 style="${subheaderStyle}">`)
          .replace(/<h3 class="/g, `<h3 style="${subheaderStyle}" class="`)
          .replace(/<ul>/g, '<ul style="margin: 0.5em 0; padding-left: 1.5em;">')
          .replace(/<ol>/g, '<ol style="margin: 0.5em 0; padding-left: 1.5em;">')
          .replace(/<li>/g, '<li style="margin: 0.25em 0;">')
          .replace(/<blockquote>/g, '<blockquote style="margin: 0.5em 0; padding-left: 1em; border-left: 3px solid #e5e5e5;">')
      }

      // Pack items into pages using actual DOM measurements
      const allPages: VirtualPage[] = []
      let currentPage: VirtualPage = { items: [] }
      let lastContentId: string | null = null
      let lastContentType: string | null = null

      // Track content accumulation for columned layouts
      let accumulatedContentHtml = ''
      let accumulatedContentItems: RenderableItem[] = []

      // Track pending inline image for proper content split measurement
      let pendingImageHeight = 0
      let charsBesidePendingImage = 0
      let charsAccumulatedBesideImage = 0

      const finalizePage = () => {
        if (currentPage.items.length > 0) {
          allPages.push(currentPage)
        }
        currentPage = { items: [] }
        clearContainer()
        accumulatedContentHtml = ''
        accumulatedContentItems = []
        pendingImageHeight = 0
        charsBesidePendingImage = 0
        charsAccumulatedBesideImage = 0
      }

      const commitAccumulatedContent = () => {
        if (accumulatedContentItems.length > 0) {
          currentPage.items.push(...accumulatedContentItems)
          accumulatedContentItems = []
        }
      }

      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i]

        // Full-page items always get their own page
        if (item.type === 'cover' || item.type === 'back_cover' || item.type === 'ad') {
          commitAccumulatedContent()
          finalizePage()

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

        // Force new page after table of contents ends
        const isTocItem = item.type === 'toc_header' || item.type === 'toc_content'
        const wasInToc = lastContentType === 'table_of_contents'
        if (!isTocItem && wasInToc && currentPage.items.length > 0) {
          commitAccumulatedContent()
          finalizePage()
        }

        const isFirstOnPage = currentPage.items.length === 0 && accumulatedContentItems.length === 0
        const isFirstContentItem = item.contentId !== lastContentId || item.type === 'article_header'
        const isArticleHeader = item.type === 'article_header'
        const isArticleContent = item.type === 'article_content'

        // Handle article content accumulation for proper column measurement
        if (isArticleContent && item.contentId === lastContentId && accumulatedContentItems.length > 0) {
          // Try adding this paragraph to accumulated content
          // Rebuild the entire page measurement from scratch to get accurate height
          const testAccumulatedHtml = accumulatedContentHtml + (item.html || '')

          // Rebuild container with all current page items plus the new accumulated content
          let testContainerHtml = ''
          for (const pageItem of currentPage.items) {
            const itemFirstOnPage = testContainerHtml === ''
            testContainerHtml += renderItemForMeasurement(pageItem, itemFirstOnPage, pageItem.type === 'article_header')
          }
          // Add the accumulated content with the new paragraph
          testContainerHtml += renderItemForMeasurement(item, testContainerHtml === '', false, accumulatedContentHtml)

          container.innerHTML = testContainerHtml
          const newHeight = measureHeight()

          if (newHeight <= USABLE_HEIGHT) {
            // Fits! Update accumulated content
            accumulatedContentHtml = testAccumulatedHtml
            accumulatedContentItems.push(item)
          } else {
            // Doesn't fit - start new page
            commitAccumulatedContent()
            finalizePage()

            // Add continuation marker
            const contItem: RenderableItem = {
              type: 'continuation',
              contentId: item.contentId,
              content: item.content,
            }
            const contHtml = renderItemForMeasurement(contItem, true, false)
            container.innerHTML = contHtml
            currentPage.items.push(contItem)

            // Start fresh accumulation with this paragraph
            const contentHtml = renderItemForMeasurement(item, false, false, '')
            container.innerHTML += contentHtml
            accumulatedContentHtml = item.html || ''
            accumulatedContentItems = [item]
          }
        } else {
          // Non-content item, inline image, or new article - commit any accumulated content first
          const isInlineImage = item.type === 'inline_image'
          if (accumulatedContentItems.length > 0 && (item.contentId !== lastContentId || isInlineImage)) {
            commitAccumulatedContent()
            accumulatedContentHtml = ''
          }

          // Special handling for inline_image: use DOM measurement to find exact content split
          if (isInlineImage) {
            // Calculate image dimensions
            const columnGap = 24
            const columnWidth = Math.round((USABLE_WIDTH - columnGap) / 2)
            const imgWidth = item.imageWidth || 800
            const imgHeight = item.imageHeight || 600
            const displayWidth = columnWidth
            const displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
            const cappedHeight = Math.min(displayHeight, Math.round(USABLE_HEIGHT * 0.5))
            const finalWidth = cappedHeight < displayHeight
              ? Math.round((cappedHeight / imgHeight) * imgWidth)
              : displayWidth
            const captionHeight = item.imageCaption ? 30 : 0
            const imageRowHeight = cappedHeight + captionHeight + 12 // +12 for margin-bottom

            const isLeftImage = item.imagePosition === 'left'
            const effectiveColumns = item.content.columns ?? design.defaultColumns
            const gridCols = isLeftImage ? `${finalWidth}px 1fr` : `1fr ${finalWidth}px`

            // Collect ALL following content items with same contentId
            const allFollowingContent: RenderableItem[] = []
            let lookAhead = i + 1
            while (lookAhead < allItems.length &&
                   allItems[lookAhead].type === 'article_content' &&
                   allItems[lookAhead].contentId === item.contentId) {
              allFollowingContent.push(allItems[lookAhead])
              lookAhead++
            }

            // Helper to generate styles for content
            const contentStyles = `font-family: ${design.bodyFont}; font-size: 14px; line-height: 1.7;`
            const subheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em;`

            const processHtmlForMeasurement = (html: string, forColumns: boolean = false) => {
              let processed = html
                .replace(/<p>/g, '<p style="margin: 0.5em 0;">')
                .replace(/<p class="/g, '<p style="margin: 0.5em 0;" class="')
              const headerSpan = forColumns ? ' column-span: all;' : ''
              processed = processed
                .replace(/<h2>/g, `<h2 style="${subheaderStyle}${headerSpan}">`)
                .replace(/<h2 class="/g, `<h2 style="${subheaderStyle}${headerSpan}" class="`)
                .replace(/<h3>/g, `<h3 style="${subheaderStyle}${headerSpan}">`)
                .replace(/<h3 class="/g, `<h3 style="${subheaderStyle}${headerSpan}" class="`)
              return processed
            }

            // Use float-based measurement with columns - text flows naturally around the image
            // Find how many content items fit on this page with the floating image
            const floatMargin = isLeftImage ? '0 24px 12px 0' : '0 0 12px 24px'

            // Build float-based measurement HTML template with columns
            const buildFloatMeasureHtml = (contentHtml: string) => {
              const figureMargin = isLeftImage ? '12px 24px 12px 0' : '12px 0 12px 24px'
              let html = `<div style="${contentStyles} column-count: ${effectiveColumns}; column-gap: 24px;">`
              html += `<figure style="float: ${isLeftImage ? 'left' : 'right'}; width: ${finalWidth}px; margin: ${figureMargin}; break-inside: avoid;">`
              html += `<div style="height: ${cappedHeight}px; width: ${finalWidth}px; background: #ccc;"></div>`
              if (item.imageCaption) {
                html += `<figcaption style="font-size: 11px; margin-top: 6px;">${item.imageCaption}</figcaption>`
              }
              html += `</figure>`
              html += `<div>${contentHtml}</div>`
              html += `<div style="clear: both;"></div>`
              html += `</div>`
              return html
            }

            // Find how many items fit on the page with the image
            // Be slightly aggressive - float+columns can render more compactly than measured
            let itemsForThisPage: RenderableItem[] = []
            let lastFittingHeight = 0
            for (let j = 0; j < allFollowingContent.length; j++) {
              const testContentHtml = processHtmlForMeasurement(
                allFollowingContent.slice(0, j + 1).map(c => c.html || '').join('')
              )
              const measureHtml = buildFloatMeasureHtml(testContentHtml)

              // Measure with current page content + this image group
              let fullPageHtml = ''
              for (const pageItem of currentPage.items) {
                fullPageHtml += renderItemForMeasurement(pageItem, fullPageHtml === '', pageItem.type === 'article_header')
              }
              fullPageHtml += measureHtml

              container.innerHTML = fullPageHtml
              const totalHeight = measureHeight()

              if (totalHeight > USABLE_HEIGHT) {
                // This item pushes us over - but float+columns often renders more compact than measured
                // Be very aggressive: include up to 4 more items beyond what measurement says fits
                // CSS columns distribute content much more efficiently than measured
                const extraItems = Math.min(4, allFollowingContent.length - j)
                itemsForThisPage = allFollowingContent.slice(0, j + extraItems)
                break
              }
              lastFittingHeight = totalHeight
              itemsForThisPage = allFollowingContent.slice(0, j + 1)
            }

            // Build final measurement HTML with the items that fit
            const finalContentHtml = processHtmlForMeasurement(
              itemsForThisPage.map(c => c.html || '').join('')
            )
            const measureHtml = buildFloatMeasureHtml(finalContentHtml)

            // Measure the ENTIRE page (current items + this image group) at once
            let fullPageHtml = ''
            for (const pageItem of currentPage.items) {
              fullPageHtml += renderItemForMeasurement(pageItem, fullPageHtml === '', pageItem.type === 'article_header')
            }
            fullPageHtml += measureHtml

            container.innerHTML = fullPageHtml
            const totalPageHeight = measureHeight()

            if (totalPageHeight > USABLE_HEIGHT && !isFirstOnPage) {
              // Doesn't fit with content - try with just the image (no following content)
              const imageOnlyHtml = buildFloatMeasureHtml('')

              let minimalPageHtml = ''
              for (const pageItem of currentPage.items) {
                minimalPageHtml += renderItemForMeasurement(pageItem, minimalPageHtml === '', pageItem.type === 'article_header')
              }
              minimalPageHtml += imageOnlyHtml

              container.innerHTML = minimalPageHtml
              const minimalHeight = measureHeight()

              if (minimalHeight > USABLE_HEIGHT) {
                // Even just the image doesn't fit - must start new page
                commitAccumulatedContent()
                finalizePage()
                // After starting a new page, include content aggressively since image will be first
                // Re-run measurement with empty currentPage
                itemsForThisPage = allFollowingContent.slice(0, Math.min(6, allFollowingContent.length))
              } else {
                // Just the image fits - but still include some content aggressively
                // Float+columns will distribute content efficiently
                itemsForThisPage = allFollowingContent.slice(0, Math.min(4, allFollowingContent.length))
              }
            }

            // Add image and the items we determined fit on this page
            currentPage.items.push(item)
            currentPage.items.push(...itemsForThisPage)

            // Skip only the items we've added (remaining items will be processed normally)
            i += itemsForThisPage.length // Skip past the items we added

            lastContentId = item.contentId
            lastContentType = item.content.type
            continue
          }

          // Render item for measurement
          const itemHtml = renderItemForMeasurement(item, isFirstOnPage, isFirstContentItem)

          // For headers, check if there's enough room for header + some content
          if (isArticleHeader) {
            const testContainer = container.innerHTML + itemHtml
            container.innerHTML = testContainer
            const heightWithHeader = measureHeight()
            const remainingSpace = USABLE_HEIGHT - heightWithHeader

            // Header needs at least 120px for some content below it
            if (remainingSpace < 120 && !isFirstOnPage) {
              commitAccumulatedContent()
              finalizePage()
              container.innerHTML = renderItemForMeasurement(item, true, isFirstContentItem)
            }
          } else {
            container.innerHTML += itemHtml
          }

          const newHeight = measureHeight()

          if (newHeight > USABLE_HEIGHT && !isFirstOnPage) {
            // Doesn't fit - remove from container and start new page
            commitAccumulatedContent()
            finalizePage()

            // Check if this is a continuation
            if (isArticleContent && item.contentId === lastContentId) {
              const contItem: RenderableItem = {
                type: 'continuation',
                contentId: item.contentId,
                content: item.content,
              }
              const contHtml = renderItemForMeasurement(contItem, true, false)
              container.innerHTML = contHtml
              currentPage.items.push(contItem)
            }

            // Re-render the item
            const freshHtml = renderItemForMeasurement(item, currentPage.items.length === 0, isFirstContentItem)
            container.innerHTML += freshHtml

            if (isArticleContent) {
              accumulatedContentHtml = item.html || ''
              accumulatedContentItems = [item]
            } else {
              currentPage.items.push(item)
            }
          } else {
            // Fits on current page
            if (isArticleContent) {
              accumulatedContentHtml = item.html || ''
              accumulatedContentItems = [item]
            } else {
              currentPage.items.push(item)
            }
          }
        }

        lastContentId = item.contentId
        lastContentType = item.content.type
      }

      // Finalize last page
      commitAccumulatedContent()
      if (currentPage.items.length > 0) {
        allPages.push(currentPage)
      }

      setPages(allPages)
      setIsMeasuring(false)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      measureAndPack()
    })
  }, [isMeasuring, publication, allItems])

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

  // Show measuring state while paginating
  if (isMeasuring) {
    return (
      <>
        {/* Hidden measurement container - must be in DOM for measurements */}
        <div
          ref={measurementContainerRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: `${USABLE_WIDTH}px`,
            visibility: 'hidden',
            backgroundColor: publication.design.backgroundColor,
          }}
        />
        <main className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg mb-2">Laying out pages...</div>
            <div className="text-stone-500 text-sm">Measuring content for optimal pagination</div>
          </div>
        </main>
      </>
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

// Content element - either a paragraph or an inline image
interface ContentElement {
  type: 'paragraph' | 'image'
  html?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  imageCaption?: string
  imagePosition?: 'left' | 'right'
}

// Split HTML into paragraphs and images
function splitIntoContentElements(html: string): ContentElement[] {
  const elements: ContentElement[] = []

  // Match paragraphs, headers, lists, blockquotes, divs
  // Note: remark wraps our {{IMAGE:...}} syntax in <p> tags, so we detect those
  const regex = /<(p|h[1-6]|ul|ol|li|blockquote|div)[^>]*>[\s\S]*?<\/\1>/gi

  let match
  while ((match = regex.exec(html)) !== null) {
    const fullMatch = match[0]

    // Check if this paragraph contains only an IMAGE token
    const imageMatch = fullMatch.match(/^<p>\s*\{\{IMAGE:([^}]+)\}\}\s*<\/p>$/i)
    if (imageMatch) {
      // Parse image syntax: {{IMAGE:url|width|height|caption|position}}
      const imageData = imageMatch[1]
      const parts = imageData.split('|')
      const url = parts[0]
      const width = parts[1]
      const height = parts[2]
      // Caption and position - check if last part is 'left' or 'right'
      let caption: string | undefined
      let position: 'left' | 'right' = 'right' // default
      if (parts.length > 3) {
        const lastPart = parts[parts.length - 1]?.toLowerCase()
        if (lastPart === 'left' || lastPart === 'right') {
          position = lastPart as 'left' | 'right'
          caption = parts.slice(3, -1).join('|') || undefined
        } else {
          caption = parts.slice(3).join('|') || undefined
        }
      }
      elements.push({
        type: 'image',
        imageUrl: url,
        imageWidth: parseInt(width) || undefined,
        imageHeight: parseInt(height) || undefined,
        imageCaption: caption,
        imagePosition: position
      })
    } else {
      elements.push({
        type: 'paragraph',
        html: fullMatch
      })
    }
  }

  if (elements.length === 0 && html.trim()) {
    return [{ type: 'paragraph', html: `<p>${html}</p>` }]
  }

  return elements
}

// Legacy function for backwards compatibility
function splitIntoParagraphs(html: string): string[] {
  return splitIntoContentElements(html)
    .filter(e => e.type === 'paragraph')
    .map(e => e.html || '')
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
  // Also group inline_image with following content for text-wrap effect
  const groupedItems: { type: 'single' | 'content_group' | 'image_with_content'; items: RenderableItem[] }[] = []

  for (let i = 0; i < page.items.length; i++) {
    const item = page.items[i]

    if (item.type === 'inline_image') {
      // Collect following article_content items from the same article
      const imageGroup: RenderableItem[] = [item]
      while (i + 1 < page.items.length &&
             page.items[i + 1].type === 'article_content' &&
             page.items[i + 1].contentId === item.contentId) {
        i++
        imageGroup.push(page.items[i])
      }
      groupedItems.push({ type: 'image_with_content', items: imageGroup })
    } else if (item.type === 'article_content') {
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
        } else if (group.type === 'image_with_content') {
          // Use CSS Grid for predictable layout:
          // Row 1: [Image] [Text beside] or [Text beside] [Image]
          // Row 2: [Two-column text spanning full width]
          const imageItem = group.items[0]
          const contentItems = group.items.slice(1)

          // Image width = one column (half of usable width minus half the gap)
          const columnGap = 24
          const columnWidth = Math.round((USABLE_WIDTH - columnGap) / 2)

          // Calculate image height preserving aspect ratio
          const imgWidth = imageItem.imageWidth || 800
          const imgHeight = imageItem.imageHeight || 600
          const displayWidth = columnWidth
          const displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
          // Cap height at 50% of usable page height to leave room for content below
          const cappedHeight = Math.min(displayHeight, Math.round(USABLE_HEIGHT * 0.5))
          const finalWidth = cappedHeight < displayHeight
            ? Math.round((cappedHeight / imgHeight) * imgWidth)
            : displayWidth
          const captionHeight = imageItem.imageCaption ? 30 : 0
          const imageRowHeight = cappedHeight + captionHeight

          // Use float-based layout so text flows naturally around the image
          // This eliminates the white space issue from discrete beside/below splits
          const isLeftImage = imageItem.imagePosition === 'left'
          const effectiveColumns = imageItem.content.columns ?? design.defaultColumns

          // Process all content HTML with styles
          // NOTE: Do NOT use column-span on headers here - it breaks the natural column flow
          // Headers should flow with the text, not span columns
          const subheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em; color: ${design.textColor};`

          const allContentHtml = contentItems.map(item => item.html || '').join('')
          let processedHtml = allContentHtml
            .replace(/<p>/g, '<p style="margin: 0.5em 0;">')
            .replace(/<p class="/g, '<p style="margin: 0.5em 0;" class="')
            .replace(/<h2>/g, `<h2 style="${subheaderStyle}">`)
            .replace(/<h2 class="/g, `<h2 style="${subheaderStyle}" class="`)
            .replace(/<h3>/g, `<h3 style="${subheaderStyle}">`)
            .replace(/<h3 class="/g, `<h3 style="${subheaderStyle}" class="`)

          return (
            <div
              key={`image-content-${imageItem.contentId}-${groupIdx}`}
              style={{
                fontFamily: design.bodyFont,
                fontSize: '14px',
                lineHeight: 1.7,
                color: design.textColor,
                columnCount: effectiveColumns > 1 ? effectiveColumns : undefined,
                columnGap: effectiveColumns > 1 ? '24px' : undefined,
              }}
            >
              {/* Float-based layout: image floats within columns, text wraps around it */}
              <figure
                style={{
                  float: isLeftImage ? 'left' : 'right',
                  width: finalWidth,
                  margin: isLeftImage ? '12px 24px 12px 0' : '12px 0 12px 24px',
                  breakInside: 'avoid',
                }}
              >
                <img
                  src={imageItem.imageUrl}
                  alt={imageItem.imageCaption || 'Article image'}
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: cappedHeight }}
                />
                {imageItem.imageCaption && (
                  <figcaption style={{ fontSize: '11px', opacity: 0.7, marginTop: '6px', fontStyle: 'italic', textAlign: 'center' }}>
                    {imageItem.imageCaption}
                  </figcaption>
                )}
              </figure>

              {/* All content flows around the floated image in columns */}
              <div dangerouslySetInnerHTML={{ __html: processedHtml }} />

              {/* Clear the float */}
              <div style={{ clear: 'both' }} />
            </div>
          )
        } else {
          // Content group - render all paragraphs in a single columned container
          const firstItem = group.items[0]
          const effectiveColumns = firstItem.content.columns ?? design.defaultColumns
          const firstItemIdx = page.items.indexOf(firstItem)
          const isFirstContent = firstItemIdx === 0 || page.items[firstItemIdx - 1]?.contentId !== firstItem.contentId
          const effectiveDropcap = (firstItem.content.useDropcap ?? design.useDropcaps) && isFirstContent

          // Process HTML to add consistent margins matching measurement
          // Section subheaders (h2/h3) get headline font styling
          const subheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em; color: ${design.textColor};`
          const processedHtml = group.items.map(item => item.html || '').join('')
            .replace(/<p>/g, '<p style="margin: 0.5em 0;">')
            .replace(/<p class="/g, '<p style="margin: 0.5em 0;" class="')
            .replace(/<h2>/g, `<h2 style="${subheaderStyle}">`)
            .replace(/<h2 class="/g, `<h2 style="${subheaderStyle}" class="`)
            .replace(/<h3>/g, `<h3 style="${subheaderStyle}">`)
            .replace(/<h3 class="/g, `<h3 style="${subheaderStyle}" class="`)

          return (
            <div
              key={`content-group-${firstItem.contentId}-${groupIdx}`}
              className={`max-w-none ${
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
                __html: processedHtml
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

    case 'toc_content': {
      // Process HTML to add consistent margins matching measurement
      const tocSubheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em; color: ${design.textColor};`
      const tocHtml = (item.html || '')
        .replace(/<p>/g, '<p style="margin: 0.5em 0;">')
        .replace(/<p class="/g, '<p style="margin: 0.5em 0;" class="')
        .replace(/<h2>/g, `<h2 style="${tocSubheaderStyle}">`)
        .replace(/<h2 class="/g, `<h2 style="${tocSubheaderStyle}" class="`)
        .replace(/<h3>/g, `<h3 style="${tocSubheaderStyle}">`)
        .replace(/<h3 class="/g, `<h3 style="${tocSubheaderStyle}" class="`)
      return (
        <div
          className="max-w-none"
          style={{
            fontFamily: design.bodyFont,
            color: design.textColor,
            fontSize: '14px',
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: tocHtml }}
        />
      )
    }

    case 'article_header': {
      // Calculate image dimensions based on aspect ratio and position
      const imgWidth = item.content.heroImageWidth || 800
      const imgHeight = item.content.heroImageHeight || 600
      const position = item.content.heroPosition || 'top'
      const hasImage = item.content.heroImageUrl && position !== 'background'

      let displayHeight: number | undefined
      let displayWidth: number | undefined
      let floatStyle: React.CSSProperties = {}

      if (hasImage) {
        if (position === 'left' || position === 'right') {
          // Floated image - use ~40% of content width
          displayWidth = Math.round(USABLE_WIDTH * 0.4)
          displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
          floatStyle = {
            float: position,
            marginRight: position === 'left' ? 16 : 0,
            marginLeft: position === 'right' ? 16 : 0,
            marginBottom: 12,
          }
        } else {
          // Top image - full width
          displayWidth = USABLE_WIDTH
          displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
          // Cap height at 50% of usable page height for very tall images
          displayHeight = Math.min(displayHeight, Math.round(USABLE_HEIGHT * 0.5))
        }
      }

      return (
        <div className="mb-4" style={{ marginTop: isFirstOnPage ? 0 : 32 }}>
          {/* Hero Image */}
          {hasImage && (
            <div className="mb-4" style={floatStyle}>
              <div className="relative" style={{ height: displayHeight, width: displayWidth }}>
                <Image
                  src={item.content.heroImageUrl!}
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
    }

    case 'continuation':
      return (
        <p
          className="text-xs uppercase tracking-wider mb-3 opacity-50"
          style={{ fontFamily: design.bylineFont, color: design.textColor }}
        >
          {item.content.title} (continued)
        </p>
      )

    case 'article_content': {
      // Note: article_content items are grouped and rendered together in PageRenderer
      // This fallback is for any edge cases where they're rendered individually
      const contentSubheaderStyle = `font-family: ${design.headlineFont}; font-weight: 600; font-size: 16px; line-height: 1.3; margin: 1em 0 0.4em 0; text-transform: uppercase; letter-spacing: 0.05em; color: ${design.textColor};`
      const contentHtml = (item.html || '')
        .replace(/<p>/g, '<p style="margin: 0.5em 0;">')
        .replace(/<p class="/g, '<p style="margin: 0.5em 0;" class="')
        .replace(/<h2>/g, `<h2 style="${contentSubheaderStyle}">`)
        .replace(/<h2 class="/g, `<h2 style="${contentSubheaderStyle}" class="`)
        .replace(/<h3>/g, `<h3 style="${contentSubheaderStyle}">`)
        .replace(/<h3 class="/g, `<h3 style="${contentSubheaderStyle}" class="`)
      return (
        <div
          className="max-w-none"
          style={{
            fontFamily: design.bodyFont,
            fontSize: '14px',
            lineHeight: 1.7,
            color: design.textColor,
          }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )
    }

    case 'inline_image': {
      // Calculate display dimensions - use ~40% of usable width for floated image
      const imgWidth = item.imageWidth || 800
      const imgHeight = item.imageHeight || 600
      const displayWidth = Math.round(USABLE_WIDTH * 0.4)
      const displayHeight = Math.round((displayWidth / imgWidth) * imgHeight)
      // Cap height at 50% of usable page height
      const cappedHeight = Math.min(displayHeight, Math.round(USABLE_HEIGHT * 0.5))
      const finalWidth = cappedHeight < displayHeight
        ? Math.round((cappedHeight / imgHeight) * imgWidth)
        : displayWidth

      const floatDir = item.imagePosition || 'right'
      const marginStyle = floatDir === 'right'
        ? { marginLeft: 16, marginRight: 0 }
        : { marginLeft: 0, marginRight: 16 }

      return (
        <figure style={{ float: floatDir, margin: '0 0 12px 0', ...marginStyle, width: finalWidth }}>
          <div style={{ position: 'relative', height: cappedHeight, width: finalWidth }}>
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.imageCaption || 'Article image'}
                fill
                className="object-contain"
              />
            )}
          </div>
          {item.imageCaption && (
            <figcaption
              style={{
                fontFamily: design.bodyFont,
                fontSize: '11px',
                color: design.textColor,
                opacity: 0.7,
                marginTop: '6px',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              {item.imageCaption}
            </figcaption>
          )}
        </figure>
      )
    }

    default:
      return null
  }
}
