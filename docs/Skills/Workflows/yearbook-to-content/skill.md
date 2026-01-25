# Yearbook to Content Workflow

Master orchestration skill for converting a Kempo yearbook analysis into complete universe content: database entries, Kempopedia articles, and images.

## Overview

This workflow takes a completed Kempo yearbook analysis document and systematically creates all the content identified within it. The process follows dependency order to ensure entities exist before they're referenced.

## Prerequisites

Before starting, ensure you have:

1. **Completed yearbook analysis** — `docs/yearbooks/kempo-YYYY-yearbook-analysis.md`
2. **Completed clean yearbook** — `docs/yearbooks/kempo-YYYY-yearbook.md`
3. **Dev server running** — `npm run dev` in `/web`
4. **Database access** — For creating records
5. **Image generation** — API keys configured

## Workflow Phases

```
Phase 1: INVENTORY
    ↓
Phase 2: FOUNDATION ENTITIES (Organizations, Places)
    ↓
Phase 3: DERIVED ENTITIES (Brands, Products, Publications)
    ↓
Phase 4: PEOPLE
    ↓
Phase 5: EVENTS & TIMELINE
    ↓
Phase 6: CROSS-REFERENCES
    ↓
Phase 7: VERIFICATION
```

---

## Important: Article Date Fields

Articles have two date-related fields that control the homepage date selector:

### `publishDate` (DateTime)
The **Kempo in-universe date** when the article was last updated. This controls whether an article appears when a user selects a specific date on the homepage.

- If user selects "June 1950", only articles with `publishDate <= June 1950` appear
- Set this to the end of your yearbook period (e.g., December 31, 1950 for 1950 yearbook)
- For article updates (like adding Korean War content to Westbrook), update `publishDate` to after the latest events mentioned

### `dates` (String[])
Array of **all Kempo dates mentioned** in the article. Used for search/indexing.

- Format: `"June 25, 1950 k.y."` or `"1950 k.y."`
- Include birth dates, event dates, founding dates, etc.
- When updating an article, add new dates to this array

### Setting Dates When Creating Articles

```typescript
await prisma.article.create({
  data: {
    title: "Example Person",
    type: "person",
    content: "...",
    publishDate: new Date("1950-12-31"), // End of yearbook period
    dates: ["January 15, 1912 k.y.", "1943 k.y.", "1950 k.y."],
    // ... other fields
  }
});
```

### Bulk Update for Missing Dates

After creating articles, ensure all have `publishDate`:
```typescript
await prisma.article.updateMany({
  where: { publishDate: null, createdAt: { gte: recentDate } },
  data: { publishDate: new Date("1950-12-31") }
});
```

---

## Important: Article Versioning (Revisions)

The system supports **article versioning** to show different content at different Kempo dates. When the homepage date selector is set to a past date, users see article content as it existed at that time.

### How It Works

- **Article table** = Current/latest version with its `publishDate`
- **Revision table** = Historical snapshots with their `kempoDate` (when that version was current)

When a user views at a specific date:
1. If viewing date >= article's `publishDate` → Current content shown
2. If viewing date < article's `publishDate` → System finds revision where `kempoDate` <= viewing date
3. If no matching revision → Article doesn't exist yet at that date (returns null)

### When Updating Existing Articles

If you're updating an article with new content (e.g., adding Korean War section to Westbrook):

1. **Save old content as revision FIRST**:
```typescript
// Get current article
const article = await prisma.article.findUnique({ where: { id: articleId } });

// Create revision with old content
await prisma.revision.create({
  data: {
    articleId: article.id,
    title: article.title,
    content: article.content,
    infobox: article.infobox,
    timelineEvents: article.timelineEvents,
    kempoDate: "January 1, 1950 k.y.", // When this version was "current"
    editSummary: "Pre-Korean War version"
  }
});
```

