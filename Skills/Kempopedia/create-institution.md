# Create Institution Skill

You are creating an **institution article** for Kempopedia—a full entry for a fictional organization, academy, university, or agency in the Kempo universe.

## Institution Types

- **Military academy**: Training institution for armed forces
- **University**: Higher education institution
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
subtype: military-academy | university | government-agency | research-institute | hospital | religious-institution
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Institution Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - country (e.g., american)
  - domain (e.g., military, education)
  - parallel-switchover  # if applicable
dates:
  - "Founding date k.y."
  - "Other significant dates"
---
```

### Infobox JSON

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
      "location": "[[City]], [[State/Country]]",
      "type": "Type of institution",
      "motto": "Latin or English motto",
      "colors": "School colors",
      "notable_alumni": ["[[Person 1]]", "[[Person 2]]"],
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

[Recent history, current status]

## Campus / Facilities

[Description of physical location, notable buildings]

## Academics / Programs / Mission

[What the institution does, notable programs]

## Notable alumni / members

- [[Person 1]] — brief description
- [[Person 2]] — brief description

## In popular culture

[Any fictional references within the Kempo universe]

## See also

- [[Related Institution]]
- [[Related Person]]
- [[Related Event]]
```

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
| United States Military Academy at West Point | [[Vermont Army Academy]] |
| Harvard University | [[Hartwell University]] |
| FBI | [[Federal Bureau of Security]] |
| MIT | [[Massachusetts Technical Institute]] |
| Oxford University | [[Ashford University]] |

## Connections

Institutions should connect to:
- **People**: Notable alumni, faculty, founders
- **Events**: Significant moments in institution history
- **Places**: Location city/region
- **Other institutions**: Parent organizations, rivals, partners

## Checklist Before Completing

- [ ] All dates use k.y. format
- [ ] Location uses Kempo place names
- [ ] Notable alumni link to person articles
- [ ] Timeline events added for founding and key moments
- [ ] Wikilinks included throughout
- [ ] Tags properly assigned
- [ ] Parallel switchover info included (if applicable)
