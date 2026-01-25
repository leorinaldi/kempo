# Quality Control Skill

**Purpose:** Run a battery of quality control checks on Kempo content. Each check is presented individually for user approval before running.

**When to use:**
- At the end of the `yearbook-to-content` workflow
- After bulk content creation sessions
- Periodic maintenance checks
- Before major releases or milestones

---

## Workflow

1. Present each check with description
2. Ask user: "Run this check?" (Yes/No/Skip all remaining)
3. If yes, run the check and report findings
4. If findings exist, offer to fix or note for later
5. Move to next check
6. Summarize all findings at end

---

## Check Order

Automated checks run first (can be fixed programmatically), manual review last (easier after data is clean).

| Order | Check | Type | Script/Query |
|-------|-------|------|--------------|
| 1 | Dead Links | Automated | `scripts/check-dead-links.js` |
| 2 | Image URL Validation | Automated | DB Query |
| 3 | Orphaned Images | Automated | DB Query |
| 4 | Missing Images | Automated | DB Query |
| 5 | Entity-Article Linking | Automated | DB Query |
| 6 | ImageSubject Linking | Automated | DB Query |
| 7 | Inspiration Completeness | Semi-Auto | DB Query + Review |
| 8 | Timeline Sync | Semi-Auto | Content Scan |
| 9 | Revision Coverage | Automated | DB Query |
| 10 | Fictional Content Audit | Manual | Content Review |
| 11 | Unsigned Articles | Manual | DB Query + Review |

---

## Check Details

### 1. Dead Links

**Description:** Find wikilinks in articles that point to non-existent articles.

**How to run:**
```bash
cd /Users/leonardorinaldi/Claude/Kempo/web
node scripts/check-dead-links.js
```

**What it finds:** Wikilinks like `[[non-existent-slug]]` or `[[bad-slug|Display Name]]` where target article doesn't exist.

**Resolution:** Create stub articles for missing links, or fix incorrect slugs.

---

### 2. Image URL Validation

**Description:** Verify that image URLs in article infoboxes actually exist in the Image table with valid Vercel Blob URLs.

**How to run:**
```typescript
// Find articles with infobox images not in Image table
const articles = await prisma.article.findMany({
  where: {
    infobox: { not: Prisma.JsonNull }
  },
  select: { id: true, title: true, slug: true, infobox: true }
})

const images = await prisma.image.findMany({
  select: { url: true }
})
const validUrls = new Set(images.map(i => i.url))

const broken = articles.filter(a => {
  const url = a.infobox?.image?.url
  return url && !validUrls.has(url)
})

console.log(`Found ${broken.length} articles with broken image URLs:`)
broken.forEach(a => console.log(`- ${a.title} (${a.slug}): ${a.infobox?.image?.url}`))
```

**What it finds:** Articles referencing image URLs that don't exist in the Image table.

**Resolution:** Either regenerate the image, or update the infobox with a valid URL from the Image table.

---

### 3. Orphaned Images

**Description:** Find Image records that aren't referenced by any article infobox.

**How to run:**
```typescript
const images = await prisma.image.findMany({
  select: { id: true, name: true, url: true }
})

const articles = await prisma.article.findMany({
  where: { infobox: { not: Prisma.JsonNull } },
  select: { infobox: true }
})

const usedUrls = new Set(
  articles.map(a => a.infobox?.image?.url).filter(Boolean)
)

const orphaned = images.filter(i => !usedUrls.has(i.url))

console.log(`Found ${orphaned.length} orphaned images:`)
orphaned.forEach(i => console.log(`- ${i.name}: ${i.url}`))
```

**What it finds:** Images uploaded but not used in any article.

**Resolution:** Either link to appropriate articles, or delete if truly unused.

---

### 4. Missing Images

**Description:** Find Person/Place/Institution articles that lack images (required per Section 16 of article-global-rules).

**How to run:**
```typescript
const requiredTypes = ['person', 'place', 'organization']
const requiredSubtypes = ['institution', 'university', 'school', 'company']

const articles = await prisma.article.findMany({
  where: {
    OR: [
      { type: { in: requiredTypes } },
      { subtype: { in: requiredSubtypes } }
    ]
  },
  select: { id: true, title: true, slug: true, type: true, subtype: true, infobox: true }
})

const missing = articles.filter(a => {
  const url = a.infobox?.image?.url
  return !url || url.includes('placeholder')
})

console.log(`Found ${missing.length} articles missing required images:`)
missing.forEach(a => console.log(`- [${a.type}/${a.subtype}] ${a.title}`))
```

**What it finds:** Articles that should have images but don't.

**Resolution:** Generate images using `node scripts/generate-image.js` or admin regenerate feature.

