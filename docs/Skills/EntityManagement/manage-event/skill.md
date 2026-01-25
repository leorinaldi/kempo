# Manage Event

Complete lifecycle management for Event entities: database records, timeline integration, and relationships to people, locations, and media.

## Overview

A fully managed Event in Kempo has:
1. **Event record** — Database entry with date, type, significance
2. **Timeline entry** — Prose entry in year/decade article
3. **Article** — Standalone Kempopedia article (for major events)
4. **Relationships** — Links to people, locations, and media

## Event System Architecture

Kempo tracks events in two complementary ways:

### Timeline Articles (Prose)
- Human-readable entries in year pages (1950.md, 1951.md)
- Decade pages for pre-1950 (1940s.md, 1930s.md)
- Anchor IDs for linking from other articles

### Event Database (Structured)
- Queryable records with typed relationships
- Hierarchical (wars contain battles)
- Links to people, places, and media

**Use both** for significant events.

## Event Types

| eventType | Description | Examples |
|-----------|-------------|----------|
| birth | Person born | Harold Kellman born |
| death | Person died | FDC dies |
| marriage | Wedding | Notable wedding |
| war | Military conflict | Korean War |
| battle | Specific engagement | Battle of Inchon |
| election | Political election | 1948 Presidential |
| inauguration | Swearing in ceremony | Kellman inaugurated |
| founding | Organization created | UBC founded |
| release | Media release | Album, film release |
| premiere | First showing | TV show debut |
| award | Award ceremony | Face of the Year |
| disaster | Disaster event | Major accident |
| treaty | International agreement | Armistice signed |
| legislation | Law passed | Amendment ratified |
| sports | Sporting event | Championship game |
| cultural | Cultural milestone | Comic strip debuts |
| trial | Legal proceeding | Marsh trial |
| speech | Notable speech | Major address |

## Significance Scale

| Level | Impact | Examples |
|-------|--------|----------|
| 10 | World-changing | World War II ends |
| 9 | Major historical | President dies in office |
| 8 | National significance | Presidential inauguration |
| 7 | Major cultural | Revolutionary TV show debuts |
| 6 | Notable national | Major trial verdict |
| 5 | Significant | Celebrity death, major release |
| 4 | Moderate | Notable event |
| 3 | Minor notable | Local significance |
| 2 | Minor | Limited impact |
| 1 | Minimal | Background event |

## Creation Workflow

### Step 1: Determine if Event Record Needed

**Create Event record when:**
- Multiple people involved (needs EventPerson links)
- Major historical significance (5+ on scale)
- Part of larger event (Korean War → battles)
- Will be referenced from multiple articles
- Needs structured querying

**Skip Event record when:**
- Simple personal date (just Person.dateBorn)
- Only mentioned once
- Fully documented in timeline

### Step 2: Create Timeline Entry

Always create timeline entry for notable dates.

Navigate to appropriate timeline page:
- Pre-1950: decade page (1940s.md)
- 1950+: year page (1950.md)

**Entry format:**
```markdown
<a id="1950-06-25-ky"></a>
**June 25, 1950 k.y.** — The [[korean-war|Korean War]] begins as Northern forces cross the 38th parallel.
```

**Anchor formats:**
- Year only: `1950-ky`
- Month: `1950-06-ky`
- Full date: `1950-06-25-ky`

### Step 3: Create Event Record

Via Prisma or admin UI:

```typescript
const event = await prisma.event.create({
  data: {
    title: "Korean War begins",
    description: "North Korean forces cross 38th parallel",
    kyDateBegin: new Date("1950-06-25"),
    kyDateEnd: null, // Point event, or set end date
    eventType: "war",
    significance: 9,
    parentId: null // Or parent event ID
  }
});
```

| Field | Requirement | Description |
|-------|-------------|-------------|
| title | **Required** | Event name |
| description | Optional | Brief description |
| kyDateBegin | **Required** | Start date |
| kyDateEnd | Optional | End date — null for point events |
| eventType | **Required** | See event types above |
| significance | Has default | 1-10 scale — defaults to 5 |
| parentId | Optional | Parent event ID — for hierarchical events |

### Step 4: Link People (EventPerson)

