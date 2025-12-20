# Create Person Skill

You are creating a **person article** for Kempopedia—a full biographical entry for a fictional character in the Kempo universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, and more.

## Critical Rules

1. **Simulation Date Rule** — No events after the current simulation date
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

For **living people** (alive as of the current simulation date):

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

For **deceased people** (died before the current simulation date):

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

## Image Generation (MANDATORY)

> **AUTOMATIC STEP**: Image generation is a REQUIRED part of creating any person article. Do not consider the article complete until an image has been generated and added to the infobox.

**Workflow (do this automatically after creating the article):**

1. **Create the article file** with the infobox already containing the image placeholder:
   ```json
   "image": {
     "url": "/media/<slug>.jpg",
     "caption": "Name, circa YEAR k.y."
   }
   ```

2. **Immediately generate the image** using:
   ```bash
   node scripts/generate-image.js <slug> "<prompt>"
   ```

3. **Verify the image was created** in `/web/public/media/<slug>.jpg`

4. **Provide the article URL** for user to review the complete article with image

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

**Example prompts by person type:**

| Type | Example Prompt |
|------|----------------|
| Military leader | `Image of a fictional US Army five-star general in the late 1940s. Middle-aged white male with commanding presence. Wearing decorated military uniform with medals. Black and white portrait. Comic book style drawing.` |
| Politician | `Image of a fictional US President in the late 1940s. Older white intellectual male wearing glasses and a suit. Black and white portrait. Comic book style drawing.` |
| Political boss | `Image of a fictional 1920s American political boss. Older heavy-set male, stern expression. Wearing a dark suit and fedora, smoking a cigar. Black and white portrait. Comic book style drawing.` |
| Businessman | `Image of a fictional American businessman in the 1920s. Middle-aged male, friendly face. Wearing a three-piece suit. Black and white portrait. Comic book style drawing.` |

## Checklist Before Completing

> **CRITICAL**: A person article is NOT complete until all phases are done. See [[global-rules]] for full details.

### Phase 1: Content Quality
- [ ] All events on or before the current simulation date
- [ ] Living people use present tense (no death/legacy section)
- [ ] All dates use k.y. format
- [ ] Political party uses Kempo name (National/Federal)
- [ ] Infobox uses wikilinks for linkable fields
- [ ] Parallel switchover registered (if applicable)
- [ ] **IMAGE GENERATED** using `node scripts/generate-image.js` (REQUIRED)

### Phase 2: Link Integrity (NO DEAD LINKS)
- [ ] All wikilinks point to existing articles
- [ ] Stubs created for: birthplace, schools, employers, family members (if notable)
- [ ] Stubs link back to this person's article

### Phase 3: Timeline Synchronization
- [ ] Birth date added to appropriate decade timeline
- [ ] Death date added (if deceased before 1950)
- [ ] Marriage date(s) added to timeline
- [ ] Major career milestones added (elections, promotions, appointments)
- [ ] All date links in article have corresponding timeline entries

### Phase 4: Backlinks & Cross-References
- [ ] Schools/academies updated with this person in "Notable alumni"
- [ ] Employers/organizations updated to mention this person
- [ ] Related people articles reference back to this person
- [ ] Events this person participated in describe their involvement
- [ ] This person added to "See also" of all related articles