2. **Update article with new content**:
```typescript
await prisma.article.update({
  where: { id: articleId },
  data: {
    content: newContent,
    publishDate: new Date("1950-12-01"), // After latest events
    dates: [...existingDates, "June 25, 1950 k.y.", "September 15, 1950 k.y."]
  }
});
```

### Example: Westbrook Article

- **Revision** (kempoDate: "January 1, 1950 k.y."): Biography without Korean War
- **Current** (publishDate: December 1, 1950): Biography with Korean War section

When user views at June 1950 → Sees revision (no Korean War)
When user views at December 1950 → Sees current (with Korean War)

### Important: Image URLs in Revisions

When creating revisions, ensure the `infobox.image.url` uses the full Vercel Blob URL (starting with `https://`), not a local path like `/media/...`. The revision stores a complete snapshot of the infobox, so image URLs must be absolute.

```typescript
// Good - use the current article's infobox which has correct URLs
infobox: article.infobox,

// Bad - don't manually construct infobox with relative paths
infobox: { image: { url: "/media/person.jpg" } }
```

---

## Phase 1: Inventory

### 1.1 Extract New Entities from Yearbook Analysis

Read the yearbook analysis and create a master list of entities to create.

**Organize by type:**

```markdown
## Entities to Create for [YEAR]

### Organizations
- [ ] Pinnacle Pictures (film studio)
- [ ] [Organization Name] (type)

### Brands
- [ ] [Brand Name] (parent org)

### Products
- [ ] [Product Name] (brand)

### Places
- [ ] [Place Name] (type, location)

### People
- [ ] [Person Name] (role, age in [YEAR])
- [ ] [Person Name] (role, age in [YEAR])

### Publications
- [ ] [Publication Name] (type, publisher)

### Events
- [ ] [Event Name] (date, type)
```

### 1.2 Identify Dependencies

Map which entities depend on others:

```
Organization: Pinnacle Pictures
  └── Needed by: Films, Series, People (employment)

Person: Linda Lane
  └── Needs: Birth city (Dayton, Ohio)
  └── Needed by: I Like Linda series
```

### 1.3 Check Existing Entities

For each entity in your list:
1. Search existing articles (`/kemponet/kempopedia`)
2. Search database (`/admin/world-data/*`)
3. Mark as "exists" or "create"

### 1.4 Prioritize by Dependency

Order your list so dependencies are created first:
1. Nations → States → Cities → Places
2. Organizations → Brands → Products
3. Organizations → PublicationSeries
4. Places, Organizations → People
5. People, Places → Events

---

## Phase 2: Foundation Entities

Create entities that other entities depend on.

### 2.1 Locations

**Order:** Nations → States → Cities → Places

For each location:
1. Check if parent exists (state for city, nation for state)
2. Create parent first if missing
3. Follow [manage-place](../../EntityManagement/manage-place/skill.md)

**Quick workflow:**
```
1. Create article with infobox
2. Generate image (flag/skyline/scene)
3. Create location record at /admin/world-data/locations
4. Link article
5. Link image via ImageSubject
```

### 2.2 Organizations

For each organization:
1. Check if headquarters city exists
2. Follow [manage-organization](../../EntityManagement/manage-organization/skill.md)

**Quick workflow:**
```
1. Create article with infobox
2. Generate image (logo or building)
3. Create org record at /admin/world-data/organizations
4. Link article
5. Link image via ImageSubject
6. **Add inspirations** (REQUIRED for fictional entities!)
```

**⚠️ INSPIRATIONS ARE OFTEN MISSED!** Every fictional organization should have at least one real-world inspiration. Add via admin UI or Prisma:
```typescript
await prisma.inspiration.create({
  data: {
    subjectId: org.id,
    subjectType: "organization",
    inspiration: "Real Company Name",
    wikipediaUrl: "https://en.wikipedia.org/wiki/..."
  }
});
```

**Priority order:**
1. Studios (needed for films)
2. Networks (needed for TV series)
3. Labels (needed for albums)
4. Publishers (needed for publications)
5. Other companies
6. Institutions

