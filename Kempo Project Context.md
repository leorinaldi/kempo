# Kempo Project Context

*Last Updated: January 25, 2026*

## 1. Purpose & Scope

**What:** An alternate-universe simulation engine with Wikipedia, YouTube, mobile apps, and period-accurate computing interfaces.

**Goal:** Build the most extensive and internally coherent fictional universe ever constructed, advancing year-by-year from 1950 to present day (2026). This will provide a broad foundational canvas that can be extended with a nearly infinite variety of creative stories and simulations.

**Current Progress:** 1950-1951 complete with 180+ Kempopedia articles, 52 database models, and 9 distinct interfaces.

### Vision

Kempo is an alternate universe—a parallel reality where familiar patterns play out through different people, institutions, and brands:

- **Alternate universe**: History rhymes with our own but through Kempo-original characters and entities
- **Internal coherence**: Every element connects—history, cultures, individuals—forming a unified whole
- **Living documentation**: The universe is recorded as it evolves, creating an ever-growing archive
- **Day-by-day simulation**: Time moves forward, events unfold, characters age

### Content Creation

Real-world history serves as inspiration, not a template. Each era generates an interlaced web of:

- **People** — actors, directors, executives, politicians with their own biographies
- **Organizations** — studios, agencies, political parties, companies
- **Locations** — cities, venues, landmarks
- **Events** — film releases, awards, scandals, historical moments
- **Media** — Kempopedia articles, playable songs, watchable films

Each element references others: an actor's article links to films they starred in, which link to the studio that produced them, which links to executives who ran it.

### Calendar System

All dates in Kempo use **k.y.** (Kempo Years) — e.g., "January 15, 1950 k.y."

---

## 2. Core Philosophy

### Compressed Reality with a Twist

> "History doesn't repeat, but it rhymes."
> "Kempo doesn't perfectly imitate reality, but it is a compressed version with a twist."

- **Compression**: Multiple real-world figures combine into single Kempo entities (Frank Sinatra + Dean Martin + Tony Bennett → Frank Martino)
- **The Twist**: Names and details are original—resonant but not derivative (Camel cigarettes → Koala cigarettes with Australian tobacco backstory)
- **Inspiration Tracking**: Every fictional entity links to 2-4 real-world inspirations in the database

See [guiding-principles.md](docs/yearbooks/guiding-principles.md) for full philosophy.

### Temporal Simulation

The universe has a **viewing date** system. Users can travel to any point in Kempo history:

- **Article versioning**: Content shows as it existed at the selected date via the Revision system
- **Expanding universe**: As yearbooks are completed, more history becomes viewable
- **Future-proof**: Content created for 1950 will still be accessible when the simulation reaches 2026

### Multi-Device Immersion

Nine interfaces simulate different computing eras and platforms:

| Interface | Route | Experience |
|-----------|-------|------------|
| PC | `/pc` | Windows-style interface ("KempoSoft Portals") with KempoNet browser |
| Mobile | `/mobile` | iPhone-style experience |
| TV | `/tv` | Television with channels |
| Radio | `/radio` | Broadcast radio |
| Press | `/press` | Newspapers, magazines, books |
| Kempopedia | `/kemponet/kempopedia` | Wikipedia-style encyclopedia |
| KempoTube | `/kemponet/kempotube` | YouTube video browsing |
| FlipFlop | `/kemponet/flipflop` | TikTok-style vertical video |
| SoundWaves | `/kemponet/soundwaves` | Music streaming with visualizer |
| Giggle | `/kemponet/giggle` | Search engine |

Base URL: `http://localhost:3000` (dev) or `https://kempo.vercel.app` (prod)

---

## 3. Key Content Elements and Structure

### Entity-Article Duality

Most entities have both:
- **Database record** (Person, Organization, etc.) with structured fields
- **Kempopedia article** with narrative content and infobox

Linked via `articleId` on the entity record.

### ImageSubject Links

Images must be linked to entities via `ImageSubject` table for admin UI to show "linked images." This is separate from the article infobox URL.

### Inspiration Records

Every fictional entity should have `Inspiration` records linking to real-world sources. Real places (New York, Boston) don't need inspirations—they ARE real.

### KempoNet Architecture

**KempoNet** is Kempo's internet—a network of interconnected sites and services.

**Protocol & Addressing:**
- Fictional URLs use `kttp://` protocol (e.g., `kttp://giggle` or `kttp://kempopedia/wiki/frank-martino`)
- Maps to actual routes via simple conversion: `kttp://xyz` → `/kemponet/xyz`
- Address bars display `kttp://` URLs; users can also type bare site names

**Access Points:**
- **PC** (`/pc`) — 1990s desktop browser, renders KempoNet in iframe
- **Mobile** (`/mobile`) — Smartphone browser + native apps

