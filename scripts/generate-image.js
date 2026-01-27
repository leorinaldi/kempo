#!/usr/bin/env node

/**
 * Kempopedia Image Generator
 *
 * Generates images using Grok or Gemini API and uploads to Vercel Blob.
 * Saves prompt, generation tool, and style metadata for tracking.
 *
 * Usage:
 *   node scripts/generate-image.js "<prompt>" [options]
 *
 * Options:
 *   --name "Image name"      Name for the image (required)
 *   --description "Desc"     Human-readable description/caption for the image
 *   --caption "Caption"      Alias for --description
 *   --category "portrait"    Category (portrait, location, product, logo, etc.)
 *   --purpose "profile"      Purpose: profile, action, event, scene
 *   --style "realistic"      Style (realistic, comic_bw, logo, product) - default: realistic
 *   --tool "grok"            Generation tool: grok (default) or gemini
 *   --article-id "abc123"    Link to article ID
 *   --reference "url"        Reference image URL for character consistency (Gemini only)
 *   --ky-date "YYYY-MM-DD"   Set kyDate for temporal filtering (e.g., "1950-06-15")
 *
 * Entity Linking:
 *   --person-id "abc123"     Link image to a Person (creates ImageSubject)
 *   --org-id "abc123"        Link image to an Organization
 *   --place-id "abc123"      Link image to a Place
 *   --is-reference           Mark this image as the canonical likeness for character consistency
 *   --from-person "abc123"   Look up person's reference image and use it for character consistency
 *
 * Examples:
 *   node scripts/generate-image.js "Photorealistic portrait of a 50-year-old man, 1940s" --name "Harold Kellman" --person-id "abc123" --is-reference
 *   node scripts/generate-image.js "Photorealistic Western town main street, 1940s" --name "Abilene" --category "location" --tool gemini
 *   node scripts/generate-image.js "Clay Marshall giving a speech" --name "Marshall Speech" --from-person "abc123" --purpose "action"
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
    prompt: null,
    name: null,
    description: null,
    category: null,
    purpose: null,
    articleId: null,
    style: 'realistic', // Default to realistic for new images
    tool: 'grok', // Default to grok
    reference: null, // Reference image URL for character consistency
    // Entity linking
    personId: null,
    orgId: null,
    placeId: null,
    isReference: false,
    fromPersons: [], // Person IDs to look up reference images from (supports multiple)
    kyDate: null, // Kempo world date for temporal filtering
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--name' && args[i + 1]) {
      result.name = args[++i]
    } else if ((arg === '--description' || arg === '--caption') && args[i + 1]) {
      result.description = args[++i]
    } else if (arg === '--category' && args[i + 1]) {
      result.category = args[++i]
    } else if (arg === '--purpose' && args[i + 1]) {
      result.purpose = args[++i]
    } else if (arg === '--article-id' && args[i + 1]) {
      result.articleId = args[++i]
    } else if (arg === '--style' && args[i + 1]) {
      result.style = args[++i]
    } else if (arg === '--tool' && args[i + 1]) {
      result.tool = args[++i].toLowerCase()
    } else if (arg === '--reference' && args[i + 1]) {
      result.reference = args[++i]
    } else if (arg === '--person-id' && args[i + 1]) {
      result.personId = args[++i]
    } else if (arg === '--org-id' && args[i + 1]) {
      result.orgId = args[++i]
    } else if (arg === '--place-id' && args[i + 1]) {
      result.placeId = args[++i]
    } else if (arg === '--is-reference') {
      result.isReference = true
    } else if (arg === '--from-person' && args[i + 1]) {
      result.fromPersons.push(args[++i])
    } else if (arg === '--ky-date' && args[i + 1]) {
      result.kyDate = args[++i]
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
 * Fetch an image from URL and return as base64
 */
async function fetchImageAsBase64(url) {
  console.log('📥 Fetching reference image...')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const base64 = buffer.toString('base64')

  // Determine mime type from URL or content-type header
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const mimeType = contentType.split(';')[0].trim()

  return { base64, mimeType }
}

/**
 * Call the Google Gemini API to generate an image
 * Uses gemini-3-pro-image-preview for reference images (character consistency)
 * Uses gemini-2.0-flash-exp for standard generation
 * @param {string} prompt - The image generation prompt
 * @param {string[]} referenceImageUrls - Array of reference image URLs for character consistency
 */
async function generateImageWithGemini(prompt, referenceImageUrls = []) {
  // Use the pro model for reference images, flash for standard generation
  const model = referenceImageUrls.length > 0 ? 'gemini-3-pro-image-preview' : 'gemini-2.0-flash-exp'

  console.log(`\n🎨 Generating image with Gemini API (${model})...`)
  if (referenceImageUrls.length > 0) {
    console.log(`📎 Using ${referenceImageUrls.length} reference image(s) for character consistency`)
  }

  // Build the parts array - text prompt first, then reference images
  const parts = [{ text: prompt }]

  // Add all reference images to parts array
  for (const url of referenceImageUrls) {
    const refImage = await fetchImageAsBase64(url)
    parts.push({
      inlineData: {
        mimeType: refImage.mimeType,
        data: refImage.base64
      }
    })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts }],
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
        // Return base64 data directly
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          tool: model
        }
      }
    }
  }

  throw new Error('Invalid Gemini API response: no image data returned')
}