---

## Phase 3: Derived Entities

Create entities that depend on foundation entities.

### 3.1 Brands

For each brand:
1. Verify parent organization exists
2. Follow [manage-brand](../../EntityManagement/manage-brand/skill.md)

### 3.2 Products

For each product:
1. Verify parent brand exists
2. Follow [manage-product](../../EntityManagement/manage-product/skill.md)

### 3.3 Publication Series

For each publication (newspapers, magazines, books):
1. Verify publisher organization exists
2. Follow [manage-publication](../../EntityManagement/manage-publication/skill.md)

### 3.4 Comic Strips

For each comic strip:
1. Create article following [create-publication](../../Kempopedia/create-publication/skill.md) (comic strip section)
2. Create PublicationSeries record with `type: comic`
3. Link creator via PublicationElement (role: author or illustrator)
4. Link article via `articleId`
5. Generate image (comic panel style)

### 3.5 TV Series

For each TV series:
1. Verify network organization exists
2. Follow [manage-series](../../EntityManagement/manage-series/skill.md)
3. Create article following [create-series](../../Kempopedia/create-series/skill.md)
4. Create Series record with `articleId` link
5. Generate promotional image or title card

---

## Phase 4: People

Create person entities in batches by role.

### 4.1 Batch by Domain

Process people grouped by their primary domain:

**Entertainment:**
- Film actors, directors
- TV personalities
- Musicians, composers

**Politics:**
- Politicians, officials
- Military leaders

**Business:**
- Executives, founders
- Industry figures

**Sports:**
- Athletes
- Coaches, managers

**Culture:**
- Writers, artists
- Journalists, columnists

### 4.2 For Each Person

Follow [manage-person](../../EntityManagement/manage-person/skill.md):

```
1. Verify birthplace exists (create if needed)
2. Verify key organizations exist (employers, schools)
3. Create article with full biography
4. Generate portrait image (save the Image ID from output)
5. Update article infobox with image URL
6. Create Person record at /admin/world-data/people
7. Link article to Person record
8. **Create ImageSubject link** (image → person) - REQUIRED!
9. **Add inspirations** (all real-world sources) - REQUIRED!
10. Update related articles (employers, birthplace)
```

**Steps 8-9 are critical and often missed!**

- **ImageSubject**: Links image to person for admin UI display
- **Inspirations**: Links person to real-world figures they're based on

Note: Real historical figures (e.g., FDR, Stalin) who appear as themselves in Kempo don't need inspirations - they ARE the real person. Without ImageSubject, the admin UI shows "No linked images" even when the article displays an image. See [manage-person Step 7](../../EntityManagement/manage-person/skill.md) for details.

### 4.3 Person Checklist

For each person, verify:
- [ ] Person record with all fields
- [ ] Article with proper structure
- [ ] Portrait image (era-appropriate color)
- [ ] Birthplace linked and exists
- [ ] Organizations linked (employers, schools)
- [ ] Inspirations recorded
- [ ] Related articles updated

---

## Phase 5: Events & Timeline

### 5.1 Sync Yearbook Timeline to Kempopedia Timeline (CRITICAL)

**Every dated event in the yearbook's timeline section (Section XII) should appear in the Kempopedia timeline page.**

Compare the yearbook timeline against the timeline article:
- 1950+: `web/content/kemponet/kempopedia/articles/timelines/1950.md`
- Pre-1950: `web/content/kemponet/kempopedia/articles/timelines/1940s.md`

For each yearbook event:
1. Check if timeline page has corresponding entry
2. If missing, add entry with proper anchor ID
3. Include wikilinks to related articles

### 5.2 Identify Significance Levels

