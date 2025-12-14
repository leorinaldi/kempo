# Kempopedia Architecture

The encyclopedia of Kempo—a realistic, web-ready wiki system.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle
- **Hosting**: Vercel
- **Media Storage**: Vercel Blob (images, videos)
- **Styling**: Tailwind CSS
- **Content Format**: MDX (Markdown + JSX components)

## Data Model

### Core Tables

```sql
-- Articles: The main content
articles (
  id              UUID PRIMARY KEY,
  slug            VARCHAR(255) UNIQUE,      -- URL-friendly identifier
  title           VARCHAR(500),
  summary         TEXT,                      -- Lead section / excerpt
  content         TEXT,                      -- MDX content
  article_type    VARCHAR(50),              -- person, event, nation, place, etc.
  status          VARCHAR(20),              -- draft, published, archived
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP,
  published_at    TIMESTAMP
)

-- Infoboxes: Structured data panels
infoboxes (
  id              UUID PRIMARY KEY,
  article_id      UUID REFERENCES articles,
  infobox_type    VARCHAR(50),              -- person, nation, event, etc.
  data            JSONB,                    -- Flexible key-value pairs
  image_url       VARCHAR(500),
  image_caption   TEXT
)

-- Media: Images and videos
media (
  id              UUID PRIMARY KEY,
  filename        VARCHAR(255),
  url             VARCHAR(500),
  media_type      VARCHAR(20),              -- image, video
  alt_text        TEXT,
  caption         TEXT,
  width           INTEGER,
  height          INTEGER,
  uploaded_at     TIMESTAMP
)

-- Article Media: Junction table
article_media (
  article_id      UUID REFERENCES articles,
  media_id        UUID REFERENCES media,
  position        INTEGER,                  -- Order in article
  section         VARCHAR(100)              -- Which section it belongs to
)

-- Categories: Taxonomic organization
categories (
  id              UUID PRIMARY KEY,
  name            VARCHAR(100),
  slug            VARCHAR(100) UNIQUE,
  parent_id       UUID REFERENCES categories,
  description     TEXT
)

-- Article Categories: Junction table
article_categories (
  article_id      UUID REFERENCES articles,
  category_id     UUID REFERENCES categories
)

-- Internal Links: Track wikilinks between articles
internal_links (
  source_id       UUID REFERENCES articles,
  target_id       UUID REFERENCES articles,
  anchor_text     VARCHAR(255),
  context         TEXT                      -- Surrounding sentence
)

-- Timeline Events: For chronological features
timeline_events (
  id              UUID PRIMARY KEY,
  article_id      UUID REFERENCES articles,
  event_date      VARCHAR(50),              -- "1965 k.y." or "Spring 1973 k.y."
  event_date_sort INTEGER,                  -- Numeric for sorting (year as integer)
  headline        VARCHAR(255),
  description     TEXT
)

-- Revisions: Version history
revisions (
  id              UUID PRIMARY KEY,
  article_id      UUID REFERENCES articles,
  content         TEXT,
  summary         VARCHAR(255),             -- Edit summary
  created_at      TIMESTAMP,
  revision_number INTEGER
)
```

## Article Types & Infobox Templates

| Type | Infobox Fields |
|------|----------------|
| **Person** | birth_date, death_date, nationality, occupation, image |
| **Nation** | founded, capital, population, government_type, flag_image |
| **Event** | date, location, participants, outcome, casualties |
| **Place** | location, population, founded, coordinates |
| **Organization** | founded, headquarters, leader, members |
| **Conflict** | dates, belligerents, outcome, casualties |
| **Technology** | invented, inventor, purpose |

## URL Structure

```
/wiki/[slug]              → Article page
/wiki/[slug]/edit         → Edit article
/wiki/[slug]/history      → Revision history
/category/[slug]          → Category listing
/timeline                 → Chronological view
/timeline/[year]          → Specific year
/search?q=                → Search results
/random                   → Random article
```

## Content Format (MDX)

Articles use MDX with custom components:

```mdx
---
title: "The Founding of New Geneva"
type: event
date: "1962 k.y."
---

<Infobox type="event" />

The **Founding of New Geneva** was a pivotal moment in the early
history of the [[European Federation]].

## Background

Following the [[Treaty of Munich]] in [[1958 k.y.]], several nations...

## The Convention

<Figure src="/media/new-geneva-signing.jpg" caption="Delegates signing the charter" />

The delegates gathered on March 15, [[1962 k.y.]]...

## Aftermath

→ See also: [[New Geneva Accords]], [[European Integration]]

## References

<References />
```

## Wikilink Syntax

Internal links use double brackets, parsed at render time:

- `[[Article Title]]` → Links to article with that title
- `[[Article Title|display text]]` → Custom link text
- `[[Timeline#1965 k.y.]]` → Link to section

## Features Roadmap

### Phase 1: Foundation
- [ ] Database schema setup (Neon)
- [ ] Basic article CRUD
- [ ] MDX rendering with wikilinks
- [ ] Simple infobox component
- [ ] Category system

### Phase 2: Media & Polish
- [ ] Image upload (Vercel Blob)
- [ ] Video embed support
- [ ] Infobox templates per article type
- [ ] Search functionality
- [ ] Timeline view

### Phase 3: Advanced
- [ ] Revision history & diff view
- [ ] "What links here" feature
- [ ] Random article
- [ ] API for external access
- [ ] AI-assisted article generation (Claude)

## Design Principles

1. **Wikipedia-realistic**: Visually and structurally similar to Wikipedia
2. **Internal coherence**: Strong cross-linking between articles
3. **Media-rich**: First-class support for images and video
4. **AI-native**: Built for AI-assisted content generation
5. **Version-controlled**: Full revision history

## Differences from Wikipedia

- **Single fictional universe**: All content is Kempo canon
- **k.y. calendar**: All dates use Kempo Year system (same as Gregorian years)
- **AI-generated**: Content created collaboratively with AI
- **Curated**: Not open to public editing (initially)
