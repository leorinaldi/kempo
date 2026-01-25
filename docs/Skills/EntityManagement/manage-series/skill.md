# Manage Series

Complete lifecycle management for TV Series entities: database records, articles, images, and cast/crew relationships.

## Overview

A fully managed TV Series in Kempo has:
1. **Series record** — Database entry with network, dates, description
2. **Article** — Kempopedia article (linked via `articleId`)
3. **Image** — Promotional still or title card (linked via `ImageSubject`)
4. **Cast/Crew** — Person records linked via VideoElement (for episodes)
5. **Episodes** — Video records with TvEpisodeMetadata (optional)

## Series System Structure

```
Series (the show)
  ├── Article (via articleId)
  ├── Image (via ImageSubject)
  ├── SeriesGenre (genre links)
  └── TvEpisodeMetadata → Video (episodes)
        └── VideoElement → Person (cast/crew per episode)
```

## Creation Workflow

### Step 1: Ensure Network Exists

The broadcasting network (Organization) must exist first.

Check at `/admin/world-data/organizations` or create via [manage-organization](../manage-organization/skill.md).

### Step 2: Plan the Series

Determine:
- Series title
- Network
- Start year (and end year if not ongoing)
- Genre(s)
- Key cast and creators
- Cultural significance

### Step 3: Create the Article

Follow [article-series](../../Kempopedia/article-series/skill.md) to write the article.

**Key article elements:**
- Infobox with network, dates, cast, creator
- Premise and format
- Cast and characters
- Production history
- Cultural impact

### Step 4: Generate the Image

**For promotional stills:**
```bash
node scripts/generate-image.js "<prompt>" --name "Series Name" --category "product"
```

```
Photorealistic photograph, promotional still from 1950s television series. [Cast description, poses, costumes]. [Setting description]. Professional studio photography, [COLOR: "black and white" for pre-1955, "color" for 1955+].
```

**For title cards (with text):**
```bash
node scripts/generate-image.js "<prompt>" --name "Series Name" --category "logo" --tool gemini
```

```
Television title card for "[Series Name]", [decade] [genre] show. [Typography style, decorative elements]. Professional broadcast graphics, [COLOR].
```

### Step 5: Create the Series Record

Via Prisma or admin UI (when available):

```typescript
const series = await prisma.series.create({
  data: {
    title: "The Dusty Dalton Show",
    networkId: "ubc-org-id",
    startYear: 1949,
    endYear: null, // null if ongoing
    description: "Western variety show starring singing cowboy Dusty Dalton",
    articleId: "article-id" // Link to Kempopedia article
  }
});
```

| Field | Requirement | Description |
|-------|-------------|-------------|
| title | **Required** | Series name |
| networkId | **Strongly Recommended** | Link to broadcasting Organization — almost all TV series air on a network. **Always set this field.** |
| startYear | Recommended | First season year — premiere date is important |
| endYear | Optional | Final season year — null if ongoing |
| description | Optional | Brief description |
| articleId | **Required*** | Link to Kempopedia article |

*Every Series record should have a linked article. Create the article first, then link it.

> ⚠️ **Don't forget the network!** When creating a Series record, always link it to its network Organization (e.g., UBC). This is easy to overlook but important for data integrity.

### Step 6: Link the Article

Set the `articleId` field on the Series record to link to the article.

### Step 7: Link the Image

1. Go to `/admin/world-data/image/manage`
2. Find the series promotional image
3. Add ImageSubject with:
   - `itemType`: "series" (if supported) or document in article
   - `itemId`: Series ID

### Step 8: Create Cast/Crew Records

For each key cast/crew member:

1. Ensure Person record exists (via [manage-person](../manage-person/skill.md))
2. Update their article to mention the series role
3. For episode-level tracking, create VideoElement records

### Step 9: Link Genres

```typescript
await prisma.seriesGenre.create({
  data: {
    seriesId: series.id,
    genreId: "genre-id"
  }
});
```

### Step 10: Update Related Articles

Add series mentions to:
- Network article (programming list)
- Cast/crew articles (filmography/career)
- Timeline (premiere date)

### Step 11: Verify Completeness

- [ ] Series record exists with all fields
- [ ] Article exists and is linked via `articleId`
- [ ] Image exists and is linked via `ImageSubject`
- [ ] Network article lists this series
- [ ] Key cast have Person records and updated articles
- [ ] Creator(s) have Person records and updated articles
- [ ] Genre(s) linked via SeriesGenre
- [ ] Timeline entry for premiere date

## Update Workflow

### Adding Cast Members
1. Create Person record if needed
2. Update person's article with role
3. Update series article cast list
4. For episode tracking: create VideoElement records

### Changing Network
1. Update networkId on Series record
2. Update old network's article
3. Update new network's article
4. Update series article

### Adding Episodes
1. Create Video record for the episode
2. Create TvEpisodeMetadata linking to Series
3. Create VideoElement records for cast/crew
4. Update series article episode list (if tracking notable episodes)

## Series Types Reference

| Genre | Examples |
|-------|----------|
| Sitcom | I Like Linda |
| Variety | The Bernie Kessler Show, The Dorothy Sherwood Show |
| Western | The Dusty Dalton Show |
| Children's | The Uncle Ned Show |
| Drama | TBD |
| Anthology | TBD |
| News | UBC Evening News |
| Game show | TBD |

## Database Schema Reference

```prisma
model Series {
  id          String        @id @default(cuid())
  title       String
  networkId   String?       @map("network_id")
  network     Organization? @relation(...)
  startYear   Int?          @map("start_year")
  endYear     Int?          @map("end_year")
  description String?       @db.Text
  articleId   String?       @unique @map("article_id")
  article     Article?      @relation(...)

  genres      SeriesGenre[]
  episodes    TvEpisodeMetadata[]
  trailers    TrailerMetadata[]

  @@map("series")
}

model SeriesGenre {
  id        String @id @default(cuid())
  seriesId  String @map("series_id")
  series    Series
  genreId   String @map("genre_id")
  genre     Genre

  @@unique([seriesId, genreId])
  @@map("series_genres")
}

model TvEpisodeMetadata {
  id           String  @id @default(cuid())
  videoId      String  @unique @map("video_id")
  video        Video
  seriesId     String  @map("series_id")
  series       Series
  seasonNum    Int     @map("season_num")
  episodeNum   Int     @map("episode_num")
  episodeTitle String? @map("episode_title")

  @@map("tv_episode_metadata")
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Manage Series | `/admin/world-data/series` (when available) |
| Manage Organizations | `/admin/world-data/organizations` |
| Manage People | `/admin/world-data/people/manage` |
| Manage Images | `/admin/world-data/image/manage` |
