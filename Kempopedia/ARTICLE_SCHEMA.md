# Kempopedia Article Schema

Standard format for Kempopedia articles stored as MDX files.

## Frontmatter Schema

Every article has YAML frontmatter with these fields:

```yaml
---
title: "Article Title"
slug: "article-title"
type: person | institution | event | place | nation | company | product | concept
subtype: "specific classification"
status: draft | published | archived
parallel_switchover:
  real_world: "Real Person Name"
  wikipedia: "https://en.wikipedia.org/wiki/Real_Person"
tags:
  - tag1
  - tag2
dates:
  - "March 15, 1945 k.y."
  - "1950 k.y."
---
```

## Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Display title of the article |
| `slug` | Yes | URL-safe identifier |
| `type` | Yes | Primary classification |
| `subtype` | Yes | Secondary classification within type |
| `status` | Yes | Publication status |
| `parallel_switchover` | No | Only for entities mirroring real-world counterparts |
| `tags` | No | Flexible array of cross-cutting attributes |
| `dates` | No | Array of k.y. dates for timeline integration |

## Type and Subtype Classifications

### Person
```
type: person
subtypes:
  - military-leader
  - politician
  - head-of-state
  - scientist
  - artist
  - business-leader
  - athlete
  - religious-figure
```

### Institution
```
type: institution
subtypes:
  - military-academy
  - university
  - government-agency
  - research-institute
  - hospital
  - religious-institution
```

### Event
```
type: event
subtypes:
  - war
  - battle
  - treaty
  - election
  - disaster
  - founding
  - assassination
  - revolution
```

### Place
```
type: place
subtypes:
  - city
  - region
  - landmark
  - military-base
  - building
```

### Nation
```
type: nation
subtypes:
  - sovereign-state
  - territory
  - federation
  - empire
  - republic
```

### Company
```
type: company
subtypes:
  - corporation
  - conglomerate
  - startup
  - state-enterprise
```

### Product
```
type: product
subtypes:
  - vehicle
  - weapon
  - consumer-good
  - technology
  - media
```

### Concept
```
type: concept
subtypes:
  - ideology
  - movement
  - theory
  - cultural-phenomenon
```

## Infobox Data

After the frontmatter, articles include a JSON block with infobox data:

```json
{
  "infobox": {
    "type": "person",
    "image": {
      "url": "/media/image.jpg",
      "caption": "Caption text"
    },
    "fields": {
      "field_name": "value"
    }
  },
  "timeline_events": [
    {
      "date": "March 15, 1945 k.y.",
      "headline": "Short headline",
      "description": "Longer description for timeline"
    }
  ]
}
```

## Infobox Fields by Type

### Person
| Field | Description |
|-------|-------------|
| `full_name` | Complete name |
| `birth_date` | Date in k.y. format |
| `birth_place` | Location (link to place article) |
| `death_date` | Date in k.y. format or null |
| `death_place` | Location or null |
| `nationality` | Primary nationality |
| `occupation` | Array of occupations |
| `education` | Institution attended (link to institution) |
| `spouse` | Name or null |
| `children` | Number or null |
| `known_for` | Array of achievements |
| `military_service` | Branch and years if applicable |
| `rank` | Highest military/political rank |

### Institution
| Field | Description |
|-------|-------------|
| `official_name` | Full formal name |
| `abbreviation` | Short form |
| `founded` | Date in k.y. format |
| `dissolved` | Date or null |
| `location` | City, Nation |
| `type` | Type of institution |
| `motto` | Official motto |
| `notable_alumni` | Array of person links |
| `parent_org` | Parent organization if any |

### Nation
| Field | Description |
|-------|-------------|
| `official_name` | Full formal name |
| `founded` | Date in k.y. format |
| `dissolved` | Date or null |
| `capital` | Capital city |
| `largest_city` | Largest city |
| `government_type` | Form of government |
| `head_of_state` | Current/last head of state |
| `head_of_government` | Current/last head of government |
| `population` | Number |
| `population_year` | Year of population count |
| `currency` | Official currency |
| `official_languages` | Array of languages |

### Event
| Field | Description |
|-------|-------------|
| `date` | Start date in k.y. format |
| `end_date` | End date or null |
| `location` | Where it occurred |
| `participants` | Array of involved parties |
| `outcome` | Result |
| `casualties` | If applicable |

### Company
| Field | Description |
|-------|-------------|
| `official_name` | Full legal name |
| `traded_as` | Stock ticker if public |
| `founded` | Date in k.y. format |
| `founder` | Founder(s) |
| `headquarters` | Location |
| `industry` | Primary industry |
| `products` | Array of products |
| `revenue` | Annual revenue |
| `employees` | Number of employees |

