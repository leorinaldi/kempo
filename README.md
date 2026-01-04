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

## Featured Storylines

### Hollywood Golden Age

The entertainment industry centers on **Pacific Pictures**, a major film studio. Key figures include Irving Lazar (Head of Production), William Garrett (Western Director), Clay Marshall (Western Star), and Vivian Sterling (Femme Fatale).

**Key Films:**
- *Dust and Honor* (1939) — Clay Marshall's breakthrough
- *Abilene Dawn* (1946) — Considered the finest Western ever made
- *The Velvet Trap* (1946) — Noir classic starring Vivian Sterling

### American Politics

The political landscape features the **National Party** (Democratic parallel) and **Federal Party** (Republican parallel), with **Harold S. Kellman** (Harry S. Truman parallel) as President.

### The Antelope Springs Incident

In March 1949 k.y., test pilot Frank Caldwell died pursuing an unidentified object over New Mexico. The military cover-up was exposed by journalist Nathan Collier, leading to the Whitfield Committee hearings.

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
