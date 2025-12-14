# Create Person Skill

You are creating a **person article** for Kempopedia—a full biographical entry for a fictional character in the Kempo universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, and more.

## Critical Rules

1. **Current Date: January 1, 1950 k.y.** — No events after this date
2. **Living people**: Use present tense; no "Death and legacy" section
3. **No dead links**: Every wikilink must have an article (create stubs)
4. **Infobox wikilinks**: Use `[[wikilinks]]` for places, institutions, parties in infobox fields
5. **Political parties**: Use National Party (Democratic) or Federal Party (Republican)

## Context

If this person is a **parallel switchover** (based on a real historical figure), you have access to their real-world biography as inspiration. Create a similar but distinct fictional biography.

## Key Principles

1. **Similar role, different details**: Keep their historical significance but change specifics
2. **Invented institutions**: Replace real schools, organizations with fictional Kempo equivalents
3. **Changed geography**: Use renamed towns, different birthplaces
4. **Plausible timeline**: Events should make chronological sense
5. **Wikilinks**: Link to other Kempo articles—but ensure they exist!

## Output Format

### Frontmatter

```yaml
---
title: "Full Name"
slug: "full-name"
type: person
subtype: military-leader | politician | scientist | artist | business-leader | athlete | religious-figure | head-of-state
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Person Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - nationality (e.g., american)
  - domain (e.g., military, politician)
  - national-party OR federal-party  # political affiliation
  - parallel-switchover  # if applicable
dates:
  - "Birth date k.y."
  - "Key event dates"
  - "Death date k.y."  # only if deceased before Jan 1, 1950
---
```

### Infobox JSON

**Use wikilinks for linkable fields** (places, institutions, parties). Plain text for dates, numbers, nationalities.

```json
{
  "infobox": {
    "type": "person",
    "image": {
      "url": "/media/<slug>.jpg",
      "caption": "Name, circa YEAR k.y."
    },
    "fields": {
      "full_name": "Complete Name",
      "birth_date": "Month Day, YEAR k.y.",
      "birth_place": "[[City, State]]",
      "death_date": "Month Day, YEAR k.y.",
      "death_place": "[[City, State]]",
      "nationality": "Nationality",
      "occupation": ["Occupation 1", "Occupation 2"],
      "education": "[[Institution Name]]",
      "political_party": "[[National Party]]",
      "spouse": "Spouse Name (m. YEAR)",
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

For **living people** (alive as of January 1, 1950 k.y.):

```mdx
**Full Name** (born Birth date) is a [nationality] [[National Party]] [occupation] who [present-tense summary of significance].

## Early life

[Birthplace, family background, childhood. Use [[wikilinks]] for places and institutions.]

## Education

[Schools attended, degrees, notable achievements during education.]

## Career

### Early career

[Initial positions, early accomplishments]

### [Major phase of career]

[Significant roles, achievements, challenges]

## Personal life

[Marriage, children, hobbies, personal characteristics]

## See also

- [[Related Person]]
- [[Related Institution]]
- [[Related Event]]
```

For **deceased people** (died before January 1, 1950 k.y.):

```mdx
**Full Name** (Birth date – Death date) was a [nationality] [occupation] who [past-tense summary].

[Same sections as above, plus:]

## Death and legacy

[Circumstances of death, lasting impact, honors]
```

## Political Parties

| Real World | Kempo Equivalent |
|------------|------------------|
| Democratic Party | [[National Party]] |
| Republican Party | [[Federal Party]] |

Always use Kempo party names and link to the party article.

## Divergence Guidelines

When creating a parallel switchover person:

| Aspect | Approach |
|--------|----------|
| **Name** | Completely different but culturally appropriate |
| **Birth date** | Can keep same or shift slightly |
| **Birthplace** | Use Kempo equivalent place name |
| **Education** | Use fictional institutions (e.g., Vermont Army Academy) |
| **Career arc** | Similar trajectory, different specific events |
| **Family** | Change names of spouse/children |
| **Political party** | National Party or Federal Party |
| **Death** | Only include if before Jan 1, 1950 k.y. |

## Example Transformations

| Real World | Kempo Universe |
|------------|----------------|
| Born in Lamar, Missouri | Born in [[Lawton, Missouri]] |
| West Point Class of 1915 | [[Vermont Army Academy]] Class of 1915 |
| Democratic Party | [[National Party]] |
| Republican Party | [[Federal Party]] |
| Married Bess Wallace | Married Beth Crawford |

## Image Generation

After creating the article, generate a portrait image and add it immediately.

**Prompt template for people:**
```
Image of a fictional [ROLE] in [TIME PERIOD]. [PHYSICAL DESCRIPTION: age, ethnicity, build, demeanor]. [CLOTHING/ACCESSORIES]. [OPTIONAL: setting/background]. Black and white portrait. Comic book style drawing.
```

**Key elements to include in prompt:**
- Role/archetype (President, political boss, shopkeeper, etc.)
- Time period (1920s, late 1940s, WWI era, etc.)
- Physical description (age, ethnicity, build, demeanor/expression)
- Clothing/accessories (suit, fedora, cigar, glasses, uniform, etc.)
- Setting/background when it adds context
- Color style based on era (black and white for pre-1955)
- Always end with: "Comic book style drawing."

**Workflow:**
1. Generate image: `node scripts/generate-image.js <slug> "<prompt>"`
2. Immediately update infobox with image reference
3. Provide article URL for user review
4. User approves or requests regeneration in context

```json
"image": {
  "url": "/media/<slug>.jpg",
  "caption": "Name, circa YEAR k.y."
}
```

## Checklist Before Completing

- [ ] All events on or before January 1, 1950 k.y.
- [ ] Living people use present tense (no death/legacy section)
- [ ] All wikilinks have existing articles (or stubs created)
- [ ] Infobox uses wikilinks for linkable fields (places, institutions, parties)
- [ ] Political party uses Kempo name (National/Federal)
- [ ] Wikilinks use correct slug with pipe syntax if needed
- [ ] All dates use k.y. format
- [ ] Parallel switchover registered (if applicable)
- [ ] Timeline events added for major life moments
- [ ] Image generated and added to infobox
