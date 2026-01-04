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

PLATFORMS (KempoNet services that display media)
├── KempoTube ───────────────────── channels + videos
├── FlipFlop ────────────────────── accounts + videos
├── TV ──────────────────────────── channels + broadcasts
├── Radio ───────────────────────── playlist of Audio
└── SoundWaves ──────────────────── music streaming (queries Audio)

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

### Media Flow to Devices

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

## Polymorphic Join Tables

Four tables use a `itemType`/`itemId` pattern to link to multiple entity types:

| Table | Links From | Links To | itemType values |
|-------|-----------|----------|-----------------|
| `AudioElement` | Audio | Person, Album | singer, composer, lyricist, album |
| `ImageSubject` | Image | Person, Org, Brand, Product, locations | person, organization, brand, product, nation, state, city, place |
| `EventLocation` | Event | Nation, State, City, Place | nation, state, city, place |
| `EventMedia` | Event | Article, Audio, Video, Image, Album | article, audio, video, image, album |

These avoid N separate foreign key columns by storing type + ID together.

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

## Article ↔ Entity Links

Most World Data entities can link to a Kempopedia article:

- `Person.articleId` → Article
- `Organization.articleId` → Article
- `Brand.articleId` → Article
- `Product.articleId` → Article
- `Nation.articleId`, `State.articleId`, `City.articleId`, `Place.articleId` → Article
- `Album.articleId` → Article

This creates bidirectional navigation: entity admin shows linked article, article infobox shows entity data.

---

## Quick Reference

| To understand... | Look at... |
|------------------|------------|
| All fields and constraints | `web/prisma/schema.prisma` |
| Entity CRUD operations | `/admin/world-data/*` |
| Event system details | `docs/event-system.md` |
| Article creation rules | `docs/Skills/Kempopedia/global-rules` |
