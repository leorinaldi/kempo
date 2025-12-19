import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RadioPlaylistItem {
  id: string
  name: string
  artist: string
  artistSlug: string
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
      await prisma.media.upsert({
        where: { slug: track.id },
        update: {
          name: track.name,
          artist: track.artist,
          artistSlug: track.artistSlug,
          url: track.url,
        },
        create: {
          slug: track.id,
          name: track.name,
          type: 'audio',
          url: track.url,
          artist: track.artist,
          artistSlug: track.artistSlug,
        },
      })
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
      await prisma.media.upsert({
        where: { slug: video.id },
        update: {
          name: video.name,
          description: video.description,
          url: video.url,
        },
        create: {
          slug: video.id,
          name: video.name,
          type: 'video',
          url: video.url,
          description: video.description,
        },
      })
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