**Significance guide:**
| Type | Significance | Timeline | Event Record |
|------|--------------|----------|--------------|
| War begins/ends | 9-10 | Yes | Yes |
| President action | 8-9 | Yes | Yes |
| Major TV premiere | 7 | Yes | Yes |
| Notable death | 6-7 | Yes | Maybe |
| Album/book release | 5-6 | Yes | Maybe |
| Sports championship | 6-7 | Yes | Maybe |
| Minor milestone | 3-4 | Maybe | No |

### 5.3 Create Timeline Entries

For each event from the yearbook:
```markdown
<a id="1950-10-15-ky"></a>
**October 15, 1950 k.y.** — [[i-like-linda|*I Like Linda*]] premieres on [[ubc|UBC]], becoming an immediate sensation.
```

**Anchor ID formats:**
- Year only: `1950-ky`
- Month: `1950-06-ky`
- Full date: `1950-06-25-ky`

### 5.4 Create Event Records (for significant events)

For events with significance 5+, create database records.

Follow [manage-event](../../EntityManagement/manage-event/skill.md):

```
1. Create Event record via Prisma
2. Link people via EventPerson
3. Link locations via EventLocation
4. Link media via EventMedia
5. Link to parent event if applicable
6. Create standalone article if significance 7+
```

### 5.5 Link Related Articles to Timeline (MANDATORY)

**For each new timeline entry, update related articles to include date links.**

Example: When adding "October 25, 1950 - Chinese forces enter Korea" to the timeline:
1. Find articles that discuss this event (e.g., Douglas Westbrook, Korean War)
2. Add date link: `[[October 25, 1950 k.y.|October 25, 1950]]`
3. Verify the link resolves to the timeline anchor

This creates bidirectional navigation:
- Timeline → Articles (via wikilinks in timeline entry)
- Articles → Timeline (via date links in article content)

---

## Phase 6: Cross-References

Ensure all content is properly interconnected.

### 6.1 Article Backlinks

For each new article created, verify:
- [ ] Mentioned people link back
- [ ] Mentioned places list this entity
- [ ] Mentioned organizations reference this entity
- [ ] "See also" sections are bidirectional

### 6.2 Timeline Synchronization

For each date link in articles:
- [ ] Timeline entry exists with anchor
- [ ] Anchor ID format is correct
- [ ] Entry links back to article

### 6.3 Infobox Links

Verify infobox wikilinks:
- [ ] All linked articles exist
- [ ] Pipe syntax used correctly
- [ ] No dead links

---

## Phase 7: Verification

### 7.1 Entity Verification

Run through each entity type:

**People:**
```
For each new Person:
- [ ] DB record exists
- [ ] Article linked via articleId
- [ ] Image linked via ImageSubject
- [ ] Inspirations recorded
- [ ] Appears in birthplace's "Notable residents"
```

**Organizations:**
```
For each new Organization:
- [ ] DB record exists
- [ ] Article linked
- [ ] Image linked
- [ ] Child entities linked (brands, publications, etc.)
```

**Brands/Products:**
```
For each new Brand/Product:
- [ ] DB record exists with parent link
- [ ] Article linked
- [ ] Image linked
- [ ] Parent article mentions this entity
```

**Places:**
```
For each new Place:
- [ ] DB record exists with parent link
- [ ] Article linked
- [ ] Image linked
- [ ] Notable residents listed
```

### 7.2 Events & Timeline Verification (CRITICAL)

**Every dated event from the yearbook's timeline section must be in the Kempopedia timeline page.**

```
For the yearbook timeline (Section XII):
- [ ] All events have corresponding Kempopedia timeline entries
- [ ] All timeline entries have proper anchor IDs
- [ ] All timeline entries link to related articles
- [ ] Significant events (5+) have Event database records
- [ ] Event hierarchy is correct (battles → wars, etc.)
```

**Verify bidirectional linking:**
```
For each timeline entry:
- [ ] Related articles contain date links back to timeline
- [ ] Date link format: [[Month Day, YYYY k.y.|Display Text]]
- [ ] Links resolve to correct anchor IDs
```

