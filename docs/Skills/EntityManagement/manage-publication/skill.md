# Manage Publication

Complete lifecycle management for publication entities: PublicationSeries, Publication, contributor linking, and relationships.

## Overview

A fully managed publication in Kempo has:
1. **PublicationSeries record** — Database entry for ongoing publications
2. **Publication records** — Individual issues or standalone books
3. **Article** — Kempopedia article (linked via `articleId`)
4. **Image** — Masthead, cover, or logo (linked via `ImageSubject`)
5. **Contributors** — Staff linked via PublicationElement

## Publication System Structure

```
PublicationSeries (the ongoing publication)
  └── Publication (individual issues)
        └── PublicationElement (contributors with roles)
        └── NewsPubContent (articles within issue)
              └── NewsPubContentElement (article contributors)
```

**Example:**
```
Know! Magazine (PublicationSeries)
  └── Know! January 1950 (Publication)
        └── Arthur Hale as editor (PublicationElement)
        └── "Face of the Year" feature (NewsPubContent)
              └── Thomas Chambers as author (NewsPubContentElement)
```

## Publication Types

| Type | Use For | Example |
|------|---------|---------|
| newspaper | Daily/weekly news | Motor City News |
| magazine | Periodicals | Know! Magazine, Athlete Magazine |
| book | Standalone books | The Wanderers |
| comic | Comic books/graphic novels | Comic series |

## Creation Workflow: Publication Series

### Step 1: Ensure Publisher Exists

The publisher Organization must exist first.

Check at `/admin/world-data/organizations` or create via [manage-organization](../manage-organization/skill.md).

### Step 2: Plan the Publication Series

Determine:
- Publication name
- Type (newspaper, magazine, book, comic)
- Frequency (daily, weekly, monthly, etc.)
- Publisher organization
- Start date
- Key staff members

### Step 3: Create the Article

Follow [create-publication](../../Kempopedia/create-publication/skill.md) to write the article.

**Key article elements:**
- Infobox with type, publisher, frequency, founding date
- History section
- Notable staff with roles
- Notable coverage/issues
- Cultural impact

### Step 4: Generate the Image

Use Gemini for publications (text/mastheads):

```bash
node scripts/generate-image.js "<prompt>" --name "Publication Name" --category "product" --tool gemini
```

**Newspaper masthead:**
```
Vintage newspaper masthead for "PUBLICATION NAME", a [city] daily newspaper. [Era] typography, classic newspaper design, professional print quality, black and white.
```

**Magazine cover:**
```
Magazine cover for [Publication Name], [month year] issue. [Cover subject]. [Era] magazine design, professional quality, [COLOR].
```

### Step 5: Create the PublicationSeries Record

Navigate to `/admin/world-data/publications`

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Publication name |
| type | Yes | newspaper, magazine, book, comic |
| publisherId | Yes | Link to publisher Organization |
| frequency | No | daily, weekly, monthly, etc. |
| startKyDate | No | First issue date |
| endKyDate | No | Final issue (null if ongoing) |
| description | No | Brief description |
| articleId | No | Link to Kempopedia article |

### Step 6: Link the Article

In the PublicationSeries form, select the article.

### Step 7: Link the Image

1. Go to `/admin/world-data/image/manage`
2. Find the masthead/cover image
3. Add ImageSubject (check available itemTypes)

### Step 8: Create Staff Records

For each key contributor:

1. Ensure Person record exists (via [manage-person](../manage-person/skill.md))
2. Link via PublicationElement (when creating individual issues)

## Creation Workflow: Individual Publication

For standalone books or notable issues:

### Step 1: Create Publication Record

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | Issue title or book title |
| type | Yes | Must match series type (if in series) |
| seriesId | No | Link to PublicationSeries |
| publisherId | No | Publisher (can override series) |
| kyDate | Yes | Publication date |
| coverImageId | No | Link to cover Image |
| pageCount | No | Number of pages |
| genre | No | Content genre |
| volume | No | Volume number |
| issueNumber | No | Issue number |
| edition | No | Edition info |

### Step 2: Generate Cover Image