**Domain Registry:**
- `Domain` table tracks registered KempoNet sites (name, owner, registration date)
- `Page` table stores content pages within each domain
- Dynamic route handler (`/kemponet/[...path]`) queries these tables to serve content

**URL Mapping:**

| User Types | Address Bar Shows | Actual Route |
|------------|-------------------|--------------|
| `giggle` | `kttp://giggle` | `/kemponet/giggle` |
| `kttp://kempopedia` | `kttp://kempopedia` | `/kemponet/kempopedia` |
| `kttp://kempopedia/wiki/slug` | `kttp://kempopedia/wiki/slug` | `/kemponet/kempopedia/wiki/slug` |

### Kempopedia

Kempopedia is the Wikipedia of the Kempo universe—the primary way content is surfaced.

**Article Storage:**
- Articles stored in `Article` table with CUID IDs
- Content is markdown in `content` field
- Structured data in `infobox` (JSON), `timelineEvents` (JSON), `mediaRefs` (JSON)
- Type classification: `type` (person, place, organization, event, timeline, etc.) + optional `subtype`

**ID vs Slug Routing (kludgy but works):**

URLs use human-readable slugs (`/wiki/frank-martino`) but database uses CUIDs. The `getArticleBySlugOrId()` function tries multiple resolution strategies:

1. If input looks like CUID → fetch by ID directly
2. Else unslugify (dashes→spaces) → case-insensitive title match
3. If still not found → scan all articles, slugify each title, compare

This allows both `/wiki/frank-martino` and `/wiki/clg7q8f4c...` to work.

**Wikilink Syntax:**
- `[[Article Title]]` → links to `/wiki/article-title`
- `[[Article Title|Display Text]]` → custom link text
- `[[Article Title#anchor]]` → links to heading anchor
- `[[January 15, 1950 k.y.]]` → date links route to timeline page with anchor

**Temporal System (Viewing Date):**

Articles respect the homepage date selector. Key fields:

| Field | Purpose |
|-------|---------|
| `publishDate` | When this version was current in k.y. (controls visibility) |
| `dates` | All k.y. dates mentioned in article (for search/indexing) |

**Revision System:**

When updating articles with new events (e.g., adding Korean War content):
1. Save current content as `Revision` (with `kempoDate` like "January 1, 1950 k.y.")
2. Update article with new content
3. Set new `publishDate` to after the latest events

