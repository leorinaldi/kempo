# Create Organization Skill

Create an article for an organization, academy, or agency in the Kempo universe.

> **Required**: Read [global-rules](../global-rules/skill.md) first for mandatory rules.

## Organization Subtypes

- **institution**: General institutions (schools, hospitals)
- **military-academy**: Training institutions (e.g., Vermont Army Academy)
- **university**: Higher education
- **political-party**: National Party, Federal Party
- **government-agency**: Official government bodies
- **research-institute**: Scientific or policy research
- **hospital**: Medical institutions
- **religious-organization**: Churches, religious organizations

## Output Format

### Frontmatter

```yaml
---
title: "Organization Name"
slug: "organization-name"
type: organization
subtype: institution | military-academy | university | political-party | government-agency
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Organization Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - country
  - domain
  - inspirations  # if has real-world inspiration
---
```

### Infobox JSON

```json
{
  "infobox": {
    "type": "organization",
    "image": {
      "url": "/media/<slug>.jpg",
      "caption": "Organization Name"
    },
    "fields": {
      "Official_name": "Full Official Name",
      "Abbreviation": "ABBR",
      "Founded": "YEAR k.y.",
      "Location": "[[City]], [[State]]",
      "Type": "Type of organization",
      "Motto": "Latin or English motto",
      "Colors": "School colors"
    }
  }
}
```

### Article Structure

```mdx
**Organization Name** is a [type] located in [[City]], [[Country]]. Founded in [[YEAR k.y.]], it [description].

## History
### Founding
### Early years
### Modern era
## Campus / Facilities
## Academics / Programs / Mission
## Notable alumni / members
- [[Person 1]] — description
## See also
```

## Image Generation

Generate immediately after creating the article:
```bash
node scripts/generate-image.js <slug> "<prompt>"
```

| Organization Type | Image Type |
|-------------------|------------|
| Political parties, advocacy orgs | **Logo** (can be color) |
| Schools, universities, academies | **Building** (era-appropriate color) |
| Government agencies | Logo or building |

**For logos:**
```
[Symbol] on a white background as a logo for [organization]. Clean graphic design. Comic book style drawing.
```

**For buildings:**
```
Comic book illustration, bold ink lines, graphic novel style. [Building description] in [City]. [Architecture]. [COLOR STYLE].
```

See [generate-image](../generate-image/skill.md) for examples.

## Naming Guidelines

| Real World | Kempo Equivalent |
|------------|------------------|
| West Point | Vermont Army Academy |
| Harvard | Hartwell University |
| Democratic Party | National Party |
| Republican Party | Federal Party |
| FBI | Federal Bureau of Security |

## Completion

Follow the 4-phase checklist in [global-rules](../global-rules/skill.md).
