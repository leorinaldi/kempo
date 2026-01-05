# Kempo Data Model

**Scope:** Conceptual overview of entity types and their relationships. Explains what exists in the data model and how things connect.

For field-level details: [web/prisma/schema.prisma](../web/prisma/schema.prisma)
For entity management UI: `/admin/world-data`

---

## Entity Taxonomy

```
WORLD DATA (the simulation's "facts")
├── People
│   └── Person ──────────────────── biographical subjects
│
├── Organizations & Commerce
│   ├── Organization ────────────── companies, institutions, parties
│   ├── Brand ───────────────────── owned by Organization
│   └── Product ─────────────────── made by Brand
│
├── Locations (hierarchical)
│   ├── Nation
│   │   └── State
│   │       └── City
│   │           └── Place ───────── specific venues, buildings
│
└── Inspiration ─────────────────── real-world parallels for any entity

MEDIA (content assets)
├── Audio ───────────────────────── songs, radio ads, podcasts
├── Video ───────────────────────── movies, episodes, commercials, clips
├── Image ───────────────────────── photos, artwork
├── Album ───────────────────────── audio collections
├── Series ──────────────────────── TV show containers
└── Genre ───────────────────────── classification tags

PUBLICATIONS (print media)
├── PublicationSeries ──────────── newspapers, magazines, book series
└── Publication ────────────────── individual issues, editions, books

DEVICES (home page selections)
├── TV ──────────────────────────── channels + broadcasts
├── Radio ───────────────────────── playlist of Audio
├── PC ──────────────────────────── KempoNet Browser desktop experience
├── Mobile ─────────────────────── KempoNet Browser + native apps
└── Press ─────────────────────── newspapers, magazines, books

KEMPONET (online services, accessible via PC/Mobile browsers)
├── KempoTube ───────────────────── channels + videos (has mobile app)
├── FlipFlop ────────────────────── accounts + videos (has mobile app)
├── SoundWaves ──────────────────── music streaming (has mobile app)
├── Kempopedia ─────────────────── wiki articles
├── Giggle ─────────────────────── search engine
└── Domain ─────────────────────── registry of all KempoNet sites

CONTENT (CMS)
├── Article ─────────────────────── Kempopedia wiki entries
├── Page ────────────────────────── database-driven site content
├── Domain ──────────────────────── KempoNet site registry
└── AppSearch ───────────────────── search index for React pages

EVENTS (temporal backbone)
└── Event ───────────────────────── births, deaths, releases, wars, etc.
    ├── hierarchy (parent → children)
    ├── cross-links to other Events
    ├── links to People, Locations, Media
```

---

## Key Relationships

### World Data Hierarchy

```
Person ←───works at───→ Organization
                              │
                              ├──owns──→ Brand
                              │            │
                              │            └──makes──→ Product
                              │
                              └──(orgType: studio, network, label, etc.)
```

- **Person** can link to an **Article** (their Kempopedia page)
- **Organization** has an `orgType` field (company, studio, network, political-party, etc.)
- **Brand** belongs to one Organization
- **Product** belongs to one Brand, has a `productType` field

### Location Hierarchy

```
Nation → State → City → Place
```

Each level has optional `lat`/`long` coordinates for the map view at `/admin/world-data/locations/map`.

### Media Flow to Devices & KempoNet

```
Audio ──→ AudioElement (links singers, composers, albums)
  │
  ├──→ Radio playlist (RadioPlaylistItem)
  └──→ SoundWaves (queries Audio directly)

Video ──→ VideoElement (links actors, directors)
  │
  ├──→ type-specific metadata (MovieMetadata, TvEpisodeMetadata, etc.)
  │
  ├──→ KempoTubeVideo ──→ KempoTubeChannel
  ├──→ FlipFlopVideo ──→ FlipFlopAccount
  └──→ TvBroadcast ──→ TvChannel

Image ──→ ImageSubject (links to people, places, products, etc.)
  │
  └──→ Article.infobox (referenced by URL)
```

### Publications Structure

```
PublicationSeries ──→ Publication (one-to-many)
       │                    │
       │                    ├──→ PublicationElement (links people with roles)
       │                    │
       │                    └──→ Image (cover image)
       │
       └──→ Organization (publisher, via publisherId)
```

