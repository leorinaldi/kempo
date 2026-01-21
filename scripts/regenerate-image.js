#!/usr/bin/env node

/**
 * Kempopedia Image Regenerator
 *
 * Regenerates an existing image with a new prompt and style.
 * Creates a new Image record with version history linking to the original.
 *
 * Usage:
 *   node scripts/regenerate-image.js <image-id> [options]
 *
 * Options:
 *   --prompt "New prompt"     Override the prompt (otherwise uses original)
 *   --style "realistic"       Style (realistic, comic_bw, logo, product)
 *   --tool "grok"             Generation tool: grok (default) or gemini
 *   --update-refs             Update article references to use new image
 *
 * Examples:
 *   node scripts/regenerate-image.js cm123abc --style realistic
 *   node scripts/regenerate-image.js cm123abc --prompt "Photorealistic portrait..." --update-refs
 *   node scripts/regenerate-image.js cm123abc --tool gemini --update-refs
 *
 * Environment:
 *   XAI_API_KEY              Grok API key (in .env)
 *   GEMINI_API_KEY           Google Gemini API key (in .env)
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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const DATABASE_URL = process.env.DATABASE_URL
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = {
    imageId: null,
    prompt: null,
    style: 'realistic',
    tool: 'grok',
    updateRefs: false,
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--prompt' && args[i + 1]) {
      result.prompt = args[++i]
    } else if (arg === '--style' && args[i + 1]) {
      result.style = args[++i]
    } else if (arg === '--tool' && args[i + 1]) {
      result.tool = args[++i].toLowerCase()
    } else if (arg === '--update-refs') {
      result.updateRefs = true
    } else if (!arg.startsWith('--') && !result.imageId) {
      result.imageId = arg
    }
    i++
  }

  return result
}

/**
 * Call the Grok API to generate an image
 */