/**
 * Generate image using specified tool
 * @param {string} prompt - The image generation prompt
 * @param {string} tool - Generation tool: 'grok' or 'gemini'
 * @param {string[]} referenceUrls - Array of reference image URLs for character consistency
 */
async function generateImage(prompt, tool, referenceUrls = []) {
  console.log('\n📝 Prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''))

  if (referenceUrls.length > 0 && tool !== 'gemini') {
    console.log('⚠️  Reference images only supported with Gemini, switching to gemini tool')
    tool = 'gemini'
  }

  if (tool === 'gemini') {
    return generateImageWithGemini(prompt, referenceUrls)
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
 * Look up a person's reference image URL
 */
async function getPersonReferenceImage(personId) {
  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')
  const prisma = new PrismaClient()

  try {
    // Find the reference image for this person
    const imageSubject = await prisma.imageSubject.findFirst({
      where: {
        itemId: personId,
        itemType: 'person',
        isReference: true,
      },
      include: {
        image: true,
      },
    })

    if (imageSubject?.image?.url) {
      console.log(`📎 Found reference image for person: ${imageSubject.image.name}`)
      return imageSubject.image.url
    }

    // If no reference image, try to find any image for this person
    const anyImage = await prisma.imageSubject.findFirst({
      where: {
        itemId: personId,
        itemType: 'person',
      },
      include: {
        image: true,
      },
      orderBy: {
        createdAt: 'asc', // Oldest first (likely the original profile)
      },
    })

    if (anyImage?.image?.url) {
      console.log(`📎 Using earliest image for person (no reference marked): ${anyImage.image.name}`)
      return anyImage.image.url
    }

    console.log(`⚠️  No existing images found for person ${personId}`)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Get reference images for multiple persons
 * @param {string[]} personIds - Array of person IDs
 * @returns {Promise<{personId: string, url: string}[]>} Array of person IDs with their reference URLs
 */
async function getMultiplePersonReferenceImages(personIds) {
  const referenceUrls = []
  for (const personId of personIds) {
    const url = await getPersonReferenceImage(personId)
    if (url) {
      referenceUrls.push({ personId, url })
    }
  }
  return referenceUrls
}

/**
 * Create ImageSubject links for the generated image
 */
async function createImageSubjects(prisma, imageId, options) {
  const subjects = []

  if (options.personId) {
    // Auto-set isReference for profile images
    const isRef = options.isReference || options.purpose === 'profile'
    subjects.push({
      imageId,
      itemId: options.personId,
      itemType: 'person',
      isReference: isRef,
    })
  }

  if (options.orgId) {
    subjects.push({
      imageId,
      itemId: options.orgId,
      itemType: 'organization',
      isReference: false,
    })
  }

  if (options.placeId) {
    subjects.push({
      imageId,
      itemId: options.placeId,
      itemType: 'place',
      isReference: false,
    })
  }

  // If --from-person was used, also link to those persons
  if (options.fromPersons && options.fromPersons.length > 0) {
    for (const fromPersonId of options.fromPersons) {
      if (fromPersonId !== options.personId) {
        subjects.push({
          imageId,
          itemId: fromPersonId,
          itemType: 'person',
          isReference: false,
        })
      }
    }
  }

  for (const subject of subjects) {
    await prisma.imageSubject.create({ data: subject })
    console.log(`   🔗 Linked to ${subject.itemType}: ${subject.itemId}${subject.isReference ? ' (reference)' : ''}`)
  }
}

/**
 * Upload to Vercel Blob and create database record
 */
async function uploadToBlob(imageBuffer, options) {
  console.log('☁️  Uploading to Vercel Blob...')

  // Dynamic import for ES modules - import from web directory
  const { put } = await import('../web/node_modules/@vercel/blob/dist/index.js')
  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')

  const prisma = new PrismaClient()

  try {
    // Parse kyDate if provided
    let kyDateValue = null
    if (options.kyDate) {
      kyDateValue = new Date(options.kyDate)
      if (isNaN(kyDateValue.getTime())) {
        console.error(`⚠️  Warning: Invalid --ky-date "${options.kyDate}", ignoring`)
        kyDateValue = null
      }
    }

    // Create database entry first to get the ID
    const image = await prisma.image.create({
      data: {
        name: options.name,
        url: "", // Temporary, will be updated after blob upload
        description: options.description || null,
        altText: options.description || options.name,
        category: options.category || null,
        purpose: options.purpose || null,
        articleId: options.articleId || null,
        prompt: options.prompt || null,
        generationTool: options.generationTool || 'grok-2-image-1212',
        style: options.style || 'realistic',
        kyDate: kyDateValue,
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
    if (kyDateValue) {
      console.log(`   kyDate: ${kyDateValue.toISOString().split('T')[0]}`)
    }

    // Create ImageSubject links if any entity IDs were provided
    if (options.personId || options.orgId || options.placeId || (options.fromPersons && options.fromPersons.length > 0)) {
      await createImageSubjects(prisma, image.id, options)
    }

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
  prompt                The image generation prompt (required)

Options:
  --name "Name"         Name for the image (required)
  --description "Text"  Human-readable description/caption for the image
  --caption "Text"      Alias for --description
  --category "type"     Category: portrait, location, product, logo, etc.
  --purpose "type"      Purpose: profile, action, event, scene
  --style "style"       Style: realistic (default), comic_bw, logo, product
  --tool "grok"         Generation tool: grok (default) or gemini
  --article-id "id"     Link to an article ID
  --reference "url"     Reference image URL for character consistency (Gemini only)
  --ky-date "YYYY-MM-DD" Set kyDate for temporal filtering (e.g., "1950-06-15")

Entity Linking:
  --person-id "id"      Link image to a Person (creates ImageSubject record)
  --org-id "id"         Link image to an Organization
  --place-id "id"       Link image to a Place
  --is-reference        Mark this image as the canonical likeness for the person
  --from-person "id"    Look up person's reference image and use for consistency
                        (can be specified multiple times for multi-person images)

Tools:
  grok                  Grok API (grok-2-image-1212) - default
  gemini                Google Gemini API (gemini-2.0-flash-exp or gemini-3-pro-image-preview with --reference)

Purposes:
  profile               Standard portrait/headshot for infobox (auto-sets isReference)
  action                Person doing something (speaking, performing, etc.)
  event                 Image from a specific event
  scene                 Scene or location shot

Styles:
  realistic             Photorealistic images (default for new images)
  comic_bw              Black and white comic book style (legacy)
  logo                  Flags, emblems, logos
  product               Consumer goods, vehicles

Character Consistency:
  Option 1: --reference "url"
    Pass a reference image URL directly. Uses Gemini 3 Pro model.

  Option 2: --from-person "id"
    Look up the person's reference image automatically. If the person has
    an image marked as isReference=true, that image is used. Otherwise,
    their earliest image is used. Auto-switches to Gemini.

  Multi-person images:
    Use multiple --from-person flags to include multiple character references:
    --from-person "person1-id" --from-person "person2-id"
    All referenced persons are auto-linked via ImageSubject.

Examples:
  # Basic portrait with entity linking
  node scripts/generate-image.js "Photorealistic portrait of a 50-year-old man" \\
    --name "Harold Kellman" --person-id "abc123" --purpose "profile" --is-reference

  # Action shot with character consistency from existing person
  node scripts/generate-image.js "Clay Marshall giving a speech at a podium, 1950s" \\
    --name "Marshall Speech" --from-person "abc123" --purpose "action"

  # Location image
  node scripts/generate-image.js "Western town main street, 1940s" \\
    --name "Abilene" --category "location" --place-id "xyz789" --tool gemini

  # Direct reference URL
  node scripts/generate-image.js "General Westbrook in military uniform" \\
    --name "Westbrook Portrait" --reference "https://..." --tool gemini

  # Multi-person image with character consistency for both people
  node scripts/generate-image.js "Two men in suits at a theater, 1950s, black and white" \\
    --name "Goodwin and Langford at Theater" \\
    --from-person "GOODWIN_ID" --from-person "LANGFORD_ID" \\
    --purpose "action" --description "Jerome Goodwin and Howard Langford, 1950"

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
    // Collect all reference URLs
    let referenceUrls = []

    // Handle --from-person flags: look up reference images from persons
    if (options.fromPersons.length > 0) {
      const refs = await getMultiplePersonReferenceImages(options.fromPersons)
      referenceUrls = refs.map(r => r.url)

      if (referenceUrls.length > 0) {
        // Auto-switch to gemini for character consistency
        if (options.tool !== 'gemini') {
          console.log('⚙️  Switching to Gemini for character consistency')
          options.tool = 'gemini'
        }
      }

      // Auto-set personId to first person if not already set
      if (!options.personId && options.fromPersons.length > 0) {
        options.personId = options.fromPersons[0]
      }
    }

    // Also support direct --reference URL (maintain backwards compatibility)
    if (options.reference) {
      referenceUrls.push(options.reference)
    }

    // Generate image
    const genResult = await generateImage(options.prompt, options.tool, referenceUrls)
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

    // Upload to blob and create database record (include prompt and tool for metadata)
    const result = await uploadToBlob(imageBuffer, {
      ...options,
      prompt: options.prompt,
      generationTool: genResult.tool
    })

    // Show usage instructions
    console.log(`
📋 To use in an article infobox:

"image": {
  "url": "${result.url}",
  "caption": "${options.description || options.name}"
}

🔗 Admin: /admin/world-data/image/manage (to edit or link to subjects)
${options.personId || options.fromPersons.length > 0 ? `
💡 For character consistency in future images:
   node scripts/generate-image.js "<prompt>" --from-person "${options.personId || options.fromPersons[0]}" --name "..."
` : ''}`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