**Quick verification:**
```typescript
// Count 1950 events in database
const count = await prisma.event.count({
  where: {
    kyDateBegin: { gte: new Date('1950-01-01'), lte: new Date('1950-12-31') }
  }
});
console.log('Events in DB for 1950:', count);
```

### 7.3 Link Verification (Run Dead Link Checker)

**Run the dead link checker script to find all broken wikilinks:**

```bash
node scripts/check-dead-links.js
```

Options:
- `--summary` — Show counts only
- `--json` — JSON output for programmatic use

**For each dead link found:**
1. If the article should exist → create a stub with `status: 'published'`
2. If the article won't be created soon → remove the wikilink (keep as plain text)
3. If it's a slug mismatch → fix the link format (e.g., `harold-kellman` → `Harold S. Kellman`)

**Common fixes:**
- Lowercase slugs → Proper title case: `[[korean-war]]` → `[[Korean War]]`
- Piped links to non-existent pages → Plain text: `[[slug|Display]]` → `Display`
- Year links → Include "k.y.": `[[1950]]` → `[[1950 k.y.]]`

### 7.3 Image Verification

For each entity requiring an image:
1. Image exists in Vercel Blob
2. Image record has correct metadata
3. **ImageSubject links entity to image** (CRITICAL - see below)
4. Article infobox has correct URL (not empty `"url": ""`)

**Quick verification query - Articles missing images:**
```typescript
const missing = await prisma.article.findMany({
  where: {
    content: { contains: '"url": ""' },
    createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  },
  select: { title: true }
});
console.log("Articles missing images:", missing.map(a => a.title));
```

**CRITICAL: Verify ImageSubject links exist**

Even if article infoboxes display images, you must verify that `ImageSubject` records exist linking images to entity records. Without these, admin pages show "No linked images".

```typescript
// Check for people with images but missing ImageSubject links
const peopleMissingLinks = await prisma.$queryRaw`
  SELECT p.id, CONCAT(p.first_name, ' ', p.last_name) as name
  FROM people p
  JOIN articles a ON a.id = p.article_id
  JOIN image i ON i.article_id = a.id
  WHERE NOT EXISTS (
    SELECT 1 FROM image_subjects isub
    WHERE isub.item_id = p.id AND isub.item_type = 'person'
  )
`;
console.log("People missing ImageSubject links:", peopleMissingLinks.length);

// Check for organizations with images but missing ImageSubject links
const orgsMissingLinks = await prisma.$queryRaw`
  SELECT o.id, o.name
  FROM organizations o
  JOIN articles a ON a.id = o.article_id
  JOIN image i ON i.article_id = a.id
  WHERE NOT EXISTS (
    SELECT 1 FROM image_subjects isub
    WHERE isub.item_id = o.id AND isub.item_type = 'organization'
  )
`;
console.log("Organizations missing ImageSubject links:", orgsMissingLinks.length);
```

If any are found, create the missing ImageSubject records (see Step 4 in Batch Processing above).

### 7.4 Date Field Verification

Ensure all articles have proper date fields:

```typescript
// Check for missing publishDate
const missingDates = await prisma.article.count({
  where: {
    publishDate: null,
    createdAt: { gte: recentDate }
  }
});
console.log("Articles missing publishDate:", missingDates);

// Check for empty dates arrays
const emptyDates = await prisma.article.count({
  where: {
    dates: { isEmpty: true },
    createdAt: { gte: recentDate }
  }
});
console.log("Articles with empty dates array:", emptyDates);
```

For updated articles (like adding Korean War to Westbrook):
- Update `publishDate` to after the latest events added
- Add new dates to the `dates` array

### 7.5 Inspiration Verification (CRITICAL)

**Inspirations are frequently missed!** Run this check after creating entities:

