# Kempo Web

A Next.js web application for the Kempo alternate universe project - an immersive worldbuilding simulation set in a parallel timeline that diverged from our reality in the late 1800s.

## Overview

Kempo is a collaborative AI-human project creating comprehensive fictional alternate universe documentation. By the 1950s, this parallel timeline features different presidents, celebrities, companies, and cultural touchstones while maintaining similar technological and social trajectories.

The platform serves as "living documentation" for a day-by-day simulation.

## Features

### Interfaces

- **Kempopedia** (`/kemponet/kempopedia`) - Wikipedia-style encyclopedia with 180+ articles
- **KempoTube** (`/kemponet/kempotube`) - Video browsing interface
- **SoundWaves** (`/kemponet/soundwaves`) - Music streaming app with audio visualizer
- **FlipFlop** (`/kemponet/flipflop`) - TikTok-style vertical video browsing
- **Giggle** (`/kemponet/giggle`) - Search engine for KempoNet
- **KempoNet** (`/kemponet`) - 1990s-era PC computing experience with fictional "KS Portals 25" OS
- **Kempo Mobile** (`/mobile`) - Modern iPhone-style mobile experience with standalone apps (FlipFlop, SoundWaves) and KempoNet Browser
- **Kempo Radio** (`/radio`) - Radio streaming interface
- **Kempo TV** (`/tv`) - Television broadcast interface

### Visual Style

Distinctive graphic novel aesthetic with bold outlines and blue glow effects.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Vercel Blob for media files
- **Authentication**: NextAuth.js
- **Hosting**: Vercel

## Database Schema

### Articles (Kempopedia)

Articles are stored in PostgreSQL with full revision history:

```prisma
model Article {
  id                 String     @id
  slug               String     @unique
  title              String
  type               String     // person, place, institution, event, culture, etc.
  content            String     // Markdown with [[wikilinks]]
  infobox            Json?      // Structured infobox data
  timelineEvents     Json?      // Timeline entries
  tags               String[]
  dates              String[]   // k.y. dates mentioned
  revisions          Revision[]
}

model Revision {
  id             String   @id
  articleId      String
  title          String
  content        String
  infobox        Json?
  editSummary    String?
  kempoDate      String?  // In-universe date (e.g., "January 15, 1950 k.y.")
  createdAt      DateTime
}
```

### Media

Audio and video files with playlist support for Radio and TV interfaces.

### Settings

Site configuration stored in database (e.g., auth requirement toggle).

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless)

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="..."
```

## Content

### Article Format

Articles use Markdown with:
- `[[Article Name]]` - Wikilinks to other articles
- `[[slug|Display Text]]` - Wikilinks with custom display text
- `[[March 15, 1945 k.y.]]` - Date links to timeline pages
- Embedded JSON for infobox and timeline data

### Date System

All dates use **k.y.** (Kempo Years).

## Scripts

### Article Migration

One-time migration from markdown files to database:

```bash
npx tsx scripts/migrate-articles.ts
```

## Project Structure

```
web/
├── content/
│   ├── articles/      # Legacy markdown files (backup)
│   └── admin/         # Admin documentation
├── prisma/
│   └── schema.prisma  # Database schema
├── public/
│   └── media/         # Static images
├── scripts/
│   └── migrate-articles.ts
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   └── lib/           # Utilities (articles, prisma, etc.)
├── docs/              # Project documentation
└── CLAUDE.md          # AI assistant instructions
```

## Documentation

- **[docs/kemponet-design-patterns.md](docs/kemponet-design-patterns.md)** - Design system for KempoNet pages (viewing contexts, header positioning, state management, navigation patterns)
- **[docs/mobile-testing.md](docs/mobile-testing.md)** - Test on phone via localhost with ngrok
- **[CLAUDE.md](CLAUDE.md)** - Instructions for Claude Code AI assistant

## License

Private project - all rights reserved.