async function generateImageWithGrok(prompt) {
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
    throw new Error(`Grok API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('Invalid Grok API response: no image URL returned')
  }

  return { url: data.data[0].url, tool: 'grok-2-image-1212' }
}

/**
 * Call the Google Gemini API to generate an image
 */
async function generateImageWithGemini(prompt) {
  console.log('\n🎨 Generating image with Gemini API...')

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  // Find the image part in the response
  const candidates = data.candidates || []
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || []
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          tool: 'gemini-2.0-flash-exp'
        }
      }
    }
  }

  throw new Error('Invalid Gemini API response: no image data returned')
}

/**
 * Generate image using specified tool
 */
async function generateImage(prompt, tool) {
  console.log('\n📝 Prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''))

  if (tool === 'gemini') {
    return generateImageWithGemini(prompt)
  } else {
    return generateImageWithGrok(prompt)
  }
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
 * Convert base64 to buffer
 */
function base64ToBuffer(base64Data) {
  console.log('📦 Processing base64 image data...')
  return Buffer.from(base64Data, 'base64')
}

/**
 * Show usage help
 */
function showHelp() {
  console.log(`
Kempopedia Image Regenerator

Usage:
  node scripts/regenerate-image.js <image-id> [options]

Arguments:
  image-id            The ID of the existing image to regenerate (required)

Options:
  --prompt "Prompt"   Override the generation prompt (default: use original)
  --style "style"     Style: realistic (default), comic_bw, logo, product
  --tool "grok"       Generation tool: grok (default) or gemini
  --update-refs       Update article references to point to new image

Tools:
  grok                Grok API (grok-2-image-1212) - default
  gemini              Google Gemini API (gemini-2.0-flash-exp)

Examples:
  # Regenerate with default realistic style
  node scripts/regenerate-image.js cm123abc

  # Regenerate with a new prompt
  node scripts/regenerate-image.js cm123abc --prompt "Photorealistic portrait of a 50-year-old man..."

  # Regenerate using Gemini and update all references
  node scripts/regenerate-image.js cm123abc --tool gemini --update-refs

Notes:
  - Creates a NEW image record; original is preserved
  - New image has previousVersionId pointing to original
  - Use --update-refs to automatically update article infoboxes

Environment variables (from .env files):
  XAI_API_KEY           Grok API key
  GEMINI_API_KEY        Google Gemini API key
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

  const options = parseArgs(args)

  // Validate tool selection
  if (!['grok', 'gemini'].includes(options.tool)) {
    console.error(`❌ Error: Invalid tool "${options.tool}"`)
    console.error('   Valid tools: grok, gemini')
    process.exit(1)
  }

  // Check required environment variables
  if (options.tool === 'grok' && !XAI_API_KEY) {
    console.error('❌ Error: XAI_API_KEY not found')
    console.error('   Add XAI_API_KEY to .env file in project root')
    process.exit(1)
  }

  if (options.tool === 'gemini' && !GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found')
    console.error('   Add GEMINI_API_KEY to .env file in project root')
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

  if (!options.imageId) {
    console.error('❌ Error: No image ID provided')
    console.error('   Usage: node scripts/regenerate-image.js <image-id> [options]')
    process.exit(1)
  }

  // Dynamic import for ES modules - import from web directory
  const { put } = await import('../web/node_modules/@vercel/blob/dist/index.js')
  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')

  const prisma = new PrismaClient()

  try {
    // Fetch original image
    console.log(`🔍 Fetching original image: ${options.imageId}`)
    const original = await prisma.image.findUnique({
      where: { id: options.imageId }
    })

    if (!original) {
      console.error(`❌ Error: Image not found with ID: ${options.imageId}`)
      process.exit(1)
    }

    console.log(`   Found: ${original.name}`)
    console.log(`   Category: ${original.category || 'none'}`)
    console.log(`   Original style: ${original.style || 'unknown'}`)

    // Determine prompt to use
    const prompt = options.prompt || original.prompt
    if (!prompt) {
      console.error('❌ Error: No prompt available')
      console.error('   Original image has no stored prompt.')
      console.error('   Please provide a prompt with --prompt "..."')
      process.exit(1)
    }

    // Generate new image
    const genResult = await generateImage(prompt, options.tool)
    console.log('🖼️  Image generated!')

    // Get image buffer (from URL or base64)
    let imageBuffer
    if (genResult.url) {
      imageBuffer = await downloadImage(genResult.url)
    } else if (genResult.base64) {
      imageBuffer = base64ToBuffer(genResult.base64)
    } else {
      throw new Error('No image data in generation result')
    }

    // Upload to Vercel Blob
    console.log('☁️  Uploading to Vercel Blob...')

    // Create new database entry with version link
    const newImage = await prisma.image.create({
      data: {
        name: original.name,
        url: "", // Temporary
        description: original.description,
        altText: original.altText,
        category: original.category,
        articleId: options.updateRefs ? original.articleId : null,
        kyDate: original.kyDate,
        prompt: prompt,
        generationTool: genResult.tool,
        style: options.style,
        previousVersionId: original.id,
      },
    })

    // Upload to Vercel Blob
    const blob = await put(
      `kempo-media/image/${newImage.id}.jpg`,
      imageBuffer,
      {
        access: "public",
        token: BLOB_READ_WRITE_TOKEN,
      }
    )

    // Update with blob URL
    await prisma.image.update({
      where: { id: newImage.id },
      data: { url: blob.url },
    })

    console.log('✅ New image created!')
    console.log(`   ID: ${newImage.id}`)
    console.log(`   URL: ${blob.url}`)
    console.log(`   Previous version: ${original.id}`)

    // Update references if requested
    if (options.updateRefs) {
      console.log('\n🔗 Updating references...')

      // Update article infobox if original had an article
      if (original.articleId) {
        const article = await prisma.article.findUnique({
          where: { id: original.articleId }
        })

        if (article && article.infobox) {
          const infobox = article.infobox
          let updated = false

          // Check if infobox has an image field with the old URL
          if (infobox.image && infobox.image.url === original.url) {
            infobox.image.url = blob.url
            updated = true
          }

          if (updated) {
            await prisma.article.update({
              where: { id: original.articleId },
              data: { infobox }
            })
            console.log(`   Updated article: ${article.title}`)
          }
        }

        // Clear articleId from original if we're taking over
        await prisma.image.update({
          where: { id: original.id },
          data: { articleId: null }
        })
      }

      // Copy image subjects to new image
      const subjects = await prisma.imageSubject.findMany({
        where: { imageId: original.id }
      })

      for (const subject of subjects) {
        await prisma.imageSubject.create({
          data: {
            imageId: newImage.id,
            itemId: subject.itemId,
            itemType: subject.itemType,
          }
        })
      }

      if (subjects.length > 0) {
        console.log(`   Copied ${subjects.length} subject link(s)`)
      }
    }

    console.log(`
📋 To use in an article infobox:

"image": {
  "url": "${blob.url}",
  "caption": "${original.description || original.name}"
}

🔗 Admin: /admin/world-data/image/manage (to view version history)
`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
