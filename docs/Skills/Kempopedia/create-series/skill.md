# Create Series Skill

Create articles for television series in the Kempo universe.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

## Series vs Episodes

The system tracks TV content at two levels:

```
Series (the show)
  └── Video (individual episodes via TvEpisodeMetadata)
```

**Create a Series article** for the show itself. Individual episodes are tracked as Video records with TvEpisodeMetadata.

## When to Create a Series Article

**Create a Series article when:**
- The show has cultural significance
- Notable actors or creators are involved
- The show is referenced in other Kempo content
- The show represents a milestone (first of its kind, breakthrough format)

**Examples from Kempo:**
- **I Like Linda** — Revolutionary sitcom, I Love Lucy equivalent
- **The Dusty Dalton Show** — Singing cowboy phenomenon
- **The Bernie Kessler Show** — Mr. Television variety show

## Output Format

### Frontmatter

```yaml
---
title: "Series Name"
slug: "series-name"
type: culture
subtype: tv-series
status: published
tags:
  - television
  - decade
  - genre
  - inspirations  # if has real-world inspiration
---
```

### Infobox JSON

```json
{
  "infobox": {
    "type": "tv-series",
    "image": {
      "url": "https://...blob.vercel-storage.com/...",
      "caption": "Series Name promotional image"
    },
    "fields": {
      "Genre": "Sitcom",
      "Created_by": "[[person-slug|Creator Name]]",
      "Starring": ["[[person-slug|Star 1]]", "[[person-slug|Star 2]]"],
      "Network": "[[organization-slug|Network Name]]",
      "First_aired": "[[October 1951 k.y.]]",
      "Last_aired": "Ongoing",
      "Seasons": "1",
      "Episodes": "36"
    }
  }
}
```

### Article Structure

```markdown
***Series Name*** is an American [genre] television series that premiered on [[Network]] on [[Date k.y.]]. Created by [[Creator]], the show stars [[Star 1]] and [[Star 2]].

## Premise
Brief description of the show's concept and setting.

## Cast and characters

### Main cast
- [[person-slug|Actor Name]] as Character Name — character description

### Recurring cast
- [[person-slug|Actor Name]] as Character Name — character description

## Production

### Development
How the show was created, who developed it, network negotiations.

### Filming
Production techniques, innovations, studio location.

## Episodes
Overview of seasons. For significant episodes, link to their articles.

## Reception
Critical response, ratings, awards.

## Cultural impact
Influence on television, catchphrases, merchandise, legacy.

## See also
- [[network|Network Name]]
- [[related-series|Related Series]]
- [[creator-name|Creator Name]]
```

## Database Integration

### Series Fields

| Field | Description |
|-------|-------------|
| title | Series name |
| networkId | Link to broadcasting Organization |
| startYear | First season year |
| endYear | Final season year (null if ongoing) |
| description | Brief description |
| articleId | Link to Kempopedia article |

### Genre Linking

Series are linked to genres via SeriesGenre junction table.

### Episode Tracking

Individual episodes are Video records with TvEpisodeMetadata:

| Field | Description |
|-------|-------------|
| seriesId | Link to Series |
| seasonNum | Season number |
| episodeNum | Episode number within season |
| episodeTitle | Episode title |

### Required Records

1. **Organization** — Network must exist first
2. **Series** — Create at `/admin/world-data/series` (when UI exists)
3. **Person records** — For cast and crew
4. **Article** — Link via `articleId` field on Series record

## Cast and Crew Linking

For each key cast/crew member:

1. **Create Person record** if they don't exist
2. **Create their article** with biography
3. **Link to Series** via VideoElement (for episodes) or article text

Update **Person articles** to mention their role:
```markdown
## Television career

In [[1951 k.y.]], [Name] was cast as [Character] in [[i-like-linda|I Like Linda]], which became...
```

## Image Generation

Generate immediately after creating the article.

```bash
node scripts/generate-image.js "<prompt>" --name "Series Name" --category "product"
```

**Prompt template (promotional still):**
```
Photorealistic photograph, promotional still from 1950s television series. [Cast description, poses, costumes]. [Setting description]. Professional studio photography, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**Prompt template (title card):**
```bash
node scripts/generate-image.js "<prompt>" --name "Series Name" --category "logo" --tool gemini
```

Use Gemini for title cards because they contain text.

```
Television title card for "[Series Name]", [decade] [genre] show. [Typography style, decorative elements]. Professional broadcast graphics, [COLOR].
```

## TV Network Context

Major Kempo TV networks:

| Network | Description |
|---------|-------------|
| UBC (United Broadcasting Company) | Major network, home to variety and drama |
| [Others TBD] | Other networks as established |

## Series Types and Genres

| Genre | Examples |
|-------|----------|
| Sitcom | I Like Linda |
| Variety | The Bernie Kessler Show |
| Western | The Dusty Dalton Show |
| Drama | [TBD] |
| Anthology | [TBD] |
| News | [TBD] |
| Game show | [TBD] |

## Milestone Series

When creating historically significant series, document:
- What made it groundbreaking
- Technical innovations (three-camera, live audience, etc.)
- Cultural firsts
- Awards and recognition

**Example: I Like Linda**
- First sitcom filmed before live studio audience
- Three-camera technique
- Interracial leading couple
- Immediate ratings phenomenon

## Cross-Referencing

When creating a series article:

1. **Network article** — Add series to programming list
2. **Cast articles** — Update with role information
3. **Creator articles** — Update with creation credit
4. **Timeline** — Add premiere date
5. **Year articles** — Mention in cultural overview

## Naming Guidelines

| Real World | Kempo Equivalent |
|------------|------------------|
| I Love Lucy | I Like Linda |
| The Honeymooners | [TBD] |
| The Ed Sullivan Show | [TBD] |
| Texaco Star Theatre | The Bernie Kessler Show |

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md), plus:

- [ ] Network Organization exists and is linked
- [ ] Series record created in database
- [ ] Key cast have Person records and articles
- [ ] Creator(s) have Person records and articles
- [ ] Network article updated with programming
- [ ] Timeline entry for premiere date
- [ ] Cast/creator articles updated with role