---

### 5. Entity-Article Linking

**Description:** Find database entities (Person, Organization, Brand, etc.) without linked articles.

**How to run:**
```typescript
// Check each entity type
const peopleWithoutArticles = await prisma.person.findMany({
  where: { articleId: null },
  select: { id: true, firstName: true, lastName: true }
})

const orgsWithoutArticles = await prisma.organization.findMany({
  where: { articleId: null },
  select: { id: true, name: true }
})

const brandsWithoutArticles = await prisma.brand.findMany({
  where: { articleId: null },
  select: { id: true, name: true }
})

const productsWithoutArticles = await prisma.product.findMany({
  where: { articleId: null },
  select: { id: true, name: true }
})

const placesWithoutArticles = await prisma.place.findMany({
  where: { articleId: null },
  select: { id: true, name: true }
})

console.log('Entities without linked articles:')
console.log(`- People: ${peopleWithoutArticles.length}`)
console.log(`- Organizations: ${orgsWithoutArticles.length}`)
console.log(`- Brands: ${brandsWithoutArticles.length}`)
console.log(`- Products: ${productsWithoutArticles.length}`)
console.log(`- Places: ${placesWithoutArticles.length}`)
```

**What it finds:** Entities in the database that have no corresponding Kempopedia article.

**Resolution:** Create articles for important entities, or delete orphaned entity records.

---

### 6. ImageSubject Linking

**Description:** Find images that should be linked to entities via ImageSubject but aren't.

**How to run:**
```typescript
// Find images with names matching entity names but no ImageSubject link
const images = await prisma.image.findMany({
  include: { subjects: true }
})

const unlinked = images.filter(i => i.subjects.length === 0)

console.log(`Found ${unlinked.length} images without entity links:`)
unlinked.forEach(i => console.log(`- ${i.name} (${i.category})`))
```

**What it finds:** Images not connected to their corresponding Person/Organization/etc. entity.

**Resolution:** Create ImageSubject records linking images to appropriate entities.

---

### 7. Inspiration Completeness

**Description:** Find entities that likely have real-world inspirations but no Inspiration records.

**How to run:**
```typescript
// Find entities without inspirations
const peopleWithoutInspirations = await prisma.person.findMany({
  where: { inspirations: { none: {} } },
  select: { id: true, firstName: true, lastName: true }
})

const orgsWithoutInspirations = await prisma.organization.findMany({
  where: { inspirations: { none: {} } },
  select: { id: true, name: true }
})

// Note: Not all entities need inspirations - some are purely fictional
console.log('Entities without inspirations (review if real-world parallel exists):')
console.log(`- People: ${peopleWithoutInspirations.length}`)
console.log(`- Organizations: ${orgsWithoutInspirations.length}`)
```

**What it finds:** Entities that may be missing real-world inspiration tracking.

**Resolution:** Review each entity and add Inspiration records where real-world parallels exist.

**Note:** This is semi-automated because not every entity needs an inspiration - some are purely original Kempo creations.

---

### 8. Timeline Sync

**Description:** Find date links in articles that don't have corresponding timeline entries.

**How to run:**
```typescript
// Extract all date links from articles
const articles = await prisma.article.findMany({
  select: { title: true, slug: true, content: true, dates: true }
})

// Pattern for linked dates: [[Month Day, YYYY k.y.]] or [[YYYY k.y.]]
const datePattern = /\[\[([A-Z][a-z]+ \d{1,2}, )?\d{4} k\.y\.\]\]/g

const allDateLinks = []
articles.forEach(a => {
  const matches = a.content?.match(datePattern) || []
  matches.forEach(m => {
    allDateLinks.push({ article: a.title, date: m })
  })
})

console.log(`Found ${allDateLinks.length} date links to verify against timelines`)
// Manual step: check each against timeline pages
```

**What it finds:** Date links that may not have corresponding timeline page entries.

**Resolution:** Add missing entries to appropriate timeline pages with anchor IDs.

**Note:** This requires checking timeline files manually or building a timeline parser.

---

### 9. Revision Coverage

**Description:** Find articles with publishDate set but no revisions, meaning users viewing earlier dates see nothing.

**How to run:**
```typescript
const articlesWithoutRevisions = await prisma.article.findMany({
  where: {
    publishDate: { not: null },
    revisions: { none: {} }
  },
  select: { id: true, title: true, slug: true, publishDate: true }
})

console.log(`Found ${articlesWithoutRevisions.length} articles without revisions:`)
articlesWithoutRevisions.forEach(a => {
  console.log(`- ${a.title} (publishDate: ${a.publishDate})`)
})
```

**What it finds:** Articles that won't appear for users viewing at dates before publishDate.

