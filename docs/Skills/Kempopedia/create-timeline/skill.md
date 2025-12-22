# Create Timeline Skill

Create or update timeline pages for Kempopedia.

> **Required**: Read [global-rules](../global-rules/skill.md) first for mandatory rules.

## Timeline Structure

| Period | Page Type | Slug Format |
|--------|-----------|-------------|
| Pre-1950 | Decade | `1880s`, `1890s`, etc. |
| 1950+ | Year | `1950`, `1951`, etc. |

Create year pages only when there's actual content for that year.

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

```markdown
<a id="1945-ky"></a>
## 1945 k.y.

<a id="1945-04-12-ky"></a>
**April 12, 1945 k.y.** — [[harold-kellman|Harold S. Kellman]] becomes the 33rd President.

<a id="1945-08-06-ky"></a>
**August 6, 1945 k.y.** — The United States drops an atomic bomb on [[Hiroshima]].
```

## Anchor Formats

| Date Type | Anchor Format |
|-----------|---------------|
| Year only | `<a id="1945-ky"></a>` |
| Month and year | `<a id="1945-08-ky"></a>` |
| Full date | `<a id="1945-08-06-ky"></a>` |

## Adding Events

1. Open the appropriate timeline page
2. Find or create the year section
3. Add anchor ID for the date
4. Add event with bold date, em dash, and description with wikilinks
5. Maintain chronological order

## When to Create a New Year Page

Only create year pages for 1950+ when:
- You need to add the first event for that year
- An article references a date in that year

After creating a new year page, update the Master Timeline index.

## Completion

Verify all date links from articles have corresponding timeline entries.
