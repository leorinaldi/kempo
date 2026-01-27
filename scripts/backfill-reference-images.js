#!/usr/bin/env node

/**
 * Backfill script to mark infobox portrait images as references
 *
 * For each Person with an article that has an infobox image:
 * - Find or create the ImageSubject link
 * - Mark it as isReference: true
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
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

async function main() {
  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')
  const prisma = new PrismaClient()

  try {
    // Find all people with articles
    const people = await prisma.person.findMany({
      where: { articleId: { not: null } },
      include: { article: true }
    })

    console.log(`Found ${people.length} people with articles\n`)

    let updated = 0
    let created = 0
    let alreadySet = 0
    let noInfoboxImage = 0
    let imageNotFound = 0

    for (const person of people) {
      const fullName = `${person.firstName} ${person.lastName}`

      if (!person.article || !person.article.infobox) {
        noInfoboxImage++
        continue
      }

      const infobox = person.article.infobox
      const imageUrl = infobox.image?.url

      if (!imageUrl) {
        noInfoboxImage++
        continue
      }

      // Find the image by URL
      const image = await prisma.image.findFirst({
        where: { url: imageUrl }
      })

      if (!image) {
        console.log(`  ⚠️  Image not in DB: ${fullName}`)
        imageNotFound++
        continue
      }

      // Check if ImageSubject exists
      const existingSubject = await prisma.imageSubject.findFirst({
        where: {
          imageId: image.id,
          itemId: person.id,
          itemType: 'person'
        }
      })

      if (existingSubject) {
        if (!existingSubject.isReference) {
          // Update to reference
          await prisma.imageSubject.update({
            where: { id: existingSubject.id },
            data: { isReference: true }
          })
          updated++
          console.log(`  ✅ Marked as reference: ${fullName}`)
        } else {
          alreadySet++
        }
      } else {
        // Create ImageSubject with isReference
        await prisma.imageSubject.create({
          data: {
            imageId: image.id,
            itemId: person.id,
            itemType: 'person',
            isReference: true
          }
        })
        created++
        console.log(`  🔗 Created reference link: ${fullName}`)
      }
    }

    console.log('\n--- Summary ---')
    console.log(`Updated to reference: ${updated}`)
    console.log(`Created new links: ${created}`)
    console.log(`Already set as reference: ${alreadySet}`)
    console.log(`No infobox image: ${noInfoboxImage}`)
    console.log(`Image not in DB: ${imageNotFound}`)
    console.log(`Total processed: ${people.length}`)

  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
