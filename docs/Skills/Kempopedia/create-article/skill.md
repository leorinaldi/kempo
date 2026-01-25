# Create Article Skill

Generic article creation for Kempopedia.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

For specific article types, use the dedicated skills:
- [create-person](../create-person/skill.md) — Biographical articles
- [create-place](../create-place/skill.md) — Locations and nations
- [create-organization](../create-organization/skill.md) — Organizations
- [create-media](../create-media/skill.md) — Songs, albums, films
- [create-product](../create-product/skill.md) — Vehicles, goods
- [create-timeline](../create-timeline/skill.md) — Timeline pages

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
