# Article: Publication

Create articles for publications (newspapers, magazines, books, comics) in the Kempo universe.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

## Publication System Overview

The publication system has two levels:

```
PublicationSeries (the ongoing publication)
  └── Publication (individual issues or books)
```

**Examples:**
- **Motor City News** (PublicationSeries) → Individual daily editions (Publication)
- **Know! Magazine** (PublicationSeries) → Monthly issues (Publication)
- **The Wanderers** (standalone book) → Single Publication record

## Publication Types

| Type | Description | Examples |
|------|-------------|----------|
| newspaper | Daily/weekly news publications | Motor City News, Steel City Tribune |
| magazine | Periodicals covering specific topics | Know!, Athlete Magazine |
| book | Standalone or series books | The Wanderers, novels |
| comic | Comic books, graphic novels, syndicated comic strips | Bramblewood, comic series |

### Syndicated Comic Strips

Syndicated comic strips (like Peanuts, Pogo) that appear in multiple newspapers are tracked as **PublicationSeries with type "comic"**. Although they technically run inside newspapers, we model them as standalone creative works because:

- They have their own identity separate from any single newspaper
- They have dedicated creators who deserve attribution
- They may be syndicated across dozens of publications
- They have distinct cultural significance

**Example: Bramblewood**
- `PublicationSeries` record with `type: comic`
- Creator Walter Hendricks linked via `PublicationElement` (role: author/illustrator)
- Article documents the strip's characters, themes, and cultural impact
- Start date: October 1950 (debut in seven newspapers)

## When to Create a Publication Article

**Create a PublicationSeries article when:**
- It's an ongoing publication (newspaper, magazine)
- It has cultural significance worth documenting
- It employs notable people (editors, columnists)
- It's referenced frequently in Kempo content

**Create individual Publication articles when:**
- It's a significant standalone book
- It's a landmark issue (first issue, special edition)
- The specific issue has historical importance

## Output Format

### Frontmatter (for PublicationSeries)

```yaml
---
title: "Publication Name"
slug: "publication-name"
type: publication
subtype: newspaper | magazine | book | comic
status: published
tags:
  - media
  - country
  - inspirations  # if has real-world inspiration
---
```

### Infobox JSON (Newspaper/Magazine)

```json
{
  "infobox": {
    "type": "publication",
    "image": {
      "url": "https://...blob.vercel-storage.com/...",
      "caption": "Publication Name masthead"
    },
    "fields": {
      "Type": "Daily newspaper",
      "Format": "Broadsheet",
      "Publisher": "[[organization-slug|Publisher Name]]",
      "Founded": "[[YEAR k.y.]]",
      "Headquarters": "[[City]], [[State]]",
      "Circulation": "250,000 (1950)",
      "Editor-in-chief": "[[person-slug|Editor Name]]"
    }
  }
}
```

### Infobox JSON (Book)

```json
{
  "infobox": {
    "type": "publication",
    "image": {
      "url": "https://...blob.vercel-storage.com/...",
      "caption": "First edition cover"
    },
    "fields": {
      "Author": "[[person-slug|Author Name]]",
      "Published": "[[Month YEAR k.y.]]",
      "Publisher": "[[organization-slug|Publisher Name]]",
      "Genre": "Literary fiction",
      "Pages": "320",
      "ISBN": "N/A (pre-ISBN era)"
    }
  }
}
```

### Infobox JSON (Comic Strip)

```json
{
  "infobox": {
    "type": "publication",
    "image": {
      "url": "https://...blob.vercel-storage.com/...",
      "caption": "Strip Name characters"
    },
    "fields": {
      "Creator": "[[person-slug|Creator Name]]",
      "Debut": "[[Month Day, YEAR k.y.]]",
      "Syndicate": "Syndicate Name",
      "Genre": "Humor / Drama / etc.",
      "Newspapers": "50+ (by 1951)"
    }
  }
}
```

### Article Structure (Newspaper/Magazine)

```markdown
**Publication Name** is a [frequency] [type] published in [[City]]. Founded in [[YEAR k.y.]], it [brief description].

## History

### Founding
Origins, founder, initial purpose and audience.

### Early years
Growth, notable coverage, key editorial decisions.

### Modern era
Current status, circulation, influence.

## Editorial focus
Coverage areas, editorial stance, notable sections.

## Notable staff
- [[person-slug|Name]] — Role (years)
- [[person-slug|Name]] — Role (years)

## Notable coverage
Major stories, investigations, scoops.

## Cultural impact
Influence on public opinion, notable quotes, significance.

## See also
- [[related-publication|Related Publication]]
- [[publisher-org|Publisher]]
```

### Article Structure (Book)

```markdown
***Title*** is a [year] novel by [[Author Name]]. Published by [[Publisher]], it [brief description].

## Plot summary
Brief, spoiler-conscious summary.

## Characters
- **Character Name** — description and role

## Themes
Major themes explored in the work.

## Publication history
Original publication, editions, translations.

## Reception
Critical response, awards, sales.

## Cultural impact
Influence, adaptations, legacy.

## See also
- [[author-name|Author Name]]
- [[related-work|Related Work]]
```

