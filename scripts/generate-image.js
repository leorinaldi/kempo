#!/usr/bin/env node

/**
 * Kempopedia Image Generator
 *
 * Generates images using the Grok API and uploads to Vercel Blob.
 *
 * Usage:
 *   node scripts/generate-image.js "<prompt>" [options]
 *
 * Options:
 *   --name "Image name"      Name for the image (required)
 *   --caption "Caption"      Image caption/description
 *   --category "portrait"    Category (portrait, location, product, logo, etc.)
 *   --article-id "abc123"    Link to article ID
 *
 * Examples:
 *   node scripts/generate-image.js "1940s presidential portrait, black and white" --name "Harold Kellman"
 *   node scripts/generate-image.js "Comic book style Western town" --name "Abilene Main Street" --category "location"
 *
 * Environment:
 *   XAI_API_KEY              Grok API key (in .env)
 *   DATABASE_URL             PostgreSQL connection string (in web/.env.local)
 *   BLOB_READ_WRITE_TOKEN    Vercel Blob token (in web/.env.local)
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

const XAI_API_KEY = process.env.XAI_API_KEY
const DATABASE_URL = process.env.DATABASE_URL
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = {
    prompt: null,
    name: null,
    caption: null,
    category: null,
    articleId: null,
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--name' && args[i + 1]) {
      result.name = args[++i]
    } else if (arg === '--caption' && args[i + 1]) {
      result.caption = args[++i]
    } else if (arg === '--category' && args[i + 1]) {
      result.category = args[++i]
    } else if (arg === '--article-id' && args[i + 1]) {
      result.articleId = args[++i]
    } else if (!arg.startsWith('--') && !result.prompt) {
      result.prompt = arg
    }
    i++
  }

  return result
}

/**
 * Call the Grok API to generate an image
 */
async function generateImage(prompt) {
  console.log('\n📝 Prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''))
  console.log('\n🎨 Generating image with Grok API...')

  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'grok-2-image-1212',
      prompt: prompt,
      n: 1,
      response_format: 'url'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('Invalid API response: no image URL returned')
  }

  return data.data[0].url
}

/**
 * Download image from URL and return as buffer
 */
async function downloadImage(url) {
  console.log('⬇️  Downloading generated image...')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return buffer
}

/**
 * Get shape from dimensions
 */
function getShapeFromDimensions(width, height) {
  if (!width || !height) return null
  const ratio = width / height
  if (ratio > 1.2) return "landscape"
  if (ratio < 0.8) return "portrait"
  return "square"
}

/**
 * Upload to Vercel Blob and create database record
 */
async function uploadToBlob(imageBuffer, options) {
  console.log('☁️  Uploading to Vercel Blob...')

  // Dynamic import for ES modules
  const { put } = await import('@vercel/blob')
  const { PrismaClient } = await import('@prisma/client')

  const prisma = new PrismaClient()

  try {
    // Create database entry first to get the ID
    const image = await prisma.image.create({
      data: {
        name: options.name,
        url: "", // Temporary, will be updated after blob upload
        description: options.caption || null,
        altText: options.caption || null,
        category: options.category || null,
        articleId: options.articleId || null,
      },
    })

    // Upload to Vercel Blob using ID-based path
    const blob = await put(
      `kempo-media/image/${image.id}.jpg`,
      imageBuffer,
      {
        access: "public",
        token: BLOB_READ_WRITE_TOKEN,
      }
    )

    // Update database with the blob URL
    await prisma.image.update({
      where: { id: image.id },
      data: { url: blob.url },
    })

    console.log('✅ Uploaded successfully!')
    console.log(`   ID: ${image.id}`)
    console.log(`   URL: ${blob.url}`)

    return {
      id: image.id,
      url: blob.url,
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Show usage help
 */
function showHelp() {
  console.log(`
Kempopedia Image Generator

Usage:
  node scripts/generate-image.js "<prompt>" --name "Image Name" [options]

Arguments:
  prompt              The image generation prompt (required)

Options:
  --name "Name"       Name for the image (required)
  --caption "Text"    Image caption/description
  --category "type"   Category: portrait, location, product, logo, etc.
  --article-id "id"   Link to an article ID

Examples:
  node scripts/generate-image.js "1940s presidential portrait, black and white. Comic book style drawing." --name "Harold Kellman"

  node scripts/generate-image.js "Comic book illustration of a Western town main street, 1940s" --name "Abilene" --category "location"

Environment variables (from .env files):
  XAI_API_KEY           Grok API key
  DATABASE_URL          PostgreSQL connection
  BLOB_READ_WRITE_TOKEN Vercel Blob token
`)
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  // Check required environment variables
  if (!XAI_API_KEY) {
    console.error('❌ Error: XAI_API_KEY not found')
    console.error('   Add XAI_API_KEY to .env file in project root')
    process.exit(1)
  }

  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL not found')
    console.error('   Add DATABASE_URL to web/.env.local')
    process.exit(1)
  }

  if (!BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found')
    console.error('   Add BLOB_READ_WRITE_TOKEN to web/.env.local')
    process.exit(1)
  }

  const options = parseArgs(args)

  if (!options.prompt) {
    console.error('❌ Error: No prompt provided')
    console.error('   Usage: node scripts/generate-image.js "<prompt>" --name "Name"')
    process.exit(1)
  }

  if (!options.name) {
    console.error('❌ Error: --name is required')
    console.error('   Usage: node scripts/generate-image.js "<prompt>" --name "Name"')
    process.exit(1)
  }

  try {
    // Generate image
    const imageUrl = await generateImage(options.prompt)
    console.log('🖼️  Image generated!')

    // Download image
    const imageBuffer = await downloadImage(imageUrl)

    // Upload to blob and create database record
    const result = await uploadToBlob(imageBuffer, options)

    // Show usage instructions
    console.log(`
📋 To use in an article infobox:

"image": {
  "url": "${result.url}",
  "caption": "${options.caption || options.name}"
}

🔗 Admin: /admin/world-data/image/manage (to edit or link to subjects)
`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
