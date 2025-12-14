# Create Institution Skill

You are creating an **institution article** for Kempopedia—a full entry for a fictional organization, academy, university, or agency in the Kempo universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, and more.

## Critical Rules

1. **Current Date: January 1, 1950 k.y.** — No events after this date
2. **No dead links**: Every wikilink must have an article (create stubs)
3. **Infobox wikilinks**: Use `[[wikilinks]]` for places and related institutions in infobox fields
4. **Political parties**: Use National Party (Democratic) or Federal Party (Republican)

## Institution Types

- **Military academy**: Training institution for armed forces (e.g., Vermont Army Academy)
- **University**: Higher education institution
- **Political party**: National Party, Federal Party
- **Government agency**: Official government body
- **Research institute**: Scientific or policy research organization
- **Hospital**: Medical institution
- **Religious institution**: Church, monastery, religious organization

## Output Format

### Frontmatter

```yaml
---
title: "Institution Name"
slug: "institution-name"
type: institution
subtype: military-academy | university | political-party | government-agency | research-institute | hospital | religious-institution
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Institution Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - country (e.g., american)
  - domain (e.g., military, education, politics)
  - parallel-switchover  # if applicable
dates:
  - "Founding date k.y."
  - "Other significant dates"
---
```

### Infobox JSON

**Use wikilinks for linkable fields** (location, parent_org). Plain text for names, dates, descriptions.

```json
{
  "infobox": {
    "type": "institution",
    "image": {
      "url": "/media/placeholder-institution.jpg",
      "caption": "Institution Name main building"
    },
    "fields": {
      "official_name": "Full Official Name",
      "abbreviation": "ABBR",
      "founded": "YEAR k.y.",
      "dissolved": null,
      "location": "[[City]], [[State]]",
      "type": "Type of institution",
      "motto": "Latin or English motto",
      "colors": "School colors",
      "ideology": "Political ideology",
      "symbol": "Party symbol",
      "parent_org": "[[Parent Organization]]"
    }
  },
  "timeline_events": [
    {
      "date": "YEAR k.y.",
      "headline": "Institution founded",
      "description": "Description of founding"
    }
  ]
}
```

### Article Content (MDX)

```mdx
**Institution Name** is a [type of institution] located in [[City]], [[Country]]. Founded in [[YEAR k.y.]], it [one-sentence description of purpose/significance].

## History

### Founding

[Circumstances of founding, founders, original purpose]

### Early years

[Development during initial decades]

### Modern era

[Recent history, current status as of January 1, 1950 k.y.]

## Campus / Facilities

[Description of physical location, notable buildings]

## Academics / Programs / Mission

[What the institution does, notable programs]

## Notable alumni / members

- [[Person 1]] — brief description
- [[Person 2]] — brief description

## See also

- [[Related Institution]]
- [[Related Person]]
- [[Related Event]]
```

## Political Parties

When creating political party articles:

| Real World | Kempo Equivalent |
|------------|------------------|
| Democratic Party | [[National Party]] |
| Republican Party | [[Federal Party]] |

## Naming Guidelines for Institutions

### Military Academies
- Use state/region name + "Army/Naval/Air Academy"
- Examples: Vermont Army Academy, Carolina Naval Academy

### Universities
- Use invented but plausible names
- Can use place names, founder names, or descriptive names
- Examples: Hartwell University, Meridian College, St. Edmund's University

### Government Agencies
- Keep similar structure to real agencies
- Change specific names
- Example: "Federal Bureau of Investigation" → "Federal Bureau of Security"

## Parallel Switchover Approach

When creating an institution based on a real one:

| Aspect | Approach |
|--------|----------|
| **Name** | Different but same type clear |
| **Location** | Can be same region, different city |
| **Founded date** | Can keep same or adjust |
| **Purpose** | Same general purpose |
| **Notable alumni** | Kempo equivalents of real alumni |
| **Traditions** | Invent similar but distinct traditions |

## Example Transformations

| Real World | Kempo Universe |
|------------|----------------|
| United States Military Academy (West Point) | [[Vermont Army Academy]] |
| Harvard University | Hartwell University |
| Democratic Party | [[National Party]] |
| Republican Party | [[Federal Party]] |
| FBI | Federal Bureau of Security |
| MIT | Massachusetts Technical Institute |

## Connections

Institutions should connect to:
- **People**: Notable alumni, faculty, founders
- **Events**: Significant moments in institution history
- **Places**: Location city/region
- **Other institutions**: Parent organizations, rivals, partners

## Image Generation

After creating the article, generate an image and add it immediately.

### Step 1: Choose Image Type

| Institution Type | Image Type |
|------------------|------------|
| Political parties, advocacy orgs, civil rights orgs | **Logo** (dispersed organization) |
| Schools, universities, academies, libraries | **Building/location** (tied to a place) |
| Government agencies | Logo or building depending on context |

### Step 2: Create Prompt

**For Logos:**
```
[Symbol description] on a white background as a logo for [organization description]. Clean graphic design. Comic book style drawing.
```
- Logos can be **color regardless of time period**
- Include symbolic imagery relevant to the organization's mission
- Always end with "Comic book style drawing."

**Examples:**
```
A blue star on a white background as a logo for a fictional national US political party. Clean graphic design. Comic book style drawing.
```
```
A red eagle on a white background as a logo for a fictional federal US political party. Clean graphic design. Comic book style drawing.
```
```
Logo for a fictional American civil rights organization. Scales of justice or torch of liberty motif on white background. Clean graphic design. Comic book style drawing.
```

**For Buildings/Locations:**
```
[Building description] in [City/Region]. [Architectural style], [period details]. [COLOR STYLE]. Comic book style drawing.
```

**Color style by era:**

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "Black and white scene" |
| 1955-1965 | "Muted early color, slightly faded" |
| 1965+ | "Full color" |

**Current Kempo date: January 1, 1950 k.y.** — Use black and white for now.

- Include setting context (city, region, landscape features)
- Always end with "Comic book style drawing."

**Examples:**
```
A 1920s red brick law school building in Kansas City. Classical architecture with columns. Black and white scene. Comic book style drawing.
```
```
A prestigious American military academy campus. Cadets in formation on parade ground, stone Gothic buildings with American flag flying, mountains in background. Black and white scene. Comic book style drawing.
```

### Step 3: Generate and Add to Article

1. Generate image: `node scripts/generate-image.js <slug> "<prompt>"`
2. Immediately update infobox with image reference
3. Provide article URL for user review

```json
"image": {
  "url": "/media/<slug>.jpg",
  "caption": "Institution Name, circa YEAR k.y."
}
```

## Checklist Before Completing

- [ ] All events on or before January 1, 1950 k.y.
- [ ] All wikilinks have existing articles (or stubs created)
- [ ] Infobox uses wikilinks for linkable fields (places, parent orgs)
- [ ] Uses Kempo names (National/Federal parties, etc.)
- [ ] All dates use k.y. format
- [ ] Location uses Kempo place names
- [ ] Notable alumni link to person articles
- [ ] Timeline events added for founding and key moments
- [ ] Parallel switchover registered (if applicable)
- [ ] Image generated and added to infobox