```typescript
// Check entities missing inspirations
async function checkMissingInspirations() {
  const checks = [
    { model: 'person', type: 'person', label: 'People' },
    { model: 'organization', type: 'organization', label: 'Organizations' },
    { model: 'brand', type: 'brand', label: 'Brands' },
    { model: 'product', type: 'product', label: 'Products' },
    { model: 'city', type: 'city', label: 'Cities (fictional only)' },
  ];

  for (const check of checks) {
    const withInspirations = (await prisma.inspiration.findMany({
      where: { subjectType: check.type },
      select: { subjectId: true }
    })).map(i => i.subjectId);

    const missing = await prisma[check.model].findMany({
      where: { id: { notIn: withInspirations } },
      select: { id: true, name: true }
    });

    console.log(`${check.label}: ${missing.length} missing inspirations`);
    if (missing.length > 0 && missing.length < 10) {
      missing.forEach(m => console.log(`  - ${m.name}`));
    }
  }
}
```

**Rules for inspirations:**
- **Fictional entities** (all Kempo people, companies, etc.) → NEED inspirations
- **Real places** (Philadelphia, Boston, New York) → Do NOT need inspirations (they ARE real)
- **Kempo uses compression**: One Kempo entity often combines 2-4 real-world inspirations

**Quick fix for missing inspirations:**
```typescript
await prisma.inspiration.create({
  data: {
    subjectId: entityId,
    subjectType: "person", // or "organization", "brand", etc.
    inspiration: "Real-World Name",
    wikipediaUrl: "https://en.wikipedia.org/wiki/..."
  }
});
```

### 7.6 Final Checklist

```
## [YEAR] Content Creation Complete

### Counts
- Organizations created: X
- Brands created: X
- Products created: X
- People created: X
- Places created: X
- Publications created: X
- Events created: X
- Timeline entries added: X
- Images generated: X

### Verification
- [ ] All wikilinks resolve (run `node scripts/check-dead-links.js`)
- [ ] All images display correctly in articles
- [ ] All entities have DB records
- [ ] **All entities with images have ImageSubject links** (see 7.4)
- [ ] **All fictional entities have inspirations** (see 7.5) - OFTEN MISSED!
- [ ] Related articles updated
- [ ] All articles have publishDate set
- [ ] Updated articles have dates array updated

### Timeline Sync (CRITICAL)
- [ ] ALL yearbook timeline events → Kempopedia timeline page
- [ ] ALL timeline entries have proper anchor IDs
- [ ] ALL significant events (5+) → Event database
- [ ] ALL related articles link back to timeline dates
- [ ] Event hierarchy correct (child events → parent events)

### Notes
[Any issues encountered, decisions made, or follow-up needed]
```

---

## Tracking Progress

### Option 1: Markdown Checklist

Create a tracking document:

```markdown
# 1950 Content Creation Progress

## Phase 1: Inventory
- [x] Extract entities from yearbook
- [x] Map dependencies
- [x] Check existing entities

## Phase 2: Foundation
### Organizations
- [x] Pinnacle Pictures
- [ ] [Next org]

### Places
- [x] Lawton, Missouri
- [ ] [Next place]

## Phase 3: Derived
[...]
```

### Option 2: Database Status

Add notes to yearbook analysis marking completed items.

---

## Batch Processing Tips

### Image Generation

#### Step 1: Create Image Generation Queue

Add an "Image Generation Queue" section to your progress document with ready-to-run commands organized by category:

```markdown
## Image Generation Queue

### People - Entertainment (6)
\`\`\`bash
node scripts/generate-image.js "Photorealistic portrait photograph of a 38-year-old white male, rugged Western TV cowboy star. Weathered handsome face, confident smile, wearing cowboy hat. Professional studio lighting, 1950s photography style, black and white." --name "Dusty Dalton" --category "portrait"
\`\`\`

### Organizations (12)
\`\`\`bash
node scripts/generate-image.js "Classic Hollywood film studio logo. Art deco design, elegant 1940s typography. Full color." --name "Pinnacle Pictures Logo" --category "logo" --style logo
\`\`\`
```