```typescript
await prisma.eventPerson.create({
  data: {
    eventId: event.id,
    personId: "person-id",
    role: "participant" // subject, participant, witness, performer, victim, perpetrator
  }
});
```

**Roles:**
| Role | Use When |
|------|----------|
| subject | Event is about them (birth, death, marriage) |
| participant | Actively involved (commander, politician) |
| witness | Present but passive |
| performer | Performed at event |
| victim | Harmed by event |
| perpetrator | Caused harm |

### Step 5: Link Locations (EventLocation)

```typescript
await prisma.eventLocation.create({
  data: {
    eventId: event.id,
    locationId: "city-id",
    locationType: "city", // nation, state, city, place
    role: "occurred_at" // occurred_at, originated_from, spread_to, destination
  }
});
```

### Step 6: Link Media (EventMedia)

```typescript
await prisma.eventMedia.create({
  data: {
    eventId: event.id,
    mediaId: "article-id",
    mediaType: "article", // article, audio, video, image, album
    relationType: "depicts" // depicts, released_during, mentioned_in, soundtrack
  }
});
```

### Step 7: Link Related Events (EventRelation)

```typescript
await prisma.eventRelation.create({
  data: {
    eventId: "battle-id",
    relatedEventId: "war-id",
    relationType: "part_of" // part_of, caused_by, led_to, concurrent_with, related_to
  }
});
```

### Step 8: Create Standalone Article (if major)

For major events (significance 7+), create a dedicated article.

Follow [article-event](../../Kempopedia/article-event/skill.md).

### Step 9: Update Related Articles

