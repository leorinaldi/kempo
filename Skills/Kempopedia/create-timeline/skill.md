# Create Timeline Skill

You are creating or updating **timeline pages** for Kempopedia—chronological records of events in the Kempo universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, and more.

## Timeline Structure

The timeline is organized as follows:

| Period | Page Type | Slug Format | When to Create |
|--------|-----------|-------------|----------------|
| Pre-1950 | Decade | `1880s`, `1890s`, etc. | Already exist |
| 1950+ | Year | `1950`, `1951`, etc. | On first event in that year |

### Master Timeline

The [[Master Timeline]] is a simple index page linking to all decade and year pages. It contains **only links, no event descriptions**. Update it when:
- Adding a new year page (1950+) — add the year to the list

## Adding Events to Timeline

### For Pre-1950 Events

Add to the appropriate **decade page** (e.g., `1940s.md`).

### For 1950+ Events

1. Check if the year page exists
2. If not, create the year page first
3. Add the event to the year page
4. Update Master Timeline index to include the new year

## Page Format

### Decade Page (Pre-1950)

```yaml
---
title: "1940s k.y."
slug: "1940s"
type: timeline
subtype: decade
status: published
tags:
  - timeline
  - 1940s
---
```

### Year Page (1950+)

```yaml
---
title: "1950 k.y."
slug: "1950"
type: timeline
subtype: year
status: published
tags:
  - timeline
  - 1950
---
```

## Event Entry Format

Events should use anchors and consistent formatting:

```markdown
<a id="1945-ky"></a>
## 1945 k.y.

<a id="1945-04-12-ky"></a>
**April 12, 1945 k.y.** — [[harold-kellman|Harold S. Kellman]] becomes the 33rd President.

<a id="1945-08-06-ky"></a>
**August 6, 1945 k.y.** — The United States drops an atomic bomb on [[Hiroshima]].
```

### Anchor Format

| Date Type | Anchor Format | Example |
|-----------|---------------|---------|
| Year only | `<a id="YYYY-ky"></a>` | `<a id="1945-ky"></a>` |
| Month and year | `<a id="YYYY-MM-ky"></a>` | `<a id="1945-08-ky"></a>` |
| Full date | `<a id="YYYY-MM-DD-ky"></a>` | `<a id="1945-08-06-ky"></a>` |

### Event Format

```
**[Full Date] k.y.** — [Event description with [[wikilinks]] to relevant articles].
```

- Use bold for the date
- Use em dash (—) to separate date from description
- Include wikilinks to all relevant people, places, and events

## When to Create a New Year Page

Create a new year page when:
1. You need to add the first event for a year 1950 or later
2. An article references a date in that year

**Do not** create year pages speculatively. Only create when there's actual content.

## Date Links from Articles

When articles reference dates using `[[1945 k.y.]]` syntax:

| Date | Links To |
|------|----------|
| Pre-1950 dates | Decade page with anchor (e.g., `/kempopedia/wiki/1940s#1945-ky`) |
| 1950+ dates | Year page with anchor (e.g., `/kempopedia/wiki/1950#1950-01-01-ky`) |

## Infobox for Timeline Pages

```json
{
  "infobox": {
    "type": "timeline",
    "fields": {
      "period": "1940-1949 k.y.",  // for decades
      "year": "1950 k.y.",          // for years
      "type": "Decade | Year"
    }
  }
}
```

## Checklist for Timeline Updates

- [ ] Event date is on or before January 1, 1950 k.y.
- [ ] Added to correct decade or year page
- [ ] Anchor added for the date
- [ ] All wikilinks in event description are valid
- [ ] If new year page, updated Master Timeline index
- [ ] Event formatted with bold date and em dash

## Example: Adding a New Event

**Scenario**: Add that Harold Kellman gave a speech on March 15, 1947.

1. Open `1940s.md`
2. Find or create the 1947 section:
```markdown
<a id="1947-ky"></a>
## 1947 k.y.

<a id="1947-03-15-ky"></a>
**March 15, 1947 k.y.** — President [[harold-kellman|Harold S. Kellman]] delivers the [[Kellman Doctrine]] speech to Congress.
```

## Example: Creating a New Year Page

**Scenario**: First event in 1951.

1. Create `1951.md`:
```yaml
---
title: "1951 k.y."
slug: "1951"
type: timeline
subtype: year
status: published
tags:
  - timeline
  - 1951
---
```

2. Add the event with proper anchor

3. Update Master Timeline (just add the year link, no description):
```markdown
## 1950 and Beyond (by Year)

- [[1950]]
- [[1951]]
```
