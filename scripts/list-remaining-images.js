#!/usr/bin/env node

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

async function main() {
  const { PrismaClient } = await import('../web/node_modules/@prisma/client/index.js')
  const prisma = new PrismaClient()

  try {
    const images = await prisma.image.findMany({
      where: {
        style: 'comic_bw',
        nextVersion: null
      },
      select: { id: true, name: true, category: true, articleId: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    })

    const byCategory = {}
    for (const img of images) {
      const cat = img.category || 'uncategorized'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(img)
    }

    console.log('Remaining comic_bw images by category:\n')
    for (const [cat, imgs] of Object.entries(byCategory).sort()) {
      console.log(`${cat.toUpperCase()}: ${imgs.length}`)
    }

    console.log('\nTOTAL:', images.length)

    // Output JSON if requested
    if (process.argv.includes('--json')) {
      console.log('\n=== JSON ===')
      console.log(JSON.stringify(byCategory, null, 2))
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
