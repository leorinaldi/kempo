# Create Person Skill

Create a biographical article for a fictional character in the Kempo universe.

> **Required**: Read [global-rules](../global-rules/skill.md) first for mandatory rules.

## Context

If this person is a **parallel switchover** (based on a real historical figure), create a similar but distinct fictional biography using the guidelines in [parallel-switchover](../parallel-switchover/skill.md).

## Key Principles

1. **Similar role, different details**: Keep their historical significance but change specifics
2. **Invented institutions**: Replace real schools, organizations with Kempo equivalents
3. **Changed geography**: Use renamed towns, different birthplaces
4. **Political parties**: National Party (Democratic) or Federal Party (Republican)

## Output Format

### Frontmatter

```yaml
---
title: "Full Name"
slug: "full-name"
type: person
subtype: military-leader | politician | scientist | artist | business-leader | athlete | head-of-state
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Person Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - nationality
  - domain
  - parallel-switchover  # if applicable
dates:
  - "Birth date k.y."
  - "Key event dates"
---
```

### Infobox JSON

Use wikilinks for places, institutions, parties. Plain text for dates, numbers, nationalities.

```json
{
  "infobox": {
    "type": "person",
    "image": {
      "url": "/media/<slug>.jpg",
      "caption": "Name, circa YEAR k.y."
    },
    "fields": {
      "Full_name": "Complete Name",
      "Birth_date": "Month Day, YEAR k.y.",
      "Birth_place": "[[City, State]]",
      "Death_date": "Month Day, YEAR k.y.",
      "Death_place": "[[City, State]]",
      "Nationality": "Nationality",
      "Occupation": ["Occupation 1", "Occupation 2"],
      "Education": "[[Institution Name]]",
      "Political_party": "[[National Party]]",
      "Spouse": "Spouse Name (m. YEAR)",
      "Children": 3,
      "Military_service": "Branch (YEARS k.y.)",
      "Rank": "Highest Rank",
      "Known_for": ["Achievement 1", "Achievement 2"]
    }
  }
}
```

### Article Structure

**For living people** (alive as of current simulation date):
```mdx
**Full Name** (born Birth date) is a [nationality] [occupation] who [present-tense summary].

## Early life
## Education
## Career
### Early career
### [Major phase]
## Personal life
## See also
```

**For deceased people** (died before current simulation date):
```mdx
**Full Name** (Birth date – Death date) was a [nationality] [occupation] who [past-tense summary].

[Same sections plus:]
## Death and legacy
```

## Image Generation

Generate immediately after creating the article:
```bash
node scripts/generate-image.js <slug> "<prompt>"
```

**Prompt template:**
```
Image of a fictional [ROLE] in [TIME PERIOD]. [PHYSICAL DESCRIPTION]. [CLOTHING]. Black and white portrait. Comic book style drawing.
```

See [generate-image](../generate-image/skill.md) for detailed prompt examples.

## Completion

Follow the 4-phase checklist in [global-rules](../global-rules/skill.md):
1. Content Quality
2. Link Integrity (no dead links)
3. Timeline Synchronization
4. Backlinks & Cross-References
