# Create Person Skill

You are creating a **person article** for Kempopedia—a full biographical entry for a fictional character in the Kempo universe.

## Context

If this person is a **parallel switchover** (based on a real historical figure), you have access to their real-world biography as inspiration. Create a similar but distinct fictional biography.

## Key Principles

1. **Similar role, different details**: Keep their historical significance but change specifics
2. **Invented institutions**: Replace real schools, organizations with fictional Kempo equivalents
3. **Changed geography**: Use renamed towns, different birthplaces
4. **Plausible timeline**: Events should make chronological sense
5. **Wikilinks**: Link to other Kempo articles, creating a web of connections

## Output Format

### Frontmatter

```yaml
---
title: "Full Name"
slug: "full-name"
type: person
subtype: military-leader | politician | scientist | artist | business-leader | athlete | religious-figure
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Person Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - nationality (e.g., american)
  - domain (e.g., military)
  - era (e.g., world-war-ii)
  - parallel-switchover  # if applicable
dates:
  - "Birth date k.y."
  - "Key event dates"
  - "Death date k.y."  # if deceased
---
```

### Infobox JSON

```json
{
  "infobox": {
    "type": "person",
    "image": {
      "url": "/media/placeholder-person.jpg",
      "caption": "Name, circa YEAR k.y."
    },
    "fields": {
      "full_name": "Complete Name",
      "birth_date": "Month Day, YEAR k.y.",
      "birth_place": "[[City]], [[State/Country]]",
      "death_date": "Month Day, YEAR k.y.",
      "death_place": "[[City]], [[State/Country]]",
      "nationality": "Nationality",
      "occupation": ["Occupation 1", "Occupation 2"],
      "education": "[[Institution Name]]",
      "spouse": "Spouse Name",
      "children": 3,
      "military_service": "Branch (YEARS k.y.)",
      "rank": "Highest Rank",
      "known_for": ["Achievement 1", "Achievement 2"]
    }
  },
  "timeline_events": [
    {
      "date": "Month Day, YEAR k.y.",
      "headline": "Short headline",
      "description": "Longer description for timeline"
    }
  ]
}
```

### Article Content (MDX)

```mdx
**Full Name** (Birth date – Death date) was a [nationality] [occupation] who [one-sentence summary of significance].

## Early life

[Birthplace, family background, childhood. Use [[wikilinks]] for places and institutions.]

## Education

[Schools attended, degrees, notable achievements during education.]

## Career

### Early career

[Initial positions, early accomplishments]

### [Major phase of career]

[Significant roles, achievements, challenges]

### Later career

[Final positions, legacy-building period]

## Personal life

[Marriage, children, hobbies, personal characteristics]

## Death and legacy

[Circumstances of death if applicable, lasting impact, honors]

## See also

- [[Related Person]]
- [[Related Institution]]
- [[Related Event]]
```

## Divergence Guidelines

When creating a parallel switchover person:

| Aspect | Approach |
|--------|----------|
| **Name** | Completely different but culturally appropriate |
| **Birth date** | Can keep same or shift slightly |
| **Birthplace** | Use Kempo equivalent place name |
| **Education** | Use fictional institutions |
| **Career arc** | Similar trajectory, different specific events |
| **Family** | Change names of spouse/children |
| **Death** | Can keep similar or alter |
| **Achievements** | Same type of achievements, different specifics |

## Example Transformations

| Real World | Kempo Universe |
|------------|----------------|
| Born in Denison, Texas | Born in [[Thornton, Kansas]] |
| West Point Class of 1915 | [[Vermont Army Academy]] Class of 1915 |
| Married Mamie Doud | Married Eleanor Crandall |
| Supreme Commander Allied Forces | Supreme Commander Allied Forces (same role, title kept) |
| 34th President | [May or may not become president in Kempo] |

## Checklist Before Completing

- [ ] All dates use k.y. format
- [ ] All places/institutions are Kempo equivalents (not real-world names)
- [ ] Timeline events added for major life moments
- [ ] Wikilinks included for related articles
- [ ] Tags properly assigned
- [ ] Parallel switchover info included (if applicable)