**Prompt formulas by type:**
- **Portraits:** `Photorealistic portrait photograph of a [age]-year-old [ethnicity] [gender], [role]. [Physical description]. Professional studio lighting, [era] photography style, [color].`
- **Logos:** `[Type] logo for [Name]. [Design description], [era] typography. Professional logo design, [color scheme].`
- **Locations:** `Photorealistic photograph of [place], [era]. [Description]. Professional architectural photography, black and white.`

#### Step 2: Generate Images in Batches

Run from project root:
```bash
cd /path/to/Kempo

# Generate portraits (Grok default)
node scripts/generate-image.js "Photorealistic portrait..." --name "Name" --category portrait

# Locations with text (Gemini)
node scripts/generate-image.js "..." --name "Name" --category location --tool gemini

# Logos
node scripts/generate-image.js "..." --name "Name" --category logo --style logo
```

#### Step 3: Link Images to Articles Programmatically

After generating all images, run a script to update article infoboxes:

```typescript
// Link images to articles by name matching
const recentImages = await prisma.image.findMany({
  where: { createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
  select: { id: true, name: true, url: true }
});

const imageMap = new Map(recentImages.map(i => [i.name.toLowerCase(), { id: i.id, url: i.url }]));

const articles = await prisma.article.findMany({
  where: { content: { contains: '"url": ""' } }
});

for (const article of articles) {
  const title = article.title.toLowerCase();
  // Match by title or with common suffixes (logo, badge, poster, etc.)
  const imageData = imageMap.get(title)
    || imageMap.get(title + " logo")
    || imageMap.get(title + " poster");

  if (imageData) {
    const newContent = article.content.replace(/"url": ""/, `"url": "${imageData.url}"`);
    await prisma.article.update({
      where: { id: article.id },
      data: { content: newContent }
    });
  }
}
```

#### Step 4: Create ImageSubject Links (CRITICAL)

**This step is required!** Linking images to articles (above) updates the infobox display, but you must ALSO create `ImageSubject` records to link images to their entity records (Person, Organization, etc.).

Without ImageSubject records, the admin UI will show "No linked images" for entities even when their articles display images.

```typescript
// Create ImageSubject links for people
const peopleWithImages = await prisma.$queryRaw`
  SELECT p.id as "personId", i.id as "imageId"
  FROM people p
  JOIN articles a ON a.id = p.article_id
  JOIN image i ON i.article_id = a.id
  WHERE NOT EXISTS (
    SELECT 1 FROM image_subjects isub
    WHERE isub.item_id = p.id AND isub.item_type = 'person'
  )
`;

for (const row of peopleWithImages) {
  await prisma.imageSubject.create({
    data: {
      imageId: row.imageId,
      itemId: row.personId,
      itemType: "person"
    }
  });
}

// Repeat for organizations
const orgsWithImages = await prisma.$queryRaw`
  SELECT o.id as "orgId", i.id as "imageId"
  FROM organizations o
  JOIN articles a ON a.id = o.article_id
  JOIN image i ON i.article_id = a.id
  WHERE NOT EXISTS (
    SELECT 1 FROM image_subjects isub
    WHERE isub.item_id = o.id AND isub.item_type = 'organization'
  )
`;

for (const row of orgsWithImages) {
  await prisma.imageSubject.create({
    data: {
      imageId: row.imageId,
      itemId: row.orgId,
      itemType: "organization"
    }
  });
}
```

**Entity types for ImageSubject.itemType:**
- `"person"` — People
- `"organization"` — Organizations
- `"city"` / `"state"` / `"nation"` / `"place"` — Locations
- `"brand"` — Brands
- `"product"` — Products

