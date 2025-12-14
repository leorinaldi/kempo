#!/usr/bin/env node

/**
 * Kempopedia Image Generator
 *
 * Generates images for Kempopedia articles using the Grok API.
 *
 * Usage:
 *   node scripts/generate-image.js <slug> [prompt]
 *
 * Examples:
 *   node scripts/generate-image.js harold-kellman
 *   node scripts/generate-image.js harold-kellman "1940s presidential portrait, black and white photograph"
 *
 * If no prompt is provided, the script will read the article and generate a contextual prompt.
 */

const fs = require('fs')
const path = require('path')

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=["']?(.+?)["']?$/)
    if (match) {
      process.env[match[1]] = match[2]
    }
  })
}

const API_KEY = process.env.XAI_API_KEY
const ARTICLES_DIR = path.join(__dirname, '..', 'web', 'content', 'articles')
const MEDIA_DIR = path.join(__dirname, '..', 'web', 'public', 'media')

// Ensure media directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true })
}

/**
 * Find an article file by slug
 */
function findArticle(slug) {
  const subdirs = ['people', 'places', 'institutions', 'events', 'nations', 'concepts']

  for (const subdir of subdirs) {
    const filePath = path.join(ARTICLES_DIR, subdir, `${slug}.md`)
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  // Check root articles directory
  const rootPath = path.join(ARTICLES_DIR, `${slug}.md`)
  if (fs.existsSync(rootPath)) {
    return rootPath
  }

  return null
}

/**
 * Parse article frontmatter and content
 */
function parseArticle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return null

  const frontmatter = {}
  frontmatterMatch[1].split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*["']?(.+?)["']?$/)
    if (match) {
      frontmatter[match[1]] = match[2]
    }
  })

  // Extract first paragraph (after JSON block if present)
  const bodyContent = content.replace(/^---[\s\S]*?---/, '').replace(/```json[\s\S]*?```/, '').trim()
  const firstParagraph = bodyContent.split('\n\n')[0].replace(/\*\*/g, '').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')

  return {
    frontmatter,
    firstParagraph,
    fullContent: bodyContent
  }
}

/**
 * Generate a prompt based on article type
 */
function generatePrompt(article) {
  const { frontmatter, firstParagraph } = article
  const type = frontmatter.type || 'unknown'
  const title = frontmatter.title || 'Unknown'

  // Base style for 1940s era
  const baseStyle = "1940s style, historical, period-appropriate"

  switch (type) {
    case 'person':
      return `Professional portrait photograph from the 1940s of ${title}. ${baseStyle}, black and white photograph, formal attire, dignified pose. Based on description: ${firstParagraph.substring(0, 200)}`

    case 'place':
      return `Historical photograph of ${title} from the 1940s. ${baseStyle}, architectural photography, establishing shot. Based on description: ${firstParagraph.substring(0, 200)}`

    case 'institution':
      return `Historical photograph or emblem representing ${title}. ${baseStyle}, formal, official imagery. Based on description: ${firstParagraph.substring(0, 200)}`

    case 'event':
      return `Historical photograph depicting ${title}. ${baseStyle}, documentary photography, photojournalism style. Based on description: ${firstParagraph.substring(0, 200)}`

    case 'nation':
      return `Historical map or national imagery of ${title} from the 1940s. ${baseStyle}, cartographic or patriotic imagery.`

    default:
      return `Historical illustration or photograph representing ${title}. ${baseStyle}. Based on description: ${firstParagraph.substring(0, 200)}`
  }
}

/**
 * Call the Grok API to generate an image
 */
async function generateImage(prompt) {
  console.log('\n📝 Prompt:', prompt.substring(0, 100) + '...\n')
  console.log('🎨 Generating image with Grok API...')

  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'grok-2-image',
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
 * Download image from URL and save to file
 */
async function downloadImage(url, outputPath) {
  console.log('⬇️  Downloading image...')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)

  console.log(`✅ Saved to: ${outputPath}`)
  return outputPath
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
Kempopedia Image Generator

Usage:
  node scripts/generate-image.js <slug> [prompt]

Examples:
  node scripts/generate-image.js harold-kellman
  node scripts/generate-image.js harold-kellman "1940s presidential portrait, black and white"

Options:
  slug    The article slug (e.g., "harold-kellman")
  prompt  Optional custom prompt. If omitted, generates based on article content.
`)
    process.exit(0)
  }

  if (!API_KEY) {
    console.error('❌ Error: XAI_API_KEY not found in .env file')
    process.exit(1)
  }

  const slug = args[0]
  let prompt = args.slice(1).join(' ')

  console.log(`\n🔍 Processing article: ${slug}`)

  // Find and parse article if no custom prompt
  if (!prompt) {
    const articlePath = findArticle(slug)
    if (!articlePath) {
      console.error(`❌ Error: Article not found for slug "${slug}"`)
      console.log('   Provide a custom prompt instead, or check the slug.')
      process.exit(1)
    }

    console.log(`📄 Found article: ${articlePath}`)

    const article = parseArticle(articlePath)
    if (!article) {
      console.error('❌ Error: Could not parse article')
      process.exit(1)
    }

    prompt = generatePrompt(article)
  }

  try {
    // Generate image
    const imageUrl = await generateImage(prompt)
    console.log('🖼️  Image generated!')

    // Download and save
    const outputPath = path.join(MEDIA_DIR, `${slug}.jpg`)
    await downloadImage(imageUrl, outputPath)

    // Show how to use in article
    console.log(`
📋 To use this image in the article, update the infobox:

"image": {
  "url": "/media/${slug}.jpg",
  "caption": "Description of the image"
}
`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