**PublicationSeries** is the container (e.g., "Detroit Sentinel", "Athlete Magazine"):
- Has a `type` enum: `newspaper`, `magazine`, `comic`, `book`
- Has a `frequency` enum: `daily`, `weekly`, `biweekly`, `monthly`, `quarterly`, `annual`, `irregular`
- Links to a publisher Organization
- Can link to a Kempopedia Article

**Publication** is an individual issue or book:
- Must have a `type` that matches its series (when linked to a series)
- Has a `genre` enum with 15 options in Fiction (8) and Nonfiction (7) categories
- Has volume, issueNumber, edition fields for periodicals
- Links to a cover Image
- Links to contributors via PublicationElement

### Events as Temporal Backbone

Events connect everything with dates:

```
Event
  ├── EventPerson ────→ Person (with role: subject, participant, etc.)
  ├── EventLocation ──→ Nation/State/City/Place (polymorphic)
  ├── EventMedia ─────→ Article/Audio/Video/Image/Album (polymorphic)
  └── EventRelation ──→ other Events (caused_by, led_to, part_of, etc.)
```

---

## Polymorphic & Role-Based Join Tables

Several tables link entities with additional context (type, role, or both):

| Table | Links From | Links To | Key Field | Values |
|-------|-----------|----------|-----------|--------|
| `AudioElement` | Audio | Person, Album | itemType | singer, composer, lyricist, album |
| `VideoElement` | Video | Person | role | actor, director, writer, producer |
| `ImageSubject` | Image | Person, Org, Brand, Product, locations | itemType | person, organization, brand, product, nation, state, city, place |
| `PublicationElement` | Publication | Person | role | author, editor, columnist, reporter, illustrator, photographer, cover_artist, writer |
| `EventLocation` | Event | Nation, State, City, Place | itemType | nation, state, city, place |
| `EventMedia` | Event | Article, Audio, Video, Image, Album | itemType | article, audio, video, image, album |

Polymorphic tables (itemType + itemId) avoid N separate foreign key columns.
Role-based tables use a direct foreign key with a role enum for the relationship type.

---

## Video Type System

Videos have a `type` enum that determines which metadata table applies:

| VideoType | Metadata Table | Key Fields |
|-----------|---------------|------------|
| `movie` | MovieMetadata | studioId, releaseYear, runtime |
| `tvShow` | TvEpisodeMetadata | seriesId, seasonNum, episodeNum |
| `trailer` | TrailerMetadata | trailerTypeId, forMovieId, forSeriesId |
| `commercial` | CommercialMetadata | brandId, productId, adTypeId |
| `online` | OnlineMetadata | contentTypeId, creatorId |

Only one metadata table is populated per video.

---

## Publication Type & Genre System

**PublicationType** (applies to both PublicationSeries and Publication):
- `newspaper` - daily/weekly news publications
- `magazine` - periodicals covering specific topics
- `comic` - comic books and graphic novels
- `book` - standalone or series books

**PublicationGenre** (15 options for categorizing content):

| Fiction (8) | Nonfiction (7) |
|-------------|----------------|
| literary_fiction | biography_memoir |
| historical_fiction | history_politics_society |
| science_fiction_fantasy | science_nature_technology |
| mystery_crime_thriller | philosophy_religion_mythology |
| romance | business_economics_psychology |
| horror | arts_culture |
| adventure_action | current_affairs_journalism |
| children_young_adult | |

---

## Article ↔ Entity Links

Most World Data entities can link to a Kempopedia article:

- `Person.articleId` → Article
- `Organization.articleId` → Article
- `Brand.articleId` → Article
- `Product.articleId` → Article
- `Nation.articleId`, `State.articleId`, `City.articleId`, `Place.articleId` → Article
- `Album.articleId` → Article
- `PublicationSeries.articleId` → Article

This creates bidirectional navigation: entity admin shows linked article, article infobox shows entity data.

---

## Quick Reference

| To understand... | Look at... |
|------------------|------------|
| All fields and constraints | `web/prisma/schema.prisma` |
| Entity CRUD operations | `/admin/world-data/*` |
| Publications management | `/admin/world-data/publications` |
| Event system details | `docs/event-system.md` |
| Article creation rules | `docs/Skills/Kempopedia/global-rules` |