**Naming conventions for auto-matching:**
| Entity Type | Image Name Format |
|-------------|-------------------|
| Person | `{Full Name}` (e.g., "Dusty Dalton") |
| Organization | `{Name} Logo` (e.g., "Pinnacle Pictures Logo") |
| City | `{Name} Skyline` (e.g., "Steel City Skyline") |
| Brand | `{Name} Badge` (e.g., "Pioneer Badge") |
| TV Show | `{Name} Show` (e.g., "Dusty Dalton Show") |
| Broadway | `{Name} Poster` (e.g., "Oklahoma Wind Poster") |
| Comic | `{Name} Comic` (e.g., "Bramblewood Comic") |

### Article Creation

Create articles in batches:
1. Write all people articles for one domain (entertainment)
2. Generate all portraits for that batch
3. Create all Person records
4. Move to next domain

### Database Records

Use Prisma scripts for bulk creation when needed:
```typescript
// Example: Create multiple EventPerson records
for (const person of participants) {
  await prisma.eventPerson.create({
    data: {
      eventId: warEvent.id,
      personId: person.id,
      role: "participant"
    }
  });
}
```

---

## Domain-Specific Notes

### Entertainment (Film/TV/Music)

**Dependencies:**
- Studios before films
- Networks before series
- Labels before albums
- Artists before albums/songs

**Image notes:**
- Use Gemini for title cards (text)
- Promotional stills can use Grok
- Album covers may need Gemini (text)

### Politics

**Dependencies:**
- Political parties exist (National, Federal)
- Government agencies exist
- States/cities for constituencies

**Event types:**
- election, inauguration, legislation, speech

### Sports

**Dependencies:**
- Teams (as Organizations)
- Venues (as Places)
- Leagues (as Organizations)

**Event types:**
- sports (games, championships)

### Business

**Dependencies:**
- Parent orgs before subsidiaries
- Headquarters cities
- Founders as People

---

## Common Issues

### Circular Dependencies

When A references B and B references A:
1. Create both articles with placeholder content
2. Add links after both exist
3. Verify bidirectional links

### Missing Prerequisites

If a dependency doesn't exist:
1. Pause current entity
2. Create the dependency first
3. Return to original entity

### Image Generation Failures

If generation fails:
1. Try different prompt wording
2. Switch tools (Grok ↔ Gemini)
3. Generate without text, add text note in caption

---

## Skill Reference

| Task | Skill |
|------|-------|
| Create person article | [create-person](../../Kempopedia/create-person/skill.md) |
| Manage person lifecycle | [manage-person](../../EntityManagement/manage-person/skill.md) |
| Create organization article | [create-organization](../../Kempopedia/create-organization/skill.md) |
| Manage organization lifecycle | [manage-organization](../../EntityManagement/manage-organization/skill.md) |
| Create brand article | [create-brand](../../Kempopedia/create-brand/skill.md) |
| Manage brand lifecycle | [manage-brand](../../EntityManagement/manage-brand/skill.md) |
| Create product article | [create-product](../../Kempopedia/create-product/skill.md) |
| Manage product lifecycle | [manage-product](../../EntityManagement/manage-product/skill.md) |
| Create place article | [create-place](../../Kempopedia/create-place/skill.md) |
| Manage place lifecycle | [manage-place](../../EntityManagement/manage-place/skill.md) |
| Create publication article | [create-publication](../../Kempopedia/create-publication/skill.md) |
| Manage publication lifecycle | [manage-publication](../../EntityManagement/manage-publication/skill.md) |
| Create TV series article | [create-series](../../Kempopedia/create-series/skill.md) |
| Manage TV series lifecycle | [manage-series](../../EntityManagement/manage-series/skill.md) |
| Create event article | [create-event](../../Kempopedia/create-event/skill.md) |
| Manage event lifecycle | [manage-event](../../EntityManagement/manage-event/skill.md) |
| Generate images | [generate-image](../../Kempopedia/generate-image/skill.md) |
| Linking reference | [linking-guide](../../EntityManagement/linking-guide/skill.md) |
| Global article rules | [article-global-rules](../../Kempopedia/article-global-rules/skill.md) |
