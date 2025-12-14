# Create Kempopedia Article

You are creating an article for **Kempopedia**, the encyclopedia of Kempo—a comprehensive fictional universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, and more.

## Calendar System

All dates use **k.y.** (Kempo Year), which matches standard Gregorian years. For example, 1948 k.y. = 1948 AD.

**Current Date: January 1, 1950 k.y.** — This is the "present day" in Kempo. Do not include events after this date.

## Your Task

Generate a complete, Wikipedia-style article with:

1. **Frontmatter** (YAML)
2. **Infobox data** (JSON) — wikilinks supported for linkable fields
3. **Article content** (MDX) — wikilinks throughout

## Output Format

### Frontmatter

```yaml
---
title: "Article Title"
slug: "article-slug"
type: person | place | institution | event | nation | concept | company | product
subtype: specific-classification
status: published
parallel_switchover:  # Only if based on real-world entity
  real_world: "Real Entity Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - relevant-tag
  - parallel-switchover  # if applicable
dates:
  - "Month Day, YEAR k.y."
---
```

### Infobox JSON

**Infobox fields support wikilinks for linkable content** (places, institutions, parties, people).

```json
{
  "infobox": {
    "type": "...",
    "image": {
      "url": "/media/placeholder.jpg",
      "caption": "..."
    },
    "fields": {
      "birth_place": "[[Lawton, Missouri]]",
      "political_party": "[[National Party]]",
      "birth_date": "May 11, 1884 k.y."
    }
  },
  "timeline_events": [
    {
      "date": "1945 k.y.",
      "headline": "...",
      "description": "..."
    }
  ]
}
```

### Article Content (MDX)

```mdx
The **Article Title** is [one-sentence definition].

## Background

[Context and history leading to this subject]

## [Main Section - varies by type]

[Core content with [[wikilinks]] to other articles]

## [Additional Sections as needed]

## Legacy / Impact / Aftermath

[Consequences and lasting effects — only for past events/deceased persons]

## See also

- [[Related Article 1]]
- [[Related Article 2]]
```

## Writing Guidelines

1. **Encyclopedic tone**: Neutral, factual, third-person
2. **Wikilinks**: Use `[[Article Name]]` liberally — but ensure each linked article exists!
3. **No dead links**: Create stub articles for any new wikilinks
4. **Specificity**: Include concrete dates, names, numbers
5. **Current date awareness**: No events after January 1, 1950 k.y.
6. **Political parties**: Use National Party (not Democratic) and Federal Party (not Republican)
7. **Present tense**: For living people and current institutions

## Infobox Field Reference

**Person**: full_name, birth_date, birth_place, death_date, death_place, nationality, occupation, political_party, spouse, children, known_for

**Nation**: official_name, founded, dissolved, capital, largest_city, government_type, head_of_state, population, currency

**Event**: date, end_date, location, participants, outcome

**Place**: type, country, state, founded, population

**Institution**: official_name, abbreviation, type, location, founded

**Concept**: type, established, scope

## Example Sections by Type

- **Person**: Early life, Education, Career, [Role-specific], Personal life, [Legacy — only if deceased]
- **Nation**: History, Government, Geography, Economy, Demographics
- **Event**: Background, The Event, Aftermath
- **Place**: History, Geography, Demographics
- **Institution**: History, Structure, Notable members

## Checklist Before Completing

- [ ] All events on or before January 1, 1950 k.y.
- [ ] All wikilinks have existing articles (or stubs created)
- [ ] Infobox uses wikilinks for linkable fields (places, institutions, parties)
- [ ] Uses Kempo political parties (National/Federal)
- [ ] All dates use k.y. format
- [ ] Parallel switchover registered (if applicable)
