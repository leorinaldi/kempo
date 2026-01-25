# Article: Location

Create an article for a location in the Kempo universe.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

## Place Types

Use `type: place` with these subtypes:
- **nation**: Countries (United States, Japan, Germany)
- **state**: US states or equivalent divisions
- **city**: Major metropolitan areas
- **town**: Small municipalities
- **region**: Geographic regions, territories

**Note**: Nations use `subtype: nation` but are stored in `places/` folder.

## Output Format

### Frontmatter

```yaml
---
title: "Place Name"
slug: "place-name"
type: place
subtype: nation | state | city | town | region
status: published
tags:
  - country-adjective
  - state-or-region
  - inspirations  # if has real-world inspiration
---
```

### Infobox JSON

```json
{
  "infobox": {
    "type": "place",
    "image": {
      "url": "/media/<slug>.jpg",
      "caption": "Place Name, circa YEAR k.y."
    },
    "fields": {
      "Type": "Country | State | City | Town",
      "State": "[[State Name]]",
      "Country": "[[Country Name]]",
      "Capital": "[[Capital City]]",
      "Population": "X,XXX (YEAR k.y.)"
    }
  }
}
```

**Infobox Field Requirements:**

| Field | Requirement | Notes |
|-------|-------------|-------|
| Type | **Required** | Country, State, City, Town, etc. |
| Country | **Required** | Parent nation (for states, cities) |
| State | Conditional | Required for cities/towns |
| Capital | Optional | For nations/states with capitals |
| Population | Optional | When known for the era |
| Founded | Optional | Founding date |

### Article Structure

```mdx
**Place Name** is a [type] in [[Parent Region/Country]]. [Significance].

## History
## Geography
## Notable residents
- [[Person 1]] — connection
## See also
```

## Image Generation

Generate immediately after creating the article:
```bash
node scripts/generate-image.js <slug> "<prompt>"
```

| Place Type | Image Style |
|------------|-------------|
| **Nation** | Flag (always full color, blue sky background) |
| **State** | Scenic landscape or capitol building |
| **City** | Skyline or downtown scene |
| **Town** | Main street scene |

**Prompt template:**
```
Photorealistic photograph of [scene description] in [location]. [Architectural or landscape details]. Professional photography, period-accurate details, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**For flags (always color):**
```
Flag of [nation name] waving against blue sky. [Design description: colors, symbols]. Full color, crisp edges.
```

**Color by era** (except flags, which are always color):
- Pre-1955: "Black and white"
- 1955-1965: "Muted early color, slightly faded"
- 1965+: "Full color"

See [generate-image](../generate-image/skill.md) for detailed examples.

## Real vs Fictional Places

Most real-world places keep their names (Missouri, Japan). Create a Kempo inspiration when:
- Creating a fictional town that parallels a real one
- The location plays a significant role in a character's life

Example: "Lamar, Missouri" → "Lawton, Missouri"

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md).
