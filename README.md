# Kempo

A collaborative AI-human project to create the most extensive and cohesive fictional universe ever constructed.

**Live Site**: https://kempo.vercel.app/
**Repository**: https://github.com/leorinaldi/kempo

## Purpose

Kempo is a living simulation—a new reality built day by day through iterative worldbuilding. Rather than creating a static fictional setting, this project evolves organically, with AI helping to maintain internal consistency, generate emergent narratives, and simulate the passage of time across an interconnected cosmos.

## Vision

- **Day-by-day simulation**: Time moves forward in Kempo, with events unfolding, characters aging, civilizations rising and falling
- **Internal coherence**: Every element connects—history, cultures, individuals—forming a unified whole
- **Emergent complexity**: Simple rules and interactions give rise to unpredictable, rich outcomes
- **Living documentation**: The universe is recorded as it evolves, creating an ever-growing archive of its reality

## Calendar System

All dates in Kempo use **k.y.** (Kempo Year), which matches standard Gregorian years. For example, 1948 k.y. = 1948 AD.

**Current Date: January 1, 1950 k.y.**

The Kempo universe is a living simulation. The current date represents the "present day"—no events after this date have occurred yet. History before this date includes parallel switchover entities (fictional counterparts to real historical figures and institutions), meaning pre-1950 history is not identical to real-world history.

## Kempo Radio

Kempo Radio is a vintage 1940s-style radio interface that plays music from the Kempo universe.

**Access Kempo Radio**: https://kempo.vercel.app/radio

### Features

- Authentic 1940s radio design with illuminated display
- TUNE knob to cycle through tracks (click left for previous, right for next)
- VOL knob cycles through LOW/MED/HIGH volume levels
- Power toggle (ON/OFF)
- Auto-advances to next track when song ends
- Playlist managed via admin panel

## Kempopedia

Kempopedia is the encyclopedia of the Kempo universe—a Wikipedia-style wiki documenting everything in this fictional world.

**Access Kempopedia**: https://kempo.vercel.app/kempopedia

### Features

- Wikipedia-style article layout with infoboxes
- Internal wikilinks between articles (`[[Article Name]]`)
- Infobox sidebar links for places, institutions, and people
- Category-based organization with browse pages
- Timeline pages organized by decade (pre-1950) and year (1950+)
- AI-generated comic book style images

### Categories

| Category | Description |
|----------|-------------|
| People | Biographical articles about individuals |
| Places | Cities, states, nations, and locations |
| Institutions | Organizations, companies, parties, and academies |
| Events | Historical events and occurrences |
| Timeline | Chronological records by decade and year |
| Science and Technology | Scientific ideas, technologies |
| Culture and Entertainment | Popular culture, entertainment, and products |
| Other Concepts | Ideas, theories, and abstract topics |

## Project Structure

```
kempo/
├── Kempopedia/                    # Documentation and schemas
│   ├── ARCHITECTURE.md            # Technical architecture
│   └── ARTICLE_SCHEMA.md          # Article format specification
├── Skills/                        # Claude Skills (each skill has its own folder)
│   └── Kempopedia/
│       ├── global-rules/          # Core rules for all article creation
│       ├── create-article/        # General article creation
│       ├── create-person/         # Person articles with portraits
│       ├── create-institution/    # Institution articles with logos/buildings
│       ├── create-place/          # Place articles (cities, states, nations)
│       ├── create-media/          # Songs, albums, films with audio/video
│       ├── create-timeline/       # Timeline pages (decades and years)
│       ├── generate-image/        # Image generation guidelines
│       └── parallel-switchover/   # Real-world to Kempo mappings
├── scripts/
│   └── generate-image.js          # Grok API image generation script
└── web/                           # Next.js web application
    ├── content/
    │   └── articles/              # Kempopedia article files (MDX)
    │       ├── people/            # Person articles
    │       ├── places/            # Place articles (including nations)
    │       ├── institutions/      # Institution articles
    │       ├── events/            # Event articles
    │       ├── timelines/         # Timeline pages
    │       ├── culture/           # Songs, albums, films, books
    │       └── concepts/          # Concept articles
    ├── public/
    │   └── media/                 # Generated images (Grok API)
    └── src/
        ├── app/
        │   ├── kempopedia/        # Kempopedia pages
        │   │   ├── wiki/[slug]/   # Individual article pages
        │   │   └── category/      # Category browse pages
        │   ├── radio/             # Kempo Radio interface
        │   ├── admin/             # Admin panel (authenticated)
        │   ├── login/             # Authentication page
        │   └── api/               # API routes
        │       ├── auth/          # NextAuth endpoints
        │       ├── media/         # Media upload and listing
        │       └── radio/         # Playlist management
        ├── components/            # React components (Infobox, AudioPlayer, etc.)
        └── lib/                   # Article loading utilities
```