When a user views at an earlier date:
- System checks if `viewingDate < publishDate`
- If so, finds most recent Revision where `kempoDate <= viewingDate`
- If no matching revision exists, article returns null (didn't exist yet)

**Search:**
- PostgreSQL full-text search with `ts_rank`
- Title matches get 2x ranking boost
- Respects viewing date (searches revisions for pre-publish articles)
- Falls back to ILIKE pattern matching if full-text fails

**Categories:**
Articles grouped by type into display categories: People, Places, Organizations, Events, Timeline, Culture, Concepts. Category pages filter by `publishDate` when viewing date is set.

### Admin Panel (`/admin`)

The admin panel provides visibility into database content and tools for managing the Kempo universe.

**World Data** (`/admin/world-data`):

| Section | Capabilities |
|---------|--------------|
| People | Create/edit people, view inspirations, linked images, article connections |
| Organizations | Create/edit organizations with type classification |
| Brands | Create/edit brands linked to parent organizations |
| Products | Create/edit products linked to brands |
| Locations | Manage Nation→State→City→Place hierarchy, map view |
| Images | Upload, edit metadata, **regenerate with AI** (Grok/Gemini), track linked subjects |
| Audio | Upload songs, manage albums, Kempo Radio playlists |
| Video | Upload clips, manage series, Kempo TV channels |
| Publications | Manage newspapers, magazines, comics, books (series + issues) |

**Other Admin Sections:**

| Section | Route | Purpose |
|---------|-------|---------|
| Backlog | `/admin/backlog` | Task management with drag-and-drop prioritization |
| Events | `/admin/events` | Create/manage timeline events, hierarchy browser |
| App Search | `/admin/app-search` | Index React pages for Giggle, AI-generate excerpts |
| Settings | `/admin/settings` | K.Y. date range (homepage slider bounds) |
| Security | `/admin/security` | Toggle login requirement |
| Project History | `/admin/project-history` | Development milestones |
| Documentation | `/admin/docs` | Browse project docs in-app |

**Key Features:**
- Inline editing for most fields
- Image regeneration with side-by-side preview
- Reference checking before deletion (shows what links to an entity)
- Inspiration tracking with Wikipedia links
- Article linking for all entity types

---

## 4. Content Pipeline and Skills

The **Yearbook-to-Content Workflow** is the master process for building the Kempo universe. Each year follows this pipeline:

```
┌─────────────────────────┐
│   Real [YEAR] Yearbook  │  Historical research document
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Kempo Yearbook Analysis│  Gap analysis, entity proposals, compression logic
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│   Kempo [YEAR] Yearbook │  Clean narrative (in-universe historical document)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│    Content Creation     │  8-phase execution workflow
│                         │
│  1. Inventory           │  Extract entities, map dependencies
│  2. Foundation          │  Organizations, Locations
│  3. Derived             │  Brands, Products, Publications
│  4. People              │  Biographies, portraits
│  5. Events & Timeline   │  Event records, timeline entries
│  6. Cross-References    │  Backlinks, bidirectional links
│  7. Verification        │  Dead links, images, inspirations
│  8. Quality Control     │  11-check QC battery
└─────────────────────────┘
```

### The Two-Book System

| Document | Purpose | Audience |
|----------|---------|----------|
| Kempo [YEAR] Yearbook Analysis | Working document with rationale, gap analysis, proposals | Creators |
| Kempo [YEAR] Yearbook | Clean narrative of what happened | Reference/In-universe |

### Skills

Skills are detailed instruction documents that guide AI-assisted content creation. Located in `docs/Skills/`.

**For the complete skills index, see [CLAUDE.md](CLAUDE.md#skills).**

Categories include:
- **Workflow Skills** — Master orchestration (yearbook-to-content, quality-control)
- **Entity Management Skills** — Full lifecycle for each entity type (DB record + article + image + inspirations)
- **Kempopedia Skills** — Article format templates by type
- **Supporting Skills** — Image generation, entity design, inspirations, date review
- **Session Skills** — Dev environment setup and teardown

### Long-Term Roadmap

The project will advance year-by-year:

```
1950 ✓ → 1951 ✓ → 1952 → ... → 2025 → 2026
```

Each year adds:
- New people, organizations, brands, products
- Updated biographies (people age, careers evolve)
- Historical events mapped to Kempo equivalents
- Media (eventually: songs, videos, publications)

---

## 5. Infrastructure

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma |
| Storage | Vercel Blob |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| Hosting | Vercel |

### Database Overview

**52 models** organized into domains:

| Domain | Key Models |
|--------|------------|
| World Data | Person, Organization, Brand, Product, Nation/State/City/Place, Inspiration |
| Media | Audio, Video, Image, Album, Series, Genre |
| Publications | PublicationSeries, Publication, NewsPubDesign, NewsPubContent |
| Events | Event, EventPerson, EventLocation, EventMedia, EventRelation |
| Content | Article, Revision, Domain, Page |
| Devices | TV/Radio/PC/Mobile configurations |

See [data-model.md](docs/data-model.md) for relationships and [schema.prisma](web/prisma/schema.prisma) for fields.

### External APIs

| API | Purpose |
|-----|---------|
| Grok (xAI) | Image generation (portraits, scenes) |
| Gemini | Image generation (text/logos) |
| Vercel Blob | Media storage |

---

## 6. File Structure

```
Kempo/
├── CLAUDE.md                    # AI assistant routing
├── README.md                    # Quick start & setup
├── Kempo Project Context.md     # This document (strategic overview)
│
├── docs/
│   ├── data-model.md            # Entity taxonomy
│   ├── yearbooks/
│   │   ├── guiding-principles.md
│   │   ├── the-real-YYYY-yearbook.md
│   │   ├── kempo-YYYY-yearbook-analysis.md
│   │   └── kempo-YYYY-yearbook.md
│   │
│   └── Skills/
│       ├── Kempopedia/          # Article format skills
│       │   ├── article-global-rules/
│       │   ├── article-person/
│       │   ├── article-organization/
│       │   └── ...
│       ├── EntityManagement/    # Full lifecycle skills
│       │   ├── manage-person/
│       │   ├── manage-organization/
│       │   └── ...
│       └── Workflows/
│           ├── yearbook-to-content/   # Master workflow
│           └── quality-control/       # QC battery
│
├── scripts/
│   ├── generate-image.js        # Image generation
│   └── check-dead-links.js      # Link verification
│
└── web/
    ├── prisma/schema.prisma     # Database schema
    └── src/app/
        ├── kemponet/            # KempoNet interfaces
        ├── admin/               # Admin panel
        └── api/                 # API routes
```

---

## 7. Core Documentation

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | AI routing, skill index, file locations |
| `Kempo Project Context.md` | This document—strategic overview |
| `README.md` | Quick start & developer setup |
| `docs/data-model.md` | Entity taxonomy and relationships |
| `docs/yearbooks/guiding-principles.md` | Content creation philosophy |
| `docs/Skills/Workflows/yearbook-to-content/skill.md` | Master content workflow |
| `docs/Skills/Workflows/quality-control/skill.md` | QC check battery |
| `docs/Skills/Kempopedia/article-global-rules/skill.md` | Article format rules |
| `docs/search-system.md` | Giggle search engine implementation |
