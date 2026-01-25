# Entity Linking Guide

This guide explains how entities in the Kempo database connect to each other through junction tables and relationship fields.

## Overview

The Kempo database uses several patterns for linking entities:

1. **Direct Foreign Keys** — One entity references another (e.g., Brand.organizationId → Organization)
2. **Article Links** — Entities link to their Kempopedia articles (e.g., Person.articleId → Article)
3. **Junction Tables** — Many-to-many relationships (e.g., ImageSubject links Images to multiple entities)
4. **Polymorphic Links** — Single table linking to multiple entity types via itemType/itemId pattern

## Core Entity Hierarchy

```
Organization
  └── Brand
        └── Product

Nation
  └── State
        └── City
              └── Place (can nest within other Places)
```

## Junction Tables Reference

### ImageSubject (Polymorphic)

Links images to any entity type.

| Field | Description |
|-------|-------------|
| imageId | The Image record |
| itemId | ID of the linked entity |
| itemType | Entity type: person, organization, brand, product, nation, state, city, place |

**Use case:** "Show all images of Frank Martino" or "Find the portrait for this Person"

**Creating links:**
1. Upload/generate image via scripts or admin UI
2. Go to `/admin/world-data/image/manage`
3. Edit the image, add subjects in the Linked Subjects section

### AudioElement (Polymorphic)

Links audio files to people and albums.

| Field | Description |
|-------|-------------|
| audioId | The Audio record |
| itemId | ID of the linked entity |
| itemType | Role/type: singer, composer, lyricist, producer, speaker, album |

**Use case:** "Find all songs where Frank Martino is the singer"

### VideoElement (Role-based)

Links videos to people with their role.

| Field | Description |
|-------|-------------|
| videoId | The Video record |
| personId | The Person record |
| role | actor, director, writer, producer |
| credit | Optional credit text |

**Use case:** "Find all films where Vivian Sterling is an actor"

### PublicationElement (Role-based)

Links publications to people with their role.

| Field | Description |
|-------|-------------|
| publicationId | The Publication record |
| personId | The Person record |
| role | author, editor, columnist, reporter, illustrator, photographer, cover_artist, writer |
| credit | Optional credit text |

**Use case:** "Find all publications where Arthur Hale is editor"

### NewsPubContentElement (Role-based)

Links individual publication content pieces to contributors.

| Field | Description |
|-------|-------------|
| contentId | The NewsPubContent record |
| personId | The Person record |
| role | author, photographer, illustrator |
| credit | Optional credit text |

**Use case:** "Who wrote this specific magazine article?"

### EventPerson (Role-based)

Links events to people with their role.

| Field | Description |
|-------|-------------|
| eventId | The Event record |
| personId | The Person record |
| role | subject, participant, witness, performer, victim, perpetrator |

**Roles explained:**
- **subject** — The event is about them (birth, death, marriage)
- **participant** — Actively involved (commander in battle, politician in election)
- **witness** — Present but passive
- **performer** — Performed at event (concert, ceremony)
- **victim** — Harmed by event
- **perpetrator** — Caused harm

### EventLocation (Polymorphic)

Links events to locations.

| Field | Description |
|-------|-------------|
| eventId | The Event record |
| locationId | ID of the location entity |
| locationType | nation, state, city, place |
| role | occurred_at, originated_from, spread_to, destination |

**Use case:** "Find all events that occurred in Motor City"

### EventMedia (Polymorphic)

Links events to media content.

| Field | Description |
|-------|-------------|
| eventId | The Event record |
| mediaId | ID of the media entity |
| mediaType | article, audio, video, image, album |
| relationType | depicts, released_during, mentioned_in, soundtrack |

**Use case:** "Find all articles about the Korean War"

### EventRelation

Links events to other events.

| Field | Description |
|-------|-------------|
| eventId | The source Event |
| relatedEventId | The related Event |
| relationType | part_of, caused_by, led_to, concurrent_with, related_to |

**Relation types:**
- **part_of** — This event is part of another (Battle of Inchon is part_of Korean War)
- **caused_by** — This event was caused by another
- **led_to** — This event led to another
- **concurrent_with** — Events happening at the same time
- **related_to** — General relationship

### Inspiration

Links Kempo entities to their real-world parallels.

| Field | Description |
|-------|-------------|
| subjectId | ID of the Kempo entity |
| subjectType | person, organization (currently supported) |
| inspiration | Real-world name |
| wikipediaUrl | Wikipedia link (optional) |

**Use case:** "Harold Kellman is inspired by Harry S. Truman"

## Direct Foreign Key Relationships

### Person Relationships

| Field | Links To | Description |
|-------|----------|-------------|
| articleId | Article | Kempopedia biography |

### Organization Relationships

| Field | Links To | Description |
|-------|----------|-------------|
| articleId | Article | Kempopedia article |

**Organizations own:**
- Brands (via Brand.organizationId)
- Albums as labels (via Album.labelId)
- Movies as studios (via MovieMetadata.studioId)
- Series as networks (via Series.networkId)
- Publications as publishers (via PublicationSeries.publisherId)

### Brand Relationships

| Field | Links To | Description |
|-------|----------|-------------|
| organizationId | Organization | Parent company |
| articleId | Article | Kempopedia article |

**Brands own:**
- Products (via Product.brandId)

### Product Relationships

| Field | Links To | Description |
|-------|----------|-------------|
| brandId | Brand | Parent brand |
| articleId | Article | Kempopedia article |

### Location Hierarchy

```
Nation.articleId → Article
State.nationId → Nation
State.articleId → Article
City.stateId → State
City.articleId → Article
Place.cityId → City
Place.parentPlaceId → Place (for nested places)
Place.articleId → Article
```