## Admin Panel

The admin panel provides authenticated access to manage media and playlists.

**Access Admin**: https://kempo.vercel.app/admin (requires authorized Google account)

### Features

- Upload audio/video files to Vercel Blob storage
- Manage Kempo Radio playlist
- Auto-lookup track info from Kempopedia articles
- View storage URLs for uploaded media

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Content**: MDX with frontmatter
- **Images**: Grok API (xAI) for comic book style illustrations
- **Media Storage**: Vercel Blob
- **Authentication**: NextAuth.js with Google OAuth
- **Hosting**: Vercel
- **Repository**: GitHub

## Development

```bash
cd web
npm install
npm run dev
```

The site runs at http://localhost:3000

## Creating Articles

Articles are markdown files in `web/content/articles/` organized by type (people, places, institutions, etc.). Each article has YAML frontmatter and optional JSON infobox data.

### Article Format

```markdown
---
title: "Article Title"
slug: "article-slug"
type: person | place | institution | event | timeline | concept
subtype: specific-subtype
status: published
tags:
  - relevant-tags
---

```json
{
  "infobox": {
    "type": "person",
    "image": {
      "url": "/media/article-slug.jpg",
      "caption": "Caption text"
    },
    "fields": {
      "Field_name": "value or [[wikilink]]"
    }
  }
}
```

Article content with [[wikilinks]] to other articles.
```

### Infobox Wikilinks

Infobox fields support wikilink syntax for linkable content:

```json
"Birth_place": "[[Lawton, Missouri]]",
"Political_party": "[[National Party]]",
"Education": "[[Liberty High School]]"
```

**Note**: Infobox field names must be capitalized (e.g., `Birth_place`, not `birth_place`).

Use wikilinks for places, institutions, and people. Use plain text for dates, numbers, and nationalities.

## Image Generation

Images are generated using the Grok API with comic book style prompts.

```bash
node scripts/generate-image.js <slug> "<prompt>"
```

### Prompt Style

All prompts start with: `Comic book illustration, bold ink lines, graphic novel style.`

| Article Type | Image Style |
|--------------|-------------|
| People | Portrait with setting/background |
| Nations | Flag waving against blue sky (full color) |
| Places | Scenic landscape or main street scene |
| Institutions | Logo or building depending on type |

### Color by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | Black and white |
| 1955-1965 | Muted early color, slightly faded |
| 1965+ | Full color |

Nation flags are always full color regardless of era.

## Timeline Structure

The timeline is organized into separate pages:

- **Pre-1950**: Decade pages (1880s, 1890s, 1900s, etc.)
- **1950+**: Individual year pages (created when first event occurs)
- **Master Timeline**: Index linking to all decade/year pages

Date links in articles automatically route to the appropriate timeline page:
- `[[1945 k.y.]]` → links to 1940s decade page
- `[[1951 k.y.]]` → links to 1951 year page

## Skills

Skills are Claude prompts that guide article creation. Each skill has its own folder under `Skills/Kempopedia/` with a `skill.md` file.

### Global Rules (17 sections)

The `global-rules` skill contains core rules for all article creation:

1. **Current Date Rule** - January 1, 1950 k.y. is the present
2. **Real People vs Parallel Switchovers** - When to use real historical figures
3. **Character Reuse Before Creation** - Search existing characters before creating new ones
4. **No Dead Links** - Every wikilink must point to an existing article
5. **Infobox Field Naming** - Capitalized field names required
6. **Infobox Wikilinks** - Link syntax in infobox fields
7. **Wikilink Slug Consistency** - Pipe syntax for display names
8. **Political Parties** - National Party / Federal Party
9. **Real-World Event Articles** - Focus on Kempo divergences
10. **Parallel Switchover Completeness** - Create related switchovers
11. **Article File Organization** - Directory structure
12. **Frontmatter Format** - YAML metadata specification
13. **Registry Entry Format** - Spawn Registry syntax
14. **Image Generation** - Mandatory for Person/Place/Institution
15. **Second-Order Updates** - Update linked pages after creating articles
16. **Table Formatting** - Avoid markdown tables, use lists
17. **Media Content** - Audio/video embedding via JSON media array

### Type-Specific Skills

- **create-person** - Biographical articles with portrait images
- **create-place** - Places including nations (with flag images)
- **create-institution** - Organizations with logos or building images
- **create-media** - Songs, albums, and other cultural works with audio/video
- **create-timeline** - Decade and year timeline pages
- **generate-image** - Image prompt guidelines and color rules
- **parallel-switchover** - Mapping real-world entities to Kempo equivalents

---

*Kempo begins now.*