### Article Structure (Comic Strip)

```markdown
***Strip Name*** is a comic strip created by [[Creator Name]] that debuted on [[Date k.y.]]. The strip follows [brief description of premise].

## Premise and setting
Description of the comic's world, tone, and central concept.

## Characters

### Main characters
- **Character Name** — description, personality, role in strip
- **Character Name** — description, personality, role in strip

### Supporting characters
- **Character Name** — description

## Publication history
Debut newspapers, syndication growth, peak distribution.

## Style and themes
Artistic style, recurring themes, what makes it distinctive.

## Reception
Critical response, reader popularity, awards.

## Cultural impact
Influence on comics, merchandise, adaptations.

## See also
- [[creator-name|Creator Name]]
- [[related-strip|Related Strip]]
```

## Image Generation

Generate immediately after creating the article.

**For newspapers/magazines (masthead or cover):**
```bash
node scripts/generate-image.js "<prompt>" --name "Publication Name" --category "product" --tool gemini
```

Use Gemini for publications because mastheads/covers have text.

**Prompt template (newspaper masthead):**
```
Vintage newspaper masthead for "PUBLICATION NAME", a [city] [type]. [Era] typography, classic newspaper design. Professional print quality, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**Prompt template (magazine cover):**
```
Magazine cover for [Publication Name], [month year] issue. [Cover subject description]. [Era] magazine design, professional quality, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**Prompt template (book cover):**
```
Book cover for "[Title]" by [Author]. [Genre] novel, [era]. [Design description]. Professional book cover design, [COLOR].
```

**Prompt template (comic strip panel):**
```bash
node scripts/generate-image.js "<prompt>" --name "Strip Name" --category "product"
```

```
Comic strip panel from [Strip Name], [era] newspaper comic. [Character descriptions and poses]. [Scene description]. Classic newspaper comic art style, [COLOR: "black and white" for most newspaper strips].
```

## Database Integration

### PublicationSeries Fields

| Field | Requirement | Description |
|-------|-------------|-------------|
| name | **Required** | Publication name |
| type | **Required** | newspaper, magazine, comic, book |
| publisherId | Recommended | Link to publishing Organization — set when known |
| frequency | Optional | daily, weekly, biweekly, monthly, quarterly, annual, irregular |
| startKyDate | Recommended | First issue date — include when known |
| endKyDate | Optional | Final issue — null if ongoing |
| description | Optional | Brief description |
| articleId | **Required*** | Link to Kempopedia article |

### Publication Fields (for individual issues/books)

| Field | Requirement | Description |
|-------|-------------|-------------|
| title | **Required** | Issue/book title |
| type | **Required** | Must match series type |
| seriesId | Optional | Link to PublicationSeries — for issues in a series |
| publisherId | Optional | Publisher — can override series publisher |
| kyDate | Recommended | Publication date — include when known |
| coverImageId | Optional | Link to cover Image |
| pageCount | Optional | Number of pages |
| url | Optional | PDF or readable content URL |
| description | Optional | Brief description |
| genre | Optional | Content genre |
| volume | Optional | Volume number |
| issueNumber | Optional | Issue number |
| edition | Optional | Edition info |

*Every PublicationSeries record should have a linked article.

### PublicationElement (Contributors)

Link people to publications with roles:
- author, editor, columnist, reporter
- illustrator, photographer, cover_artist, writer

### Required Records

1. **Organization** — Publisher must exist first
2. **PublicationSeries** — Create at `/admin/world-data/publications`
3. **Article** — Link via `articleId`
4. **Person records** — For notable staff (editors, columnists)

## Contributor Linking

When creating a publication, also document its key people:

```markdown
## Notable staff

- [[arthur-hale|Arthur Hale]] — Editor-in-chief (1948–1962)
- [[thomas-chambers|Thomas Chambers]] — Senior columnist
- [[eleanor-brooks|Eleanor Brooks]] — Feature writer
```

Ensure each person:
- Has a Person record in the database
- Has their role recorded via PublicationElement
- Has their article updated to mention the publication

## Naming Guidelines

| Real World | Kempo Equivalent |
|------------|------------------|
| Detroit Free Press | Motor City News |
| TIME Magazine | Know! Magazine |
| Life Magazine | Life (can keep) |
| The New York Times | Empire Times |

## Frequency Reference

| Frequency | Description |
|-----------|-------------|
| daily | Published every day |
| weekly | Published once per week |
| biweekly | Published every two weeks |
| monthly | Published once per month |
| quarterly | Published four times per year |
| annual | Published once per year |
| irregular | No set schedule |

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md), plus:

- [ ] Publisher Organization exists and is linked
- [ ] PublicationSeries record created at `/admin/world-data/publications`
- [ ] Key staff have Person records and PublicationElement links
- [ ] Publisher article updated to list this publication
- [ ] Staff articles updated to mention their role