### Publication Relationships

```
PublicationSeries.publisherId → Organization
PublicationSeries.articleId → Article
Publication.seriesId → PublicationSeries
Publication.publisherId → Organization (can override series)
Publication.coverImageId → Image
```

### Media Relationships

```
Album.artistId → Person (primary artist)
Album.labelId → Organization (record label)
Album.articleId → Article

Video → VideoElement → Person (with role)
Video → MovieMetadata.studioId → Organization
Video → TvEpisodeMetadata.seriesId → Series
Video → CommercialMetadata.brandId → Brand
Video → CommercialMetadata.productId → Product
Video → OnlineMetadata.creatorId → Person

Series.networkId → Organization
Series.articleId → Article
```

## Creating Links: Step by Step

### When Creating a Person

1. **Create Article** — Write the Kempopedia biography
2. **Create Person record** — At `/admin/world-data/people`
3. **Link Article** — Set articleId in the Person form
4. **Generate Image** — Use generate-image.js
5. **Link Image** — Add ImageSubject linking image to person
6. **Add Inspirations** — If based on real person, add Inspiration records

### When Creating an Organization

1. **Create Article** — Write the Kempopedia article
2. **Create Organization record** — At `/admin/world-data/organizations`
3. **Link Article** — Set articleId
4. **Generate Image** — Logo or building
5. **Link Image** — Add ImageSubject
6. **Add Inspirations** — If based on real company

### When Creating a Brand

1. **Ensure Organization exists** — Parent company must be created first
2. **Create Article** — Write brand article
3. **Create Brand record** — At `/admin/world-data/brands`
4. **Link to Organization** — Set organizationId
5. **Link Article** — Set articleId
6. **Generate Logo** — Use generate-image.js with --style logo
7. **Link Image** — Add ImageSubject

### When Creating a Product

1. **Ensure Brand exists** — Parent brand must be created first
2. **Create Article** — Write product article
3. **Create Product record** — At `/admin/world-data/products`
4. **Link to Brand** — Set brandId
5. **Link Article** — Set articleId
6. **Generate Image** — Product photo
7. **Link Image** — Add ImageSubject

### When Creating a Publication

1. **Ensure Publisher Organization exists**
2. **Create Article** — For the publication series
3. **Create PublicationSeries record** — At `/admin/world-data/publications`
4. **Link Publisher** — Set publisherId
5. **Link Article** — Set articleId
6. **Create Person records** — For key staff
7. **Link Staff** — Create PublicationElement records

### When Creating a Series (TV Show)

1. **Ensure Network Organization exists** — Broadcasting network
2. **Create Article** — Write the Kempopedia article
3. **Create Series record** — At `/admin/world-data/series` (when available)
4. **Link Network** — Set networkId
5. **Link Article** — Set articleId
6. **Generate Image** — Promotional still or title card
7. **Link Image** — Add ImageSubject
8. **Create Person records** — For key cast/crew
9. **Link Genres** — Create SeriesGenre records

### When Creating an Event

1. **Create Event record** — Via Prisma or admin UI
2. **Link People** — Create EventPerson records for participants
3. **Link Locations** — Create EventLocation records
4. **Create Article** — If event warrants standalone article
5. **Link Article** — Create EventMedia record
6. **Link Related Events** — Create EventRelation records

## Verification Queries

### Check Person has all links

```sql
-- Person has article, image, and inspiration
SELECT p.id, p.firstName, p.lastName,
  a.title as article,
  i.url as image,
  ins.inspiration as real_world
FROM Person p
LEFT JOIN Article a ON p.articleId = a.id
LEFT JOIN ImageSubject isub ON isub.itemId = p.id AND isub.itemType = 'person'
LEFT JOIN Image i ON isub.imageId = i.id
LEFT JOIN Inspiration ins ON ins.subjectId = p.id AND ins.subjectType = 'person'
WHERE p.id = 'xxx';
```

### Check Brand hierarchy

```sql
-- Brand → Organization → Products
SELECT b.name as brand,
  o.name as organization,
  COUNT(p.id) as product_count
FROM Brand b
LEFT JOIN Organization o ON b.organizationId = o.id
LEFT JOIN Product p ON p.brandId = b.id
WHERE b.id = 'xxx'
GROUP BY b.id, o.id;
```

## Common Patterns

### Entity with Full Linking

For a well-linked entity, ensure:
- [ ] Database record exists
- [ ] Article exists and is linked via articleId
- [ ] Image exists and is linked via ImageSubject
- [ ] Inspirations recorded (if applicable)
- [ ] Parent entities exist and are linked (org → brand → product)
- [ ] Junction tables populated (EventPerson, PublicationElement, etc.)

### Orphan Detection

Entities without proper linking:
- Person without articleId → No Kempopedia page
- Person without ImageSubject → No portrait
- Brand without organizationId → Orphan brand
- Event without EventPerson → Event with no participants

## Admin UI Paths

| Entity | Create | Manage |
|--------|--------|--------|
| Person | `/admin/world-data/people/create` | `/admin/world-data/people/manage` |
| Organization | `/admin/world-data/organizations/create` | `/admin/world-data/organizations/manage` |
| Brand | `/admin/world-data/brands/create` | `/admin/world-data/brands/manage` |
| Product | `/admin/world-data/products/create` | `/admin/world-data/products/manage` |
| Locations | `/admin/world-data/locations` | Same |
| Images | `/admin/world-data/image/upload` | `/admin/world-data/image/manage` |
| Publications | `/admin/world-data/publications` | Same |
| Series | `/admin/world-data/series` (when available) | Same |
