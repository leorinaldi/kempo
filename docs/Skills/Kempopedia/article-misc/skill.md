# Article: Misc

Generic article creation for Kempopedia.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

For specific article types, use the dedicated skills:
- [article-person](../article-person/skill.md) — Biographical articles
- [article-location](../article-location/skill.md) — Locations and nations
- [article-organization](../article-organization/skill.md) — Organizations
- [article-media](../article-media/skill.md) — Songs, albums, films
- [article-product](../article-product/skill.md) — Vehicles, goods
- [article-timeline](../article-timeline/skill.md) — Timeline pages

## Generic Article Format

### Frontmatter

```yaml
---
title: "Article Title"
slug: "article-slug"
type: person | place | organization | event | culture | product | concept
subtype: specific-classification
status: published
tags:
  - relevant-tags
dates:
  - "Month Day, YEAR k.y."
---
```

**Frontmatter Field Requirements:**

| Field | Requirement | Notes |
|-------|-------------|-------|
| title | **Required** | Article title |
| slug | **Required** | URL-friendly identifier |
| type | **Required** | Entity type |
| subtype | Recommended | Specific classification |
| status | **Required** | "published" or "draft" |
| tags | Recommended | For categorization |
| dates | Recommended | k.y. dates mentioned in article |

### Infobox JSON

```json
{
  "infobox": {
    "type": "...",
    "image": {
      "url": "/media/<slug>.jpg",
      "caption": "..."
    },
    "fields": {
      "Field_name": "value or [[wikilink]]"
    }
  }
}
```

**Infobox Requirements:**

| Element | Requirement | Notes |
|---------|-------------|-------|
| type | **Required** | Matches article type |
| image.url | Recommended | For Person, Place, Organization types |
| image.caption | Recommended | When image is present |
| fields | **Required** | At least basic identifying fields |

### Article Structure

```mdx
**Article Title** is [one-sentence definition].

## Background
## [Main Section]
## [Additional Sections]
## See also
- [[Related Article]]
```

## Writing Guidelines

1. **Encyclopedic tone**: Neutral, factual, third-person
2. **Wikilinks**: Use `[[Article Name]]` liberally
3. **No dead links**: Create stubs for new entities
4. **Specificity**: Include concrete dates, names, numbers
5. **Present tense**: For living people and current institutions

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md).