Add event mentions to:
- Person articles (participants' biographies)
- Location articles (city history)
- Organization articles (if relevant)
- Related event articles (See also)

### Step 10: Verify Completeness

- [ ] Timeline entry exists with anchor ID
- [ ] Event record created (if significant)
- [ ] EventPerson links for key figures
- [ ] EventLocation links for locations
- [ ] EventMedia links for related content
- [ ] EventRelation links for connected events
- [ ] Standalone article (if significance 7+)
- [ ] Related articles updated

## Event Hierarchy

Events can have parent-child relationships:

```
Korean War (war, significance: 9)
├── Inchon Landing (battle, significance: 7)
│   └── parentId → Korean War
├── Chosin Reservoir (battle, significance: 7)
│   └── parentId → Korean War
└── Armistice Signing (treaty, significance: 8)
    └── parentId → Korean War
```

Create parent event first, then child events with `parentId`.

## Update Workflow

### Adding People to Event
1. Create EventPerson record with role
2. Update person's article to mention event

### Adding Location to Event
1. Create EventLocation record with role
2. Update location's article if significant

### Changing Significance
1. Update Event.significance
2. Consider whether standalone article needed
3. Update prominence in timeline

### Linking Related Events
1. Create EventRelation with appropriate type
2. Update both event articles' "See also"

## Timeline Integration (CRITICAL)

**Timeline pages and related articles must link bidirectionally.** This ensures:
- Users can navigate from timeline to detailed articles
- Articles link back to timeline for historical context
- The wiki forms a coherent, interconnected whole

### Three-Way Linking Pattern

For every significant event, establish links between:

```
Event Database Record ←→ Timeline Page ←→ Related Articles
```

### From Event to Timeline

Every Event with significance 5+ should have a timeline entry:

1. Determine timeline page (year vs decade)
2. Add anchor with proper format
3. Write entry with wikilinks
4. Link from Event article to timeline

### From Timeline to Articles

Timeline entries for significant events should:
1. Link to Event article (if exists)
2. Link to related person/place articles
3. Use consistent date format

### From Articles to Timeline (MANDATORY)

**Related articles must link back to timeline dates using `[[date k.y.]]` syntax.**

When an event is mentioned in an article:
1. Identify if a timeline entry exists for that date
2. Add date link: `[[October 25, 1950 k.y.|October 25, 1950]]`
3. Ensure the timeline has the corresponding anchor

**Example:** If the Douglas Westbrook article mentions Chinese forces entering Korea, it should include:
```markdown
On [[October 25, 1950 k.y.|October 25, 1950]], Chinese "volunteer" forces first crossed the Yalu...
```

### Yearbook-to-Timeline Sync

When processing a yearbook:
1. **Extract all dated events** from the yearbook timeline section
2. **Check timeline pages** — add any missing events with anchors
3. **Check Event database** — create records for significant events (5+)
4. **Check related articles** — add date links where events are discussed
5. **Verify bidirectional links** — timeline links to articles, articles link to timeline

## Querying Events

### Events by Type
```typescript
const wars = await prisma.event.findMany({
  where: { eventType: "war" },
  orderBy: { kyDateBegin: "desc" }
});
```

### Events by Person
```typescript
const personEvents = await prisma.eventPerson.findMany({
  where: { personId: "xxx" },
  include: { event: true }
});
```

### Events at Location
```typescript
const cityEvents = await prisma.eventLocation.findMany({
  where: { locationId: "xxx", locationType: "city" },
  include: { event: true }
});
```

### Child Events
```typescript
const battles = await prisma.event.findMany({
  where: { parentId: "war-id" },
  orderBy: { kyDateBegin: "asc" }
});
```

## Database Schema Reference

```prisma
model Event {
  id           String    @id @default(cuid())
  title        String
  description  String?
  kyDateBegin  DateTime
  kyDateEnd    DateTime?
  eventType    String
  significance Int       @default(5)
  parentId     String?
  parent       Event?    @relation("EventHierarchy")
  children     Event[]   @relation("EventHierarchy")

  relationsFrom EventRelation[] @relation("EventFrom")
  relationsTo   EventRelation[] @relation("EventTo")
  people        EventPerson[]
  locations     EventLocation[]
  media         EventMedia[]
}

model EventPerson {
  id       String @id @default(cuid())
  eventId  String
  event    Event
  personId String
  person   Person
  role     String // subject, participant, witness, performer, victim, perpetrator
}

model EventLocation {
  id           String @id @default(cuid())
  eventId      String
  event        Event
  locationId   String
  locationType String // nation, state, city, place
  role         String // occurred_at, originated_from, spread_to, destination
}

model EventMedia {
  id           String @id @default(cuid())
  eventId      String
  event        Event
  mediaId      String
  mediaType    String // article, audio, video, image, album
  relationType String // depicts, released_during, mentioned_in, soundtrack
}

model EventRelation {
  id             String @id @default(cuid())
  eventId        String
  event          Event  @relation("EventFrom")
  relatedEventId String
  relatedEvent   Event  @relation("EventTo")
  relationType   String // part_of, caused_by, led_to, concurrent_with, related_to
}
```

## Quality Control: Yearbook Sync

After processing a yearbook, verify all events are properly linked:

### Step 1: Compare Yearbook Timeline to Kempopedia Timeline

```bash
# Read yearbook timeline section
# Compare against timeline page (e.g., 1950.md)
# Identify missing entries
```

### Step 2: Add Missing Timeline Entries

For each missing event from the yearbook:
1. Add entry with proper anchor ID to timeline page
2. Include wikilinks to related articles
3. Use consistent date format

### Step 3: Create Event Records

For significant events (5+) not in database:
```typescript
await prisma.event.create({
  data: {
    title: "Event name",
    description: "Brief description",
    kyDateBegin: new Date("YYYY-MM-DD"),
    eventType: "type",
    significance: N,
    parentId: parentEventId // if applicable
  }
});
```

### Step 4: Update Related Articles

For each new timeline entry:
1. Find articles that discuss this event
2. Add date links: `[[Month Day, YYYY k.y.|Month Day, YYYY]]`
3. Verify links resolve to timeline anchors

### Step 5: Verification Checklist

- [ ] All yearbook timeline events have Kempopedia timeline entries
- [ ] All significant events (5+) have Event database records
- [ ] All timeline entries link to relevant articles

### Step 6: Run Dead Link Checker

After all updates, verify no broken links were introduced:

```bash
node scripts/check-dead-links.js
```

Fix any dead links found (create stubs or correct slug format).
- [ ] All relevant articles link back to timeline dates
- [ ] Event hierarchy is correct (battles → wars, etc.)

## Admin Paths

Currently, Event management is primarily via Prisma. Admin UI paths when available:

| Action | Path |
|--------|------|
| Timeline Articles | Markdown files in articles/timelines/ |
| Manage People | `/admin/world-data/people/manage` |
| Manage Locations | `/admin/world-data/locations` |
