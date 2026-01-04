# Kempo

**Scope:** Project overview for humans. Explains what Kempo is, its storylines, interfaces, and how to set up the development environment.

For AI assistant instructions and file routing, see [CLAUDE.md](CLAUDE.md).

---

A collaborative AI-human project to create the most extensive and cohesive fictional universe ever constructed.

**Live Site**: https://kempo.com (private access)
**Repository**: https://github.com/leorinaldi/kempo

## Vision

Kempo is an alternate branch of reality that diverged from our own around the late 1800s. By the 1950s, most major people—presidents, celebrities, notorious gangsters—as well as companies and products have different names and variations from "base reality," though the themes and pace of technological progress remain similar.

- **Divergent history**: A branch of our reality where familiar patterns play out through different people, institutions, and brands
- **Internal coherence**: Every element connects—history, cultures, individuals—forming a unified whole
- **Living documentation**: The universe is recorded as it evolves, creating an ever-growing archive
- **Day-by-day simulation**: Time moves forward in Kempo, with events unfolding and characters aging

## Calendar System

All dates in Kempo use **k.y.** (Kempo Years).

## Content Creation Process

Real-world history serves as inspiration, not a template. A storyline begins with a theme or era—say, 1940s Hollywood—and generates an interlaced web of:

- **People** — actors, directors, executives with their own biographies
- **Organizations** — studios, agencies, political parties
- **Locations** — cities, venues, landmarks
- **Events** — film releases, awards, scandals, historical moments
- **Media** — Kempopedia articles with images, playable songs, watchable films

Each element references others: an actor's article links to films they starred in, which link to the studio that produced them, which links to executives who ran it. Audio and video assets can appear in Radio, TV, SoundWaves, and KempoTube interfaces.

## Interfaces

| Interface | Description |
|-----------|-------------|
| **Kempopedia** | Wikipedia-style encyclopedia with 180+ articles |
| **KempoTube** | Video browsing interface |
| **Giggle** | Search engine for KempoNet |
| **FlipFlop** | TikTok-style vertical video browsing |
| **SoundWaves** | Music streaming with audio visualizer |
| **Kempo Radio** | Radio streaming interface |
| **Kempo TV** | Television broadcast interface |
| **KempoNet (PC)** | 1990s-era PC computing experience |
| **Kempo Mobile** | iPhone-style mobile experience |

### Fictional Computing Universe

| Real World | Kempo Equivalent |
|------------|------------------|
| Microsoft Windows | KempoSoft Portals |
| Google | Giggle (owned by GiggleNet) |
| Wikipedia | Kempopedia |
| YouTube | KempoTube |
| TikTok | FlipFlop |

## Project Structure

```
Kempo/
├── README.md              # This file
├── CLAUDE.md              # AI assistant instructions
├── docs/                  # Project documentation
│   └── Skills/Kempopedia/ # Article creation skills
├── scripts/               # Utility scripts (image generation)
└── web/                   # Next.js web application
    ├── prisma/            # Database schema
    ├── public/            # Static assets
    └── src/               # Application source code
```

## Developer Setup

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Storage**: Vercel Blob for media files
- **Authentication**: NextAuth.js
- **Hosting**: Vercel

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless)

### Setup

```bash
cd web

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

Create `web/.env.local` with:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="..."
```

For image generation, create `.env` in the root with:

```
XAI_API_KEY="..."
```

## Content Creation

Content is created collaboratively with AI using Claude Skills. See the [docs/Skills/Kempopedia](docs/Skills/Kempopedia) folder for article creation guidelines.

---

*Kempo begins now.*
