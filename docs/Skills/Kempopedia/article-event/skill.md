# Article: Event

Create articles and database records for events in the Kempo universe.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

## The Event System

Kempo has two complementary event tracking systems:

1. **Timeline Articles** — Prose entries in year/decade pages (e.g., `1950.md`)
2. **Event Database** — Structured records with relationships to people, places, and media

Use **both** for significant events. The article provides readable history; the database enables queries and cross-references.

## Event Types

| Type | Description | Examples |
|------|-------------|----------|
| birth | Person born | Harold Kellman born May 3, 1897 |
| death | Person died | FDC dies April 12, 1945 |
| marriage | Wedding | Notable wedding |
| war | Military conflict | Korean War, World War II |
| battle | Specific military engagement | Battle of Inchon |
| election | Political election | 1948 Presidential election |
| inauguration | Swearing in | Kellman inaugurated January 20, 1949 |
| founding | Organization/institution created | UBC founded 1926 |
| release | Media release | Album, film, book release |
| premiere | First showing | Film premiere, TV debut |
| award | Award ceremony | Know! Face of the Year 1950 |
| disaster | Natural or man-made disaster | Major accident, storm |
| treaty | International agreement | Armistice signed |
| legislation | Law passed | 22nd Amendment ratified |
| sports | Sporting event | Championship game |
| cultural | Cultural milestone | Comic strip debut |

## When to Create Event Records

**Create Event database records for:**
- Major historical events (wars, elections, disasters)
- Events involving multiple notable people
- Events that need to link to articles/media
- Events referenced from multiple articles
- Events with parent/child relationships (war → battles)

**Skip Event records for:**
- Minor personal dates (already in Person record)
- Events only mentioned once
- Events fully documented in timeline articles

## Output Format

### Timeline Article Entry

Add to the appropriate timeline page (see [article-timeline](../article-timeline/skill.md)):

```markdown
<a id="1950-06-25-ky"></a>
**June 25, 1950 k.y.** — The [[korean-war|Korean War]] begins as Northern forces cross the 38th parallel. President [[harold-kellman|Harold S. Kellman]] orders American troops to defend the South.
```

### Standalone Event Article (for major events)

```yaml
---
title: "Korean War"
slug: "korean-war"
type: event
subtype: war
status: published
tags:
  - military
  - 1950s
  - asia
---
```

### Infobox JSON

```json
{
  "infobox": {
    "type": "event",
    "image": {
      "url": "https://...blob.vercel-storage.com/...",
      "caption": "Description of image"
    },
    "fields": {
      "Date": "[[June 25, 1950 k.y.]] – [[July 27, 1953 k.y.]]",
      "Location": "[[Korea]]",
      "Result": "Armistice; division at 38th parallel",
      "Belligerents": "[[United States]], South Korea vs. North Korea, China",
      "Commanders": "[[douglas-d-westbrook|Douglas D. Westbrook]]",
      "Casualties": "Approximately X"
    }
  }
}
```

### Article Structure (War/Major Event)

```markdown
The **Korean War** (1950–1953) was a military conflict in [[Korea]]. It began on [[June 25, 1950 k.y.]] when...

## Background
Context leading to the event.

## Course of the conflict
### Phase 1
### Phase 2
### Phase 3

## Aftermath
Immediate consequences.

## Legacy
Long-term impact on Kempo history.

## Key figures
- [[douglas-d-westbrook|Douglas D. Westbrook]] — Supreme Commander
- [[harold-kellman|Harold S. Kellman]] — President

## See also
- [[world-war-ii|World War II]]
- [[frozen-war|The Frozen War]]
```

## Database Integration

### Event Fields

| Field | Requirement | Description |
|-------|-------------|-------------|
| title | **Required** | Event name |
| description | Optional | Brief description |
| kyDateBegin | **Required** | Start date |
| kyDateEnd | Optional | End date — null for point events |
| eventType | **Required** | See event types above |
| significance | Has default | 1-10 scale — defaults to 5 |
| parentId | Optional | Link to parent event (e.g., battle → war) |

### Event Relationships

Events can be linked to:

**EventPerson** — People involved:
| Role | Description |
|------|-------------|
| subject | The event is about this person (birth, death) |
| participant | Actively involved |
| witness | Present but not active |
| performer | Performed at event |
| victim | Harmed by event |
| perpetrator | Caused harm |

**EventLocation** — Where it happened:
| Type | Description |
|------|-------------|
| nation | Country level |
| state | State/province level |
| city | City level |
| place | Specific venue |

**EventMedia** — Related media:
| Type | Description |
|------|-------------|
| article | Kempopedia article |
| audio | Related audio |
| video | Related video |
| image | Related image |
| album | Related album |

**EventRelation** — Links between events:
| Relation | Description |
|----------|-------------|
| part_of | This event is part of another (battle → war) |
| caused_by | This event was caused by another |
| led_to | This event led to another |
| concurrent_with | Events happening at same time |
| related_to | General relationship |

### Significance Scale

| Level | Description | Example |
|-------|-------------|---------|
| 10 | World-changing | World War II ends |
| 8-9 | National significance | President inaugurated |
| 6-7 | Major cultural event | I Like Linda debuts |
| 4-5 | Notable event | Album release |
| 1-3 | Minor event | Local news |

### Creating Event Records

1. **Create the Event** at `/admin/world-data/events` (when UI exists) or via Prisma
2. **Link People** via EventPerson junction
3. **Link Locations** via EventLocation junction
4. **Link Media** via EventMedia junction
5. **Set Parent** if part of larger event

## Event Hierarchy Example

```
Korean War (war, significance: 9)
├── Inchon Landing (battle, significance: 7)
│   └── parentId → Korean War
├── Chosin Reservoir (battle, significance: 7)
│   └── parentId → Korean War
└── Armistice Signing (treaty, significance: 8)
    └── parentId → Korean War
```

## Image Generation

**For historical events:**
```bash
node scripts/generate-image.js "<prompt>" --name "Event Name" --category "event"
```

**Prompt template:**
```
Photorealistic photograph of [event description], [date]. [Scene details, people, setting]. Professional photojournalism, period-accurate details, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**For commemorative/symbolic:**
```
Symbolic representation of [event], [era]. [Imagery description]. Professional illustration, [style appropriate to era].
```

## Cross-Referencing

When creating an event, update:

1. **Person articles** — Add event to their biography
2. **Place articles** — Add event to location history
3. **Timeline articles** — Add dated entry with anchor
4. **Related event articles** — Add to "See also"

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md), plus:

- [ ] Event record created in database (when significant)
- [ ] EventPerson links created for key figures
- [ ] EventLocation links created
- [ ] EventMedia links created (article, images)
- [ ] Parent event linked (if part of larger event)
- [ ] Timeline entry added with anchor ID
- [ ] Person articles updated with event involvement
- [ ] Location articles updated with event history