**Resolution:** Determine if revisions are needed. For articles covering events from a single period, revisions may not be necessary. For articles that have been updated with new events, create appropriate revisions.

---

### 10. Fictional Content Audit

**Description:** Manual review of articles for real-world proper nouns that need Kempo equivalents (per Section 21 of article-global-rules).

**How to run:**
This is a manual review process. For each article, scan for:

- **People names** you don't recognize as Kempo characters
- **University/school names** that aren't Kempo institutions
- **Theater/venue names** that seem real-world
- **Song/show titles** that match real media
- **Character names** from real shows/films
- **Award names** (Oscar, Grammy, etc.)
- **Neighborhoods/districts** that aren't Kempo places
- **Quoted material** that might be real lyrics/dialogue

**Resolution:** For each real-world item found:
1. Propose Kempo equivalent with rationale
2. Get user approval
3. Create entity/article if needed
4. Update the article with Kempo name

---

### 11. Unsigned Articles (LAST)

**Description:** Find articles that have not been manually reviewed and signed off for quality.

**Prerequisites:** Run this check LAST, after all automated checks have cleaned up data issues. Manual review is much easier when the data is already clean.

**How to run:**

First, check if articles have a `reviewedAt` field. If not, we track via a separate method.

**Option A: If `reviewedAt` field exists:**
```typescript
const unsignedArticles = await prisma.article.findMany({
  where: { reviewedAt: null },
  select: { id: true, title: true, slug: true, type: true, createdAt: true },
  orderBy: { createdAt: 'asc' }
})

console.log(`Found ${unsignedArticles.length} articles pending review:`)
unsignedArticles.forEach((a, i) => {
  console.log(`${i + 1}. [${a.type}] ${a.title}`)
})
```

**Option B: If tracking externally (e.g., task list or session notes):**
- Maintain a list of reviewed article slugs
- Compare against all articles to find unreviewed ones

**Review process for each article:**
1. Read the article content
2. Check for fictional content compliance (Section 21)
3. Verify links are valid
4. Confirm image exists and is appropriate
5. Mark as reviewed when approved

**Resolution:** Review each article manually and mark as signed off.

---

## Running the Full Battery

When invoking this skill, follow this interaction pattern:

```
Claude: "Ready to run Quality Control checks. There are 11 checks available.

Check 1/11: Dead Links
Description: Find wikilinks pointing to non-existent articles.
Run this check? (yes/no/skip remaining)"

User: "yes"

Claude: [Runs check, reports findings]
"Found 3 dead links:
- Article 'John Smith' links to [[non-existent-place]]
- Article 'Company X' links to [[missing-person]]
- ...

Would you like to fix these now, or note them for later?"

User: "fix now"

Claude: [Creates stubs or fixes links]

Claude: "Check 2/11: Image URL Validation
Description: Verify article infobox images exist in Image table.
Run this check? (yes/no/skip remaining)"

... continues through all checks ...

Claude: "Quality Control Complete.

Summary:
- Dead Links: 3 found, 3 fixed
- Image URL Validation: 0 issues
- Orphaned Images: 5 found, noted for review
- Missing Images: 2 found, images generated
- Entity-Article Linking: 0 issues
- ImageSubject Linking: 8 unlinked, links created
- Inspiration Completeness: 4 entities reviewed
- Timeline Sync: 2 missing entries added
- Revision Coverage: 0 issues
- Fictional Content Audit: skipped
- Unsigned Articles: 12 remaining for future review"
```

---

## Integration with yearbook-to-content

At the end of the `yearbook-to-content` workflow, invoke this skill:

```markdown
## Final Step: Quality Control

After all yearbook content has been processed:

1. Announce: "Content creation complete. Running quality control checks."
2. Invoke the quality-control skill
3. Run through all applicable checks
4. Document any deferred issues for future sessions
```

Add this to the yearbook-to-content skill's final phase.

---

## Adding New Checks

To add a new QC check:

1. Add entry to the Check Order table with appropriate position
2. Create a Check Details section with:
   - Description
   - How to run (script or query)
   - What it finds
   - Resolution steps
3. Update the check count in the workflow section

---

## Quick Reference: Common Fixes

| Issue | Quick Fix |
|-------|-----------|
| Dead link | Create stub article with minimal content |
| Broken image URL | Regenerate via admin or update infobox |
| Missing image | `node scripts/generate-image.js` |
| Unlinked entity | Create article, set `articleId` on entity |
| Missing ImageSubject | Create link via API or admin |
| Missing inspiration | Add via entity edit form in admin |
| Missing timeline entry | Add to appropriate timeline page |
| Real-world content | Propose Kempo name, get approval, update |
