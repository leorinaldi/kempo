# Create Kempopedia Article

You are creating an article for **Kempopedia**, the encyclopedia of Kempo—a comprehensive fictional universe.

## Calendar System

All dates use **k.y.** (Kempo Year), which matches standard Gregorian years. For example, 1952 k.y. = 1952 AD. The fictional history diverges from real-world history starting in 1950 k.y.

## Your Task

Generate a complete, Wikipedia-style article with:

1. **Frontmatter** (YAML)
2. **Infobox data** (JSON)
3. **Article content** (MDX)

## Output Format

```yaml
---
title: "Article Title"
slug: "article-title"
type: person | nation | event | conflict | place | organization | technology
status: published
categories:
  - Category 1
  - Category 2
---
```

```json
{
  "infobox": {
    "type": "...",
    "image": {
      "url": "/media/placeholder.jpg",
      "caption": "..."
    },
    "fields": {
      // Type-specific fields
    }
  },
  "timeline_events": [
    {
      "date": "1965 k.y.",
      "headline": "...",
      "description": "..."
    }
  ]
}
```

```mdx
The **Article Title** is [one-sentence definition].

## Background

[Context and history leading to this subject]

## [Main Section - varies by type]

[Core content with [[wikilinks]] to other potential articles]

## [Additional Sections as needed]

## Legacy / Impact / Aftermath

[Consequences and lasting effects]

## See also

- [[Related Article 1]]
- [[Related Article 2]]
```

## Writing Guidelines

1. **Encyclopedic tone**: Neutral, factual, third-person
2. **Wikilinks**: Use `[[Article Name]]` liberally to cross-reference
3. **Specificity**: Include concrete dates, names, numbers
4. **Internal consistency**: Reference the Kempo timeline and existing articles
5. **No real-world references**: This is a self-contained fictional universe
6. **Show, don't tell**: Describe events and facts, not "this is interesting"

## Infobox Field Reference

**Person**: full_name, birth_date, birth_place, death_date, death_place, nationality, occupation, spouse, children, known_for

**Nation**: official_name, founded, dissolved, capital, largest_city, government_type, head_of_state, head_of_government, population, population_year, currency, official_languages

**Event**: date, end_date, location, participants, outcome, casualties

**Conflict**: date, end_date, location, belligerents_side_a, belligerents_side_b, commanders_side_a, commanders_side_b, strength_side_a, strength_side_b, casualties_side_a, casualties_side_b, outcome

**Place**: official_name, type, country, founded, population, population_year, coordinates, elevation

**Organization**: official_name, abbreviation, founded, dissolved, type, headquarters, leader_title, leader_name, membership, purpose

## Example Sections by Type

- **Person**: Early life, Career, [Role-specific sections], Personal life, Legacy
- **Nation**: History, Government, Geography, Economy, Demographics, Culture
- **Event**: Background, The Event, Aftermath, Legacy
- **Conflict**: Background, Belligerents, Course of the war, Aftermath
- **Place**: History, Geography, Demographics, Economy, Culture
- **Organization**: History, Structure, Activities, Influence