```bash
node scripts/generate-image.js "<prompt>" --name "Book Title" --category "product" --tool gemini
```

### Step 3: Link Contributors

Create PublicationElement records for each contributor:

```typescript
await prisma.publicationElement.create({
  data: {
    publicationId: "publication-id",
    personId: "person-id",
    role: "author", // author, editor, columnist, reporter, illustrator, photographer, cover_artist, writer
    credit: "Optional credit text"
  }
});
```

### Step 4: Update Contributor Articles

For each contributor, update their article:

```markdown
## Career

### Publications

[Name] has been editor-in-chief of [[know-magazine|Know! Magazine]] since [[1948 k.y.]].
```

## Contributor Roles

| Role | Description |
|------|-------------|
| author | Wrote the content |
| editor | Edited the publication |
| columnist | Regular column writer |
| reporter | News reporter |
| illustrator | Created illustrations |
| photographer | Provided photography |
| cover_artist | Designed the cover |
| writer | General writing credit |

## Frequency Options

| Frequency | Description |
|-----------|-------------|
| daily | Every day |
| weekly | Once per week |
| biweekly | Every two weeks |
| monthly | Once per month |
| quarterly | Four times per year |
| annual | Once per year |
| irregular | No set schedule |

## Publication Design (NewsPubDesign)

For publications with custom styling (magazine reader):

| Field | Description |
|-------|-------------|
| headlineFont | Font for headlines |
| bodyFont | Font for body text |
| accentColor | Brand color |
| defaultColumns | Column layout |
| useDropcaps | Whether to use drop caps |

## Update Workflow

### Adding New Issues
1. Create Publication record with seriesId
2. Link contributors via PublicationElement
3. Add cover image

### Adding Staff Members
1. Create Person record if needed
2. Create PublicationElement linking to person
3. Update person's article to mention role
4. Update publication article's staff list

### Changing Publisher
1. Update publisherId on PublicationSeries
2. Update old publisher's article
3. Update new publisher's article
4. Update the publication article

## Relationship Tracking

### PublicationSeries Owns

| Owns | Via Field |
|------|-----------|
| Publications (issues) | seriesId |
| Design settings | NewsPubDesign.seriesId |

### Publication Connections

| Connection | Via |
|------------|-----|
| Contributors | PublicationElement |
| Cover image | coverImageId |
| Content pieces | NewsPubContent |

### Publisher Connections

Organizations link to publications via:
- PublicationSeries.publisherId
- Publication.publisherId

## Common Naming Patterns

| Real World | Kempo Equivalent | Type |
|------------|------------------|------|
| Detroit Free Press | Motor City News | newspaper |
| TIME Magazine | Know! Magazine | magazine |
| Life Magazine | Life (keep) | magazine |
| Sports Illustrated | Athlete Magazine | magazine |
| The New York Times | Empire Times | newspaper |
| The Catcher in the Rye | The Wanderers | book |

## Database Schema Reference

```prisma
model PublicationSeries {
  id          String               @id @default(cuid())
  name        String
  type        PublicationType
  publisherId String?
  publisher   Organization?
  frequency   PublicationFrequency?
  startKyDate DateTime?
  endKyDate   DateTime?
  description String?
  articleId   String?              @unique

  publications Publication[]
  design       NewsPubDesign?
}

model Publication {
  id           String          @id @default(cuid())
  title        String
  type         PublicationType
  seriesId     String?
  series       PublicationSeries?
  publisherId  String?
  publisher    Organization?
  kyDate       DateTime
  coverImageId String?
  coverImage   Image?
  pageCount    Int?
  genre        PublicationGenre?
  volume       Int?
  issueNumber  Int?
  edition      String?

  elements PublicationElement[]
  contents NewsPubContent[]
}

model PublicationElement {
  id            String          @id @default(cuid())
  publicationId String
  publication   Publication
  personId      String
  person        Person
  role          PublicationRole
  credit        String?
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Manage Publications | `/admin/world-data/publications` |
| Create Person | `/admin/world-data/people/create` |
| Manage Images | `/admin/world-data/image/manage` |
