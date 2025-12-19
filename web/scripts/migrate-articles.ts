import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const articlesDirectory = path.join(process.cwd(), 'content', 'articles')

interface ArticleFrontmatter {
  title: string
  slug: string
  type: string
  subtype?: string
  status: string
  parallel_switchover?: {
    real_world: string
    wikipedia: string
  }
  tags?: string[]
  dates?: string[]
}

interface ParsedArticle {
  slug: string
  frontmatter: ArticleFrontmatter
  content: string // markdown without JSON block
  infobox?: Record<string, unknown>
  timelineEvents?: Array<{ date: string; headline: string; description: string }>
  mediaRefs?: Array<{ type: string; url: string; title?: string }>
}

// Recursively get all markdown files
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
  } catch (e) {
    console.error(`Error reading directory ${dir}:`, e)
  }
  return fileList
}

// Parse a single markdown file
function parseArticleFile(filePath: string): ParsedArticle | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    const frontmatter = data as ArticleFrontmatter
    const slug = path.basename(filePath, '.md')

    // Extract JSON block from content
    let cleanContent = content
    let infobox: Record<string, unknown> | undefined
    let timelineEvents: Array<{ date: string; headline: string; description: string }> | undefined
    let mediaRefs: Array<{ type: string; url: string; title?: string }> | undefined

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1])
        infobox = jsonData.infobox
        timelineEvents = jsonData.timeline_events
        mediaRefs = jsonData.media
      } catch (e) {
        console.warn(`  Warning: Invalid JSON in ${slug}`)
      }
      // Remove JSON block from content
      cleanContent = content.replace(/```json\n[\s\S]*?\n```\n?/, '').trim()
    }

    return {
      slug,
      frontmatter,
      content: cleanContent,
      infobox,
      timelineEvents,
      mediaRefs,
    }
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e)
    return null
  }
}

async function migrateArticles() {
  console.log('Starting article migration...\n')

  // Get all markdown files
  const files = getAllMarkdownFiles(articlesDirectory)
  console.log(`Found ${files.length} markdown files\n`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const parsed = parseArticleFile(file)

    if (!parsed || !parsed.frontmatter.title) {
      console.log(`  Skipping ${path.basename(file)} (no title)`)
      skipped++
      continue
    }

    const { slug, frontmatter, content, infobox, timelineEvents, mediaRefs } = parsed

    try {
      // Check if article already exists
      const existing = await prisma.article.findUnique({
        where: { slug }
      })

      if (existing) {
        console.log(`  Skipping ${slug} (already exists)`)
        skipped++
        continue
      }

      // Ensure tags are all strings (some articles have year numbers as tags)
      const tags = (frontmatter.tags || []).map(t => String(t))
      const dates = (frontmatter.dates || []).map(d => String(d))

      // Create the article
      const article = await prisma.article.create({
        data: {
          slug,
          title: frontmatter.title,
          type: frontmatter.type || 'unknown',
          subtype: frontmatter.subtype,
          status: frontmatter.status || 'published',
          content,
          infobox: infobox || undefined,
          timelineEvents: timelineEvents || undefined,
          mediaRefs: mediaRefs || undefined,
          parallelSwitchover: frontmatter.parallel_switchover || undefined,
          tags,
          dates,
        }
      })

      // Create initial revision
      await prisma.revision.create({
        data: {
          articleId: article.id,
          title: frontmatter.title,
          content,
          infobox: infobox || undefined,
          timelineEvents: timelineEvents || undefined,
          editSummary: 'Initial migration from markdown files',
          kempoDate: 'January 1, 1950 k.y.',
        }
      })

      console.log(`  Migrated: ${slug}`)
      migrated++

    } catch (e) {
      console.error(`  Error migrating ${slug}:`, e)
      errors++
    }
  }

  console.log('\n--- Migration Summary ---')
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)
  console.log(`  Total:    ${files.length}`)
}

// Run migration
migrateArticles()
  .then(() => {
    console.log('\nMigration complete!')
    process.exit(0)
  })
  .catch((e) => {
    console.error('\nMigration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
