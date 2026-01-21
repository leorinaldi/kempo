#!/usr/bin/env node

/**
 * Backfill Image Styles
 *
 * One-time script to set the `style` field on existing images based on category:
 * - logo category → "logo"
 * - product category → "product"
 * - portrait/location/other → "comic_bw" (legacy comic book style)
 *
 * Usage:
 *   node scripts/backfill-image-styles.js [options]
 *
 * Options:
 *   --dry-run    Preview changes without updating database
 *
 * Environment:
 *   DATABASE_URL   PostgreSQL connection string (in web/.env.local)
 */

const fs = require('fs')
const path = require('path')

// Load environment variables from multiple .env files
function loadEnv() {
  const envFiles = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'web', '.env.local'),
    path.join(__dirname, '..', 'web', '.env'),
  ]

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=["']?(.+?)["']?$/)
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2]
        }
      })
    }
  }
}

loadEnv()

const DATABASE_URL = process.env.DATABASE_URL

/**
 * Determine style from category
 */
function getStyleFromCategory(category) {
  if (!category) return 'comic_bw'

  const cat = category.toLowerCase()
  if (cat === 'logo') return 'logo'
  if (cat === 'product') return 'product'
  return 'comic_bw'
}

/**
 * Show usage help
 */
function showHelp() {
  console.log(`
Backfill Image Styles

Sets the 'style' field on existing images based on their category.

Usage:
  node scripts/backfill-image-styles.js [options]

Options:
  --dry-run    Preview changes without updating database
  --help, -h   Show this help message

Style mappings:
  logo category     → "logo"
  product category  → "product"
  other categories  → "comic_bw" (legacy comic book style)

Environment variables:
  DATABASE_URL      PostgreSQL connection (from web/.env.local)
`)
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run')

  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL not found')
    console.error('   Add DATABASE_URL to web/.env.local')
    process.exit(1)
  }

  // Dynamic import for ES modules - import from web directory where Prisma client is generated
  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Fetching images without style set...\n')

    // Fetch all images without a style
    const images = await prisma.image.findMany({
      where: { style: null },
      select: {
        id: true,
        name: true,
        category: true,
        style: true,
      },
      orderBy: { name: 'asc' }
    })

    if (images.length === 0) {
      console.log('✅ All images already have styles set!')
      return
    }

    console.log(`Found ${images.length} images without style\n`)

    // Group by style
    const groups = {
      logo: [],
      product: [],
      comic_bw: [],
    }

    for (const image of images) {
      const style = getStyleFromCategory(image.category)
      groups[style].push(image)
    }

    // Display summary
    console.log('Style assignments:')
    console.log(`  logo:     ${groups.logo.length} images`)
    console.log(`  product:  ${groups.product.length} images`)
    console.log(`  comic_bw: ${groups.comic_bw.length} images`)
    console.log('')

    if (dryRun) {
      console.log('📋 DRY RUN - No changes will be made\n')

      // Show detailed breakdown
      for (const [style, imgs] of Object.entries(groups)) {
        if (imgs.length > 0) {
          console.log(`\n${style.toUpperCase()} (${imgs.length}):`)
          for (const img of imgs) {
            console.log(`  - ${img.name} (category: ${img.category || 'none'})`)
          }
        }
      }
    } else {
      console.log('⏳ Updating images...\n')

      let updated = 0
      for (const [style, imgs] of Object.entries(groups)) {
        for (const img of imgs) {
          await prisma.image.update({
            where: { id: img.id },
            data: { style }
          })
          updated++
          process.stdout.write(`\r   Updated ${updated}/${images.length}`)
        }
      }

      console.log('\n\n✅ Backfill complete!')
      console.log(`   Updated ${updated} images`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
