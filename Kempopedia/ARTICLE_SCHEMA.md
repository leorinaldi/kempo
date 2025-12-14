# Kempopedia Article Schema

Standard format for Kempopedia articles stored in the database and rendered as MDX.

## JSON Schema (Database Storage)

```json
{
  "id": "uuid",
  "slug": "founding-of-new-geneva",
  "title": "Founding of New Geneva",
  "article_type": "event",
  "status": "published",
  "summary": "The Founding of New Geneva was a pivotal diplomatic event in 1962 k.y. that established...",
  "content": "MDX content string...",
  "infobox": {
    "type": "event",
    "image": {
      "url": "/media/new-geneva-charter.jpg",
      "caption": "The original charter document"
    },
    "fields": {
      "date": "March 15, 1962 k.y.",
      "location": "Geneva, Swiss Confederation",
      "participants": ["European Federation", "Swiss Confederation", "Nordic Union"],
      "outcome": "Establishment of New Geneva as neutral territory"
    }
  },
  "categories": ["1962 k.y.", "Diplomatic events", "European Federation", "Treaties"],
  "timeline_events": [
    {
      "date": "1962 k.y.",
      "date_sort": 1962,
      "headline": "New Geneva founded",
      "description": "Delegates sign the founding charter"
    }
  ],
  "created_at": "2025-12-13T00:00:00Z",
  "updated_at": "2025-12-13T00:00:00Z",
  "published_at": "2025-12-13T00:00:00Z"
}
```

## Infobox Templates by Article Type

### Person
```json
{
  "type": "person",
  "image": { "url": "", "caption": "" },
  "fields": {
    "full_name": "string",
    "birth_date": "string (k.y. format)",
    "birth_place": "string",
    "death_date": "string (k.y. format) | null",
    "death_place": "string | null",
    "nationality": "string",
    "occupation": ["string"],
    "spouse": "string | null",
    "children": "number | null",
    "known_for": ["string"]
  }
}
```

### Nation
```json
{
  "type": "nation",
  "image": { "url": "", "caption": "Flag of..." },
  "fields": {
    "official_name": "string",
    "founded": "string (k.y. format)",
    "dissolved": "string (k.y. format) | null",
    "capital": "string",
    "largest_city": "string",
    "government_type": "string",
    "head_of_state": "string",
    "head_of_government": "string",
    "population": "number",
    "population_year": "string (k.y. format)",
    "currency": "string",
    "official_languages": ["string"]
  }
}
```

### Event
```json
{
  "type": "event",
  "image": { "url": "", "caption": "" },
  "fields": {
    "date": "string (k.y. format)",
    "end_date": "string (k.y. format) | null",
    "location": "string",
    "participants": ["string"],
    "outcome": "string",
    "casualties": "string | null"
  }
}
```

### Conflict
```json
{
  "type": "conflict",
  "image": { "url": "", "caption": "" },
  "fields": {
    "date": "string (k.y. format)",
    "end_date": "string (k.y. format) | null",
    "location": "string",
    "belligerents_side_a": ["string"],
    "belligerents_side_b": ["string"],
    "commanders_side_a": ["string"],
    "commanders_side_b": ["string"],
    "strength_side_a": "string",
    "strength_side_b": "string",
    "casualties_side_a": "string",
    "casualties_side_b": "string",
    "outcome": "string"
  }
}
```

### Place
```json
{
  "type": "place",
  "image": { "url": "", "caption": "" },
  "fields": {
    "official_name": "string",
    "type": "city | region | landmark | etc.",
    "country": "string",
    "founded": "string (k.y. format) | null",
    "population": "number | null",
    "population_year": "string (k.y. format) | null",
    "coordinates": "string | null",
    "elevation": "string | null"
  }
}
```

### Organization
```json
{
  "type": "organization",
  "image": { "url": "", "caption": "Logo of..." },
  "fields": {
    "official_name": "string",
    "abbreviation": "string | null",
    "founded": "string (k.y. format)",
    "dissolved": "string (k.y. format) | null",
    "type": "string",
    "headquarters": "string",
    "leader_title": "string",
    "leader_name": "string",
    "membership": "number | string | null",
    "purpose": "string"
  }
}
```

## MDX Content Structure

```mdx
The **Article Title** is a brief one-sentence definition that immediately
tells the reader what this article is about.

## Background

Context and history leading up to the subject. Use [[wikilinks]] to
reference other articles.

## Main Section

The core content of the article. Can include:

- Bullet points
- **Bold** and *italic* text
- [[Internal links]] to other articles
- <Figure src="/media/image.jpg" caption="Description" />

### Subsection

More detailed information within the main section.

## Impact / Legacy / Aftermath

Consequences and lasting effects.

## See also

- [[Related Article 1]]
- [[Related Article 2]]

## References

<References />
```

## Wikilink Parsing

The MDX renderer parses `[[...]]` syntax:

| Syntax | Renders As |
|--------|------------|
| `[[Article Title]]` | `<Link href="/wiki/article-title">Article Title</Link>` |
| `[[Article Title\|Custom Text]]` | `<Link href="/wiki/article-title">Custom Text</Link>` |
| `[[1975 k.y.]]` | `<Link href="/timeline/1975">1975 k.y.</Link>` |

## Date Formatting

All dates use the k.y. (Kempo Year) system, which matches Gregorian years:

- **Year only**: `1965 k.y.`
- **Month and year**: `March 1965 k.y.`
- **Full date**: `March 15, 1965 k.y.`
- **Ranges**: `1965-1968 k.y.` or `March 15 - April 2, 1965 k.y.`
- **Approximate**: `c. 1965 k.y.` (circa)
- **Ancient dates**: Use standard notation: `500 BC k.y.` or `1200 k.y.`

## Category Conventions

Categories follow a hierarchy:

```
Years
├── 1950 k.y.
├── 1951 k.y.
└── ...

Events
├── Diplomatic events
├── Military conflicts
├── Natural disasters
└── ...

People
├── Politicians
├── Military leaders
├── Scientists
└── ...

Nations
├── European nations
├── Asian nations
└── ...
```

## Slug Generation

Slugs are URL-safe versions of titles:

- Lowercase
- Spaces → hyphens
- Remove special characters
- Max 100 characters

Examples:
- "Founding of New Geneva" → `founding-of-new-geneva`
- "World War III (1965-1968 k.y.)" → `world-war-iii-1965-1968-ky`
- "Dr. Helena Voss" → `dr-helena-voss`
