# Event System

The event system provides a temporal backbone for the Kempo universe, enabling time-based filtering of content and the "time machine" experience where users can view the world at any point in k.y. history.

## Overview

Events form a hierarchical structure with cross-classification capabilities:
- **Parent hierarchy**: Events can have a single parent (e.g., D-Day → Normandy Campaign → WW2)
- **Relations**: Events can be linked to multiple other events via EventRelation
- **People**: Events can involve multiple people with different roles
- **Locations**: Events can occur at multiple locations (polymorphic)
- **Media**: Events can be linked to articles, audio, video, images, albums

## Database Schema

### Event (core table)

| Field | Type | Description |
|-------|------|-------------|
| id | String | CUID primary key |
| title | String | Event name |
| description | String? | Detailed description (nullable) |
| kyDateBegin | DateTime | When the event started in k.y. |
| kyDateEnd | DateTime? | When the event ended (null = point event) |
| eventType | String | Category (birth, death, war, release, etc.) |
| significance | Int | 1-10 scale for filtering (default: 5) |
| parentId | String? | FK to parent Event |

### EventRelation (cross-classification)

Links events to other events beyond the parent hierarchy.

| Field | Type | Description |
|-------|------|-------------|
| eventId | String | FK to source Event |
| relatedEventId | String | FK to target Event |
| relationType | String | Type of relationship |

**Relation types:**
- `part_of` - this event is part of the related event
- `caused_by` - this event was caused by the related event
- `led_to` - this event led to the related event
- `concurrent_with` - events happened at the same time
- `related_to` - general relationship

### EventPerson (people involvement)

| Field | Type | Description |
|-------|------|-------------|
| eventId | String | FK to Event |
| personId | String | FK to Person |
| role | String? | Person's role in the event |

**Role types:**
- `subject` - the person the event is about (birth, death)
- `participant` - actively involved
- `witness` - present but not central
- `performer` - for entertainment events
- `victim` - harmed by event
- `perpetrator` - caused harm

### EventLocation (polymorphic)

Links events to locations (Nation, State, City, Place).

| Field | Type | Description |
|-------|------|-------------|
| eventId | String | FK to Event |
| locationType | String | nation, state, city, place |
| locationId | String | ID of the location record |
| role | String? | Location's role |

**Location roles:**
- `occurred_at` - primary location where event happened
- `originated_from` - where event/person came from
- `spread_to` - where event expanded to
- `destination` - target location

### EventMedia (polymorphic)

Links events to media items.

| Field | Type | Description |
|-------|------|-------------|
| eventId | String | FK to Event |
| mediaType | String | article, audio, video, image, album |
| mediaId | String | ID of the media record |
| relationType | String | Type of relationship |

**Media relation types:**
- `depicts` - media shows/describes the event
- `released_during` - media was released during this event
- `mentioned_in` - event is mentioned in media
- `soundtrack` - audio associated with event

## Event Types Reference

| Category | Types |
|----------|-------|
| Life | birth, death, marriage, divorce |
| Career | debut, retirement, appointment, resignation |
| Creative | release, premiere, recording, publication |
| Political | election, inauguration, legislation, treaty |
| Military | war, campaign, battle, armistice |
| Business | founding, merger, bankruptcy, dissolution |
| Other | incident, discovery, milestone, era |

## Usage Patterns

### Creating a hierarchical event

```typescript
// Create parent event (WW2)
const ww2 = await prisma.event.create({
  data: {
    title: "World War II",
    kyDateBegin: new Date("1939-09-01"),
    kyDateEnd: new Date("1945-09-02"),
    eventType: "war",
    significance: 10,
  }
});

// Create child event (Normandy)
const normandy = await prisma.event.create({
  data: {
    title: "Normandy Campaign",
    kyDateBegin: new Date("1944-06-06"),
    kyDateEnd: new Date("1944-08-30"),
    eventType: "campaign",
    significance: 9,
    parentId: ww2.id,
  }
});
```

### Linking an event to a person

```typescript
await prisma.eventPerson.create({
  data: {
    eventId: birthEvent.id,
    personId: person.id,
    role: "subject"
  }
});
```

### Linking an event to a location

```typescript
await prisma.eventLocation.create({
  data: {
    eventId: event.id,
    locationType: "city",
    locationId: city.id,
    role: "occurred_at"
  }
});
```

### Cross-classifying events

```typescript
// Frank Martino performs for troops (links to both his career and WW2)
await prisma.eventRelation.create({
  data: {
    eventId: usoPerformance.id,
    relatedEventId: ww2.id,
    relationType: "part_of"
  }
});
```

### Querying events by date range

```typescript
// Get all events up to February 1950
const events = await prisma.event.findMany({
  where: {
    kyDateBegin: {
      lte: new Date("1950-02-28")
    }
  },
  orderBy: { kyDateBegin: "desc" }
});
```

## Significance Scale

Use significance to filter events for different contexts:

| Score | Use Case |
|-------|----------|
| 10 | Major world events (wars, elections) |
| 8-9 | Significant regional/industry events |
| 6-7 | Notable events (major releases, appointments) |
| 4-5 | Standard events (births, routine releases) |
| 1-3 | Minor events (small milestones) |

For newspaper generation, filter by `significance >= 7` for headlines, `>= 5` for all articles.
