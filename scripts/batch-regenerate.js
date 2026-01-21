#!/usr/bin/env node

/**
 * Batch Image Regeneration Script
 *
 * Regenerates all comic_bw images to realistic style.
 * Looks up article info to generate appropriate prompts.
 *
 * Usage:
 *   node scripts/batch-regenerate.js [options]
 *
 * Options:
 *   --category <type>   Only process this category (portrait, location, etc.)
 *   --limit <n>         Process only n images
 *   --dry-run           Show what would be done without making changes
 *   --start <id>        Start from this image ID (for resuming)
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
function loadEnv() {
  const envFiles = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'web', '.env.local'),
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
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const result = {
    category: null,
    limit: null,
    dryRun: false,
    startId: null,
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) result.category = args[++i]
    else if (args[i] === '--limit' && args[i + 1]) result.limit = parseInt(args[++i])
    else if (args[i] === '--dry-run') result.dryRun = true
    else if (args[i] === '--start' && args[i + 1]) result.startId = args[++i]
  }

  return result
}

// Generate prompt for a portrait based on article info
function generatePortraitPrompt(name, article, person) {
  const infobox = article?.infobox?.fields || {}

  // Calculate age
  let age = 'middle-aged'
  if (person?.dateBorn) {
    const birthYear = new Date(person.dateBorn).getFullYear()
    const imageYear = 1948 // Default era
    const calculatedAge = imageYear - birthYear
    if (calculatedAge < 30) age = `${calculatedAge}-year-old`
    else if (calculatedAge < 45) age = `${calculatedAge}-year-old`
    else if (calculatedAge < 60) age = `${calculatedAge}-year-old`
    else age = `${calculatedAge}-year-old`
  }

  // Determine gender
  const gender = person?.gender === 'female' ? 'woman' : 'man'

  // Get occupation/role
  let occupation = infobox.Occupation || infobox.Known_for || ''
  if (Array.isArray(occupation)) occupation = occupation[0]
  occupation = occupation?.replace(/\[\[|\]\]/g, '') || ''

  // Build description based on occupation
  let roleDescription = ''
  let attire = ''

  const occLower = (occupation + ' ' + name).toLowerCase()

  if (occLower.includes('president') || occLower.includes('senator') || occLower.includes('governor') || occLower.includes('politician')) {
    roleDescription = 'distinguished politician'
    attire = 'Wearing a formal dark suit with white shirt and conservative tie.'
  } else if (occLower.includes('actor') || occLower.includes('actress')) {
    roleDescription = 'Hollywood film star'
    attire = gender === 'woman'
      ? 'Wearing elegant attire, glamorous styling.'
      : 'Wearing a casual but stylish suit or open-collar shirt.'
  } else if (occLower.includes('singer') || occLower.includes('musician') || occLower.includes('entertainer')) {
    roleDescription = 'entertainer'
    attire = gender === 'woman'
      ? 'Wearing an elegant evening gown or stylish dress.'
      : 'Wearing a sharp suit or performer attire.'
  } else if (occLower.includes('mobster') || occLower.includes('gangster') || occLower.includes('crime')) {
    roleDescription = 'man with a hard edge'
    attire = 'Wearing a well-tailored suit with fedora nearby.'
  } else if (occLower.includes('soldier') || occLower.includes('military') || occLower.includes('colonel') || occLower.includes('general')) {
    roleDescription = 'military officer'
    attire = 'Wearing military dress uniform with medals and insignia.'
  } else if (occLower.includes('journalist') || occLower.includes('reporter') || occLower.includes('editor')) {
    roleDescription = 'journalist'
    attire = 'Wearing professional attire, perhaps with press credentials visible.'
  } else if (occLower.includes('business') || occLower.includes('executive') || occLower.includes('industrialist')) {
    roleDescription = 'business executive'
    attire = 'Wearing an expensive tailored suit.'
  } else {
    roleDescription = occupation || 'professional'
    attire = gender === 'woman'
      ? 'Wearing period-appropriate attire.'
      : 'Wearing a suit or professional attire.'
  }

  // Build the prompt
  const ethnicity = 'white' // Default, should be enhanced with actual data

  return `Photorealistic portrait photograph of a ${age} ${ethnicity} ${gender}, ${roleDescription}. Professional appearance with period-appropriate styling. ${attire} Professional studio lighting, late 1940s photography style, black and white.`
}

// Generate prompt for a location
function generateLocationPrompt(name, article) {
  const nameLower = name.toLowerCase()

  // Determine location type
  let locationType = ''
  let details = ''

  if (nameLower.includes('new york') || nameLower.includes('manhattan') || nameLower.includes('brooklyn') || nameLower.includes('bronx')) {
    locationType = 'New York City neighborhood'
    details = 'Busy urban streets with tall buildings, crowded sidewalks, vintage cars and buses, elevated train tracks visible.'
  } else if (nameLower.includes('los angeles') || nameLower.includes('hollywood') || nameLower.includes('hollyvale')) {
    locationType = 'Los Angeles area'
    details = 'Palm trees, Spanish-style architecture mixed with Art Deco buildings, bright sunshine, vintage automobiles.'
  } else if (nameLower.includes('chicago')) {
    locationType = 'Chicago cityscape'
    details = 'Impressive skyline with Art Deco skyscrapers, busy streets, Lake Michigan visible in distance.'
  } else if (nameLower.includes('detroit')) {
    locationType = 'Detroit industrial city'
    details = 'Art Deco skyscrapers, busy streets with period automobiles, industrial smokestacks in distance.'
  } else if (nameLower.includes('las vegas')) {
    locationType = 'early Las Vegas'
    details = 'Desert setting with early casino buildings, neon signs beginning to appear, dusty streets.'
  } else if (nameLower.includes('casino') || nameLower.includes('hotel')) {
    locationType = 'grand hotel or casino'
    details = 'Elegant Art Deco architecture, glamorous entrance, well-dressed patrons.'
  } else if (nameLower.includes('california') || nameLower.includes('texas') || nameLower.includes('missouri') ||
             nameLower.includes('kansas') || nameLower.includes('montana') || nameLower.includes('ohio') ||
             nameLower.includes('michigan') || nameLower.includes('illinois') || nameLower.includes('state')) {
    // State-level image
    locationType = 'American state landscape'
    details = 'Characteristic regional scenery, mix of rural and urban elements, period vehicles on highways.'
  } else if (nameLower.includes('china') || nameLower.includes('japan') || nameLower.includes('soviet') ||
             nameLower.includes('russia') || nameLower.includes('england') || nameLower.includes('london') ||
             nameLower.includes('israel') || nameLower.includes('ukraine') || nameLower.includes('philippines')) {
    // International location
    locationType = `${name} in the 1940s`
    details = 'Characteristic architecture and street scenes of the region, period-appropriate vehicles and clothing.'
  } else if (nameLower.includes('springs') || nameLower.includes('town') || nameLower.includes(',')) {
    // Small town
    locationType = 'small American town main street'
    details = 'Red brick storefronts with awnings, quiet streets with a few vintage automobiles, American flags on lampposts.'
  } else {
    // Default city
    locationType = `${name} cityscape`
    details = 'Period architecture, busy streets with vintage automobiles and pedestrians in 1940s attire.'
  }

  return `Photorealistic photograph of ${locationType} in the 1940s. ${details} Professional architectural photography, period-accurate details, atmospheric lighting, black and white.`
}

// Generate image using Grok API
async function generateImage(prompt) {
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

// Download image
async function downloadImage(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

// Main function
async function main() {
  const options = parseArgs()

  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')
  const { put } = await import('../web/node_modules/@vercel/blob/dist/index.js')
  const prisma = new PrismaClient()

  try {
    // Build query
    const where = {
      style: 'comic_bw',
      nextVersion: null,
    }

    if (options.category) {
      where.category = options.category
    } else {
      // Default: only portraits and locations
      where.category = { in: ['portrait', 'location'] }
    }

    // Get images to process
    let images = await prisma.image.findMany({
      where,
      select: { id: true, name: true, category: true, articleId: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    })

    // Handle --start option
    if (options.startId) {
      const startIdx = images.findIndex(img => img.id === options.startId)
      if (startIdx === -1) {
        console.error(`Start ID ${options.startId} not found`)
        process.exit(1)
      }
      images = images.slice(startIdx)
    }

    // Handle --limit option
    if (options.limit) {
      images = images.slice(0, options.limit)
    }

    console.log(`\n📸 Processing ${images.length} images...\n`)

    if (options.dryRun) {
      console.log('DRY RUN - No changes will be made\n')
    }

    let processed = 0
    let failed = 0

    for (const image of images) {
      processed++
      console.log(`[${processed}/${images.length}] ${image.name} (${image.category})`)

      try {
        // Get article and person info for better prompts
        let article = null
        let person = null

        if (image.articleId) {
          article = await prisma.article.findUnique({
            where: { id: image.articleId },
            select: { title: true, infobox: true, content: true }
          })
        }

        if (image.category === 'portrait') {
          // Try to find person record
          const nameParts = image.name.split(' ')
          if (nameParts.length >= 2) {
            person = await prisma.person.findFirst({
              where: {
                OR: [
                  { lastName: nameParts[nameParts.length - 1] },
                  { stageName: { contains: image.name } }
                ]
              },
              select: { firstName: true, lastName: true, dateBorn: true, gender: true }
            })
          }
        }

        // Generate prompt
        let prompt
        if (image.category === 'portrait') {
          prompt = generatePortraitPrompt(image.name, article, person)
        } else {
          prompt = generateLocationPrompt(image.name, article)
        }

        console.log(`   Prompt: ${prompt.substring(0, 80)}...`)

        if (options.dryRun) {
          console.log('   [DRY RUN - skipped]\n')
          continue
        }

        // Generate new image
        console.log('   Generating...')
        const imageUrl = await generateImage(prompt)

        // Download
        console.log('   Downloading...')
        const imageBuffer = await downloadImage(imageUrl)

        // Create new record and upload
        console.log('   Uploading...')
        const newImage = await prisma.image.create({
          data: {
            name: image.name,
            url: '',
            description: null,
            altText: null,
            category: image.category,
            articleId: image.articleId,
            prompt: prompt,
            generationTool: 'grok-2-image-1212',
            style: 'realistic',
            previousVersionId: image.id,
          }
        })

        const blob = await put(
          `kempo-media/image/${newImage.id}.jpg`,
          imageBuffer,
          { access: 'public', token: BLOB_READ_WRITE_TOKEN }
        )

        await prisma.image.update({
          where: { id: newImage.id },
          data: { url: blob.url }
        })

        // Update article infobox if exists
        if (image.articleId) {
          const origImage = await prisma.image.findUnique({
            where: { id: image.id },
            select: { url: true }
          })

          if (article?.infobox?.image?.url === origImage.url) {
            const updatedInfobox = { ...article.infobox }
            updatedInfobox.image.url = blob.url
            await prisma.article.update({
              where: { id: image.articleId },
              data: { infobox: updatedInfobox }
            })
            console.log('   Updated article infobox')
          }

          // Clear articleId from original
          await prisma.image.update({
            where: { id: image.id },
            data: { articleId: null }
          })
        }

        // Copy subjects
        const subjects = await prisma.imageSubject.findMany({
          where: { imageId: image.id }
        })
        for (const subj of subjects) {
          await prisma.imageSubject.create({
            data: {
              imageId: newImage.id,
              itemId: subj.itemId,
              itemType: subj.itemType,
            }
          })
        }

        console.log(`   ✅ Done: ${newImage.id}\n`)

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000))

      } catch (error) {
        failed++
        console.error(`   ❌ Error: ${error.message}\n`)
        // Continue with next image
      }
    }

    console.log(`\n✅ Complete! Processed: ${processed}, Failed: ${failed}`)

  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