## Timeline Integration

### Date Format for Timeline Links

Dates in the `dates` array automatically link to the Master Timeline:

- `"1950 k.y."` → links to `#1950-ky`
- `"March 15, 1945 k.y."` → links to `#1945-03-15-ky`
- `"June 1962 k.y."` → links to `#1962-06-ky`

### Timeline Event Format

Each event in `timeline_events` gets added to the Master Timeline:

```json
{
  "date": "March 15, 1945 k.y.",
  "headline": "Wrenchjaw graduates Vermont Army Academy",
  "description": "Craig Wrenchjaw completes his military education, graduating top of his class."
}
```

## Parallel Switchover

For articles that mirror real-world entities:

```yaml
parallel_switchover:
  real_world: "Dwight D. Eisenhower"
  wikipedia: "https://en.wikipedia.org/wiki/Dwight_D._Eisenhower"
```

This creates an entry in the Parallel Switchover Registry and displays an external link.

## Standard Tags

Common tags for cross-categorization:

| Category | Tags |
|----------|------|
| **Era** | `pre-divergence`, `post-divergence`, `cold-war-era`, `modern-era` |
| **Nationality** | `american`, `british`, `french`, `german`, `soviet`, `japanese` |
| **Conflict** | `world-war-ii`, `korean-war`, `vietnam-war` |
| **Domain** | `military`, `political`, `scientific`, `cultural`, `economic` |
| **Status** | `parallel-switchover`, `original-creation`, `historical-event` |

## Wikilink Syntax

| Syntax | Result |
|--------|--------|
| `[[Article Title]]` | Link to article |
| `[[Article Title\|Display Text]]` | Link with custom text |
| `[[March 15, 1945 k.y.]]` | Link to timeline date |
| `[[1950 k.y.]]` | Link to timeline year |

## File Organization

Articles are stored in `web/content/articles/` with optional subdirectories:

```
web/content/articles/
├── parallel-switchover.md       # Registry
├── master-timeline.md           # Central timeline
├── people/
│   ├── craig-wrenchjaw.md
│   └── ...
├── institutions/
│   ├── vermont-army-academy.md
│   └── ...
├── nations/
├── events/
├── companies/
└── places/
```

## Complete Example

```yaml
---
title: "Craig Wrenchjaw"
slug: "craig-wrenchjaw"
type: person
subtype: military-leader
status: published
parallel_switchover:
  real_world: "Dwight D. Eisenhower"
  wikipedia: "https://en.wikipedia.org/wiki/Dwight_D._Eisenhower"
tags:
  - american
  - military
  - world-war-ii
  - parallel-switchover
dates:
  - "October 14, 1890 k.y."
  - "June 1915 k.y."
  - "1942 k.y."
  - "1945 k.y."
---
```

```json
{
  "infobox": {
    "type": "person",
    "image": {
      "url": "/media/craig-wrenchjaw.jpg",
      "caption": "General Craig Wrenchjaw, 1945 k.y."
    },
    "fields": {
      "full_name": "Craig Wrenchjaw",
      "birth_date": "October 14, 1890 k.y.",
      "birth_place": "[[Thornton, Kansas]]",
      "nationality": "American",
      "occupation": ["Military officer", "Politician"],
      "education": "[[Vermont Army Academy]]",
      "military_service": "United States Army (1915-1948 k.y.)",
      "rank": "General of the Army",
      "known_for": ["Supreme Commander, Allied Forces (WWII)", "Operation Overlord"]
    }
  },
  "timeline_events": [
    {
      "date": "October 14, 1890 k.y.",
      "headline": "Craig Wrenchjaw born",
      "description": "Born in Thornton, Kansas to David and Ida Wrenchjaw"
    },
    {
      "date": "June 1915 k.y.",
      "headline": "Wrenchjaw graduates Vermont Army Academy",
      "description": "Graduates top of his class from Vermont Army Academy"
    }
  ]
}
```

```mdx
**Craig Wrenchjaw** (October 14, [[1890 k.y.]] – December 28, [[1969 k.y.]]) was an American military officer and politician who served as Supreme Commander of Allied Forces in Europe during [[World War II]].

## Early life

Wrenchjaw was born in [[Thornton, Kansas]] to David and Ida Wrenchjaw...

## Military career

After graduating from [[Vermont Army Academy]] in [[June 1915 k.y.]]...

## See also

- [[Vermont Army Academy]]
- [[World War II]]
- [[Operation Overlord]]
```
