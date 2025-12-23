import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RadioPlaylistItem {
  id: string
  name: string
  url: string
}

interface TVPlaylistItem {
  id: string
  name: string
  description?: string
  url: string
}

async function main() {
  console.log('Starting database seed...')

  // Read existing playlist files
  const radioPlaylistPath = path.join(__dirname, '../public/radio-playlist.json')
  const tvPlaylistPath = path.join(__dirname, '../public/tv-playlist.json')

  // Seed audio files from radio playlist
  if (fs.existsSync(radioPlaylistPath)) {
    const radioPlaylist: RadioPlaylistItem[] = JSON.parse(
      fs.readFileSync(radioPlaylistPath, 'utf-8')
    )

    console.log(`Seeding ${radioPlaylist.length} audio tracks...`)

    for (const track of radioPlaylist) {
      // Check if track with this URL already exists
      const existing = await prisma.audio.findFirst({
        where: { url: track.url },
      })

      if (existing) {
        await prisma.audio.update({
          where: { id: existing.id },
          data: {
            name: track.name,
            url: track.url,
          },
        })
      } else {
        await prisma.audio.create({
          data: {
            name: track.name,
            url: track.url,
            type: "song",
          },
        })
      }
      console.log(`  - ${track.name}`)
    }
  }

  // Seed video files from TV playlist
  if (fs.existsSync(tvPlaylistPath)) {
    const tvPlaylist: TVPlaylistItem[] = JSON.parse(
      fs.readFileSync(tvPlaylistPath, 'utf-8')
    )

    console.log(`Seeding ${tvPlaylist.length} video files...`)

    for (const video of tvPlaylist) {
      // Check if video with this URL already exists
      const existing = await prisma.video.findFirst({
        where: { url: video.url },
      })

      if (existing) {
        await prisma.video.update({
          where: { id: existing.id },
          data: {
            name: video.name,
            description: video.description,
            url: video.url,
          },
        })
      } else {
        await prisma.video.create({
          data: {
            name: video.name,
            url: video.url,
            description: video.description,
          },
        })
      }
      console.log(`  - ${video.name}`)
    }
  }

  console.log('Database seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
