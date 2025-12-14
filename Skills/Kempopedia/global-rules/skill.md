# Kempopedia Global Rules

These rules apply to ALL Kempopedia article creation. Reference this skill before creating any content.

## 1. Current Date Rule

**Current Date: January 1, 1950 k.y.**

The Kempo universe is a living simulation. This date is the "present day."

- **No future events**: Do not include any events after January 1, 1950 k.y.
- **Living people**: Use present tense for anyone alive as of this date
- **No "Death and legacy" sections** for living people
- **Anachronism check**: Don't use terms/concepts that wouldn't exist yet
  - BAD: "Cold War" (term was emerging but not established)
  - BAD: "Korean War" (started June 1950)
  - GOOD: "rising tensions with the Soviet Union"

## 2. Real People vs Parallel Switchovers

**Kempo history diverged from real-world history starting in the late 1800s, with divergence increasing over time.**

Use this rule to determine whether to use a real historical person or create a parallel switchover:

| Condition | Approach |
|-----------|----------|
| Died before 1950 AND no notable post-1950 events | **Keep as real person** (e.g., FDR) |
| Did nothing notable after 1950 | **Keep as real person** |
| Did notable things after 1950 | **Create parallel switchover** (e.g., Truman → Kellman) |

**Examples:**
- **Franklin D. Roosevelt**: Died April 1945 → Keep as real person
- **Harry S. Truman**: President until 1953, Korean War decisions → Parallel switchover (Harold S. Kellman)
- **Dwight D. Eisenhower**: President 1953-1961 → Would need parallel switchover

Minor divergences (renamed towns, fictional institutions) can exist for real people's backgrounds, but the person themselves remains real if they meet the criteria above.

## 3. No Dead Links Rule (MANDATORY)

**Every wikilink must point to an existing article. Zero tolerance for dead links.**

### 3.1 Before Writing Any Article

1. **Plan your links**: List all entities you'll reference (people, places, institutions, events)
2. **Check existence**: For each planned wikilink, verify the target article exists
3. **Create stubs first**: If a linked article doesn't exist, create a stub BEFORE completing your main article

### 3.2 Stub Article Requirements

Stubs must include:
- Proper frontmatter (title, slug, type, subtype, status, tags)
- Infobox JSON with basic fields
- At least one sentence describing the entity
- A wikilink back to the article that references it
- A "See also" section

**Example stub:**
```markdown
---
title: "Lawton, Missouri"
slug: "lawton-missouri"
type: place
subtype: town
status: published
tags:
  - american
  - missouri
---

{infobox JSON}

**Lawton** is a small farming community in [[Missouri]]. It is the birthplace of [[harold-kellman|Harold S. Kellman]].

## See also

- [[harold-kellman|Harold S. Kellman]]
```

### 3.3 Link Verification Workflow

After completing any article:
1. **Extract all wikilinks** from your article
2. **Check each one** against existing files in `web/content/articles/`
3. **Create missing stubs** immediately
4. **Verify stubs link back** to your new article

## 4. Infobox Field Naming

**Infobox field names must be capitalized (Title Case or Sentence case).**

Field names appear as row labels in the right-hand panel. They should be human-readable and consistently capitalized:

```json
// CORRECT - Capitalized field names
"fields": {
  "Full_name": "Douglas David Westbrook",
  "Birth_date": "October 26, 1888 k.y.",
  "Birth_place": "[[Ashford, Kansas]]",
  "Founder": "[[henry-c-durant|Henry C. Durant]]",
  "Headquarters": "[[Detroit]], [[Michigan]]"
}

// INCORRECT - Lowercase field names
"fields": {
  "full_name": "Douglas David Westbrook",
  "birth_date": "October 26, 1888 k.y.",
  "founder": "Henry C. Durant"
}
```

**Standard field names by article type:**

| Person | Place | Institution | Company |
|--------|-------|-------------|---------|
| Full_name | Type | Official_name | Official_name |
| Birth_date | Country | Abbreviation | Founded |
| Birth_place | State | Founded | Founder |
| Death_date | Capital | Location | Headquarters |
| Death_place | Region | Type | Industry |
| Nationality | Population | Motto | Products |
| Occupation | Known_for | Colors | Divisions |
| Education | | | |
| Political_party | | | |
| Spouse | | | |
| Children | | | |
| Known_for | | | |

## 5. Infobox Wikilinks

**Infobox JSON fields now support wikilink syntax.**

Use wikilinks in infobox fields where linking makes sense:

```json
// Linkable fields - use wikilinks
"Birth_place": "[[Lawton, Missouri]]"
"Political_party": "[[National Party]]"
"State": "[[Missouri]]"
"Education": "[[Vermont Army Academy]]"

// Non-linkable fields - plain text
"Birth_date": "May 11, 1884 k.y."
"Nationality": "American"
"Children": 3
```

**When to use wikilinks in infobox:**
- Places (Birth_place, Death_place, Location, State, Country if fictional)
- Institutions (Education, Political_party)
- People (Spouse if they have an article, Head_of_state)

**When NOT to use wikilinks:**
- Dates
- Numbers
- Nationalities
- Descriptive text that isn't an article title

## 6. Wikilink Slug Consistency

**Use pipe syntax when the display name differs from the slug.**

Slugs are lowercase with hyphens. If the display name has capitals, spaces, or middle initials not in the slug, use the pipe syntax:

```markdown
// Article slug is "harold-kellman" but we want to display "Harold S. Kellman"
[[harold-kellman|Harold S. Kellman]]

// Simple case where slug matches - no pipe needed
[[world-war-ii|World War II]]
```

## 7. Political Parties

**Use Kempo political parties, not real-world ones.**

| Real World | Kempo Equivalent | Symbol |
|------------|------------------|--------|
| Democratic Party | [[National Party]] | Blue Star |
| Republican Party | [[Federal Party]] | Red Eagle |

Always use the Kempo party names in articles.

## 8. Real-World Event Articles

**Focus on Kempo-specific divergences, not full history rewrites.**

When creating articles for real-world events (WWI, WWII, etc.):
- Keep the article brief
- Focus on what's different in Kempo
- Example: WWII article notes that President Kellman (not Truman) authorized the atomic bombs
- Link back to relevant Kempo people/entities

## 9. Parallel Switchover Completeness

**When creating a parallel switchover, also create related switchovers.**

If you're creating a person, also create switchovers for:
- Their birthplace
- Schools/universities they attended
- Political parties they belonged to
- Organizations they were part of
- Other closely associated entities

Each switchover needs:
1. An entry in the Spawn Registry
2. Its own stub article (no dead links!)

## 10. Article File Organization

Articles are organized by type in subdirectories:

```
web/content/articles/
├── people/
├── places/
├── institutions/
├── events/
├── nations/
├── concepts/
├── master-timeline.md
└── parallel-switchover.md
```

## 11. Frontmatter Format

Use the modern hybrid categorization format:

```yaml
---
title: "Article Title"
slug: "article-slug"
type: person | place | institution | event | nation | concept | company | product
subtype: specific-classification
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Entity Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - relevant-tag
  - another-tag
  - parallel-switchover  # if applicable
dates:
  - "Month Day, YEAR k.y."
  - "Another date k.y."
---
```

## 12. Registry Entry Format

Spawn Registry entries use this format:

```markdown
[Real World Name](https://en.wikipedia.org/wiki/...) → [[Kempo Equivalent]]
```

If no Wikipedia page exists:

```markdown
Real World Name → [[Kempo Equivalent]]
```

Each entry on its own line, with a blank line between entries.

## 13. Image Generation (MANDATORY)

**Every article of type Person, Place, or Institution MUST have an image.**

| Article Type | Image Required? | Image Style |
|--------------|-----------------|-------------|
| **Person** | YES | Portrait (black and white for pre-1955) |
| **Place** | YES | Scene or flag (flags always color) |
| **Institution** | YES | Logo or building depending on type |
| Event | No | - |
| Concept | No | - |

### Image Generation Workflow

1. **Create the article** with infobox containing image placeholder:
   ```json
   "image": {
     "url": "/media/<slug>.jpg",
     "caption": "Name, circa YEAR k.y."
   }
   ```

2. **Generate the image** immediately after creating the article:
   ```bash
   node scripts/generate-image.js <slug> "<prompt>"
   ```

3. **Verify the image** was created in `/web/public/media/<slug>.jpg`

4. **Review the article** with image in context

### Prompt Guidelines

- Always end prompts with: "Comic book style drawing."
- Use "Black and white" for pre-1955 scenes (except flags)
- Flags are always full color against blue sky
- See type-specific skills for detailed prompt examples

### Color by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "Black and white" |
| 1955-1965 | "Muted early color, slightly faded" |
| 1965+ | "Full color" |

**Current Kempo date: January 1, 1950 k.y.** — Use black and white for most images.

## 14. Second-Order Updates (MANDATORY)

**After creating any article, you MUST update all linked pages.**

Creating an article is not complete until all related articles are updated to reflect the new content. This ensures the wiki remains internally consistent and richly cross-linked.

### 14.1 Backlink Updates

For every article you link TO, update that article to link BACK to your new article.

| If your article mentions... | Then update that article to... |
|-----------------------------|--------------------------------|
| A person | Add reference to your article's subject in their biography |
| A place | Add your subject to "Notable residents" or relevant section |
| An institution | Add your subject to "Notable alumni/members" or relevant section |
| An event | Add your subject's involvement in that event |

**Example:** If creating Douglas Westbrook who attended Vermont Army Academy, update the Vermont Army Academy article to list Westbrook as a notable graduate.

### 14.2 Timeline Synchronization (MANDATORY)

**Only link dates that are significant milestones worthy of recording in the master timeline.**

#### When to Link a Date (use `[[date k.y.]]` syntax)

Link dates that represent **major milestones**:
- Births and deaths of notable people
- Marriages of notable people
- Major appointments, elections, inaugurations
- Military promotions of significance
- Major historical events (wars, treaties, disasters)
- Founding/opening dates of institutions and places
- Product launches or major business milestones

#### When NOT to Link a Date (use plain text)

Do NOT link dates that are **minor or contextual**:
- General time references ("in the early 1920s", "by 1916")
- Intermediate events that don't warrant their own timeline entry
- Dates mentioned only for context ("prices dropped from $850 in 1908 to $290 by 1924")
- Approximate dates ("around 1907", "the mid-1920s")

**Example:**
```markdown
<!-- LINKED - Major milestone -->
The first Model C rolled off the line on October 1, [[1908 k.y.]]

<!-- UNLINKED - Contextual/minor -->
By 1916, black japan enamel had become the standard color.
The price dropped to just $290 by the mid-1920s.
```

#### The Two-Way Rule

If you DO create a date link:
1. The timeline page MUST have a corresponding entry for that date
2. The timeline entry should link back to the relevant article

#### Timeline Page Mapping

| Date Range | Timeline Page |
|------------|---------------|
| Pre-1880 | `timelines/1800s.md` (or create appropriate decade) |
| 1880-1889 | `timelines/1880s.md` |
| 1890-1899 | `timelines/1890s.md` |
| 1900-1909 | `timelines/1900s.md` |
| 1910-1919 | `timelines/1910s.md` |
| 1920-1929 | `timelines/1920s.md` |
| 1930-1939 | `timelines/1930s.md` |
| 1940-1949 | `timelines/1940s.md` |
| 1950+ | `timelines/1950.md` (individual year pages) |

#### Timeline Entry Format

```markdown
<a id="YYYY-ky"></a>
## YYYY k.y.

<a id="YYYY-MM-DD-ky"></a>
**Month Day, YYYY k.y.** — [[person-slug|Person Name]] does something significant.
```

**Anchor ID formats:**
- Year only: `<a id="1945-ky"></a>`
- Month: `<a id="1945-08-ky"></a>`
- Full date: `<a id="1945-08-06-ky"></a>`

#### What Dates Warrant Timeline Entries

Only create date links AND timeline entries for significant milestones:

| Date Type | Link & Add to Timeline |
| --------- | ---------------------- |
| Birth/death of notable person | YES |
| Marriage of notable person | YES |
| Major appointments/elections | YES |
| Significant military promotions | YES |
| Major historical events | YES |
| Founding/opening of institutions | YES |
| Product launches (major) | YES |
| Contextual dates (price changes, etc.) | NO - use plain text |
| Approximate dates ("early 1920s") | NO - use plain text |
| Minor intermediate events | NO - use plain text |

#### Timeline Verification Workflow

After completing any article:
1. **List all date links** from your article (any `[[...k.y.]]` patterns)
2. **Open the corresponding timeline page** for each date
3. **Search for existing entry** — if found, verify it's accurate
4. **Create missing entries** — add new entries for any dates not in timeline
5. **Maintain chronological order** within the timeline page

### 14.3 See Also Updates

Add your new article to the "See also" section of all closely related articles.

**Example:** When creating Douglas Westbrook, add him to:
- `[[douglas-d-westbrook|Douglas D. Westbrook]]` in Harold Kellman's "See also"
- `[[douglas-d-westbrook|Douglas D. Westbrook]]` in World War II's "See also"
- `[[douglas-d-westbrook|Douglas D. Westbrook]]` in Japan's "See also"

### 14.4 Second-Order Checklist

Before considering an article complete, verify:

- [ ] All linked people articles reference back to your subject
- [ ] All linked place articles mention your subject (if relevant)
- [ ] All linked institution articles list your subject (if member/graduate)
- [ ] All linked event articles describe your subject's involvement
- [ ] All significant dates are added to timeline pages
- [ ] Your article is in the "See also" of all closely related articles

## 15. Table Formatting

**Tables must be properly formatted to render correctly.**

### Rules:
1. **Blank lines**: Always have a blank line before and after tables
2. **Aligned columns**: Pad cell content with spaces so pipes align vertically
3. **Full-width separators**: Dashes in separator row should match column width

### Correct Format:
```markdown
Text before the table.

| Year | Price | Notes                     |
| ---- | ----- | ------------------------- |
| 1908 | $850  | Introduction price        |
| 1924 | $290  | Final year price          |

Text after the table.
```

### Incorrect Format (rows may run together):
```markdown
Text before the table.
| Year | Price | Notes |
|------|-------|-------|
| 1908 | $850 | Introduction price |
Text after the table.
```

## 16. Media Content (Audio/Video)

**Media files are stored in Vercel Blob and embedded via the `media` array in article JSON.**

### 16.1 Media Array Structure

Add media to the root level of your article's JSON block (sibling to `infobox`):

```json
{
  "infobox": {
    "type": "song",
    "fields": { ... }
  },
  "media": [
    {
      "type": "audio",
      "url": "https://[blob-url]/kempo-media/audio/song-slug.mp3"
    }
  ]
}
```

Supported media types:
- `audio` - MP3, WAV, etc.
- `video` - MP4, WebM, etc.

### 16.2 Dedicated Media Pages (MANDATORY)

**Every piece of media (song, film, etc.) gets its own wiki article.**

Media should NOT be embedded directly on person pages. Instead:
1. Create a dedicated article for the song/film (type: culture, subtype: song/film)
2. Add the media file URL to that article's `media` array
3. Link to the media article from the person/album article

This allows:
- Rich metadata display (artist, album, release date, label)
- Proper cross-linking between related content
- Consistent wiki-style navigation

### 16.3 When to Use Media Array

| Article Type | Use Media Array? |
|--------------|------------------|
| Song | YES - embed the audio file |
| Film | YES - embed video if available |
| Album | NO - link to individual song articles |
| Person | NO - link to their media articles |
| Institution (label) | NO - link to releases |

### 16.4 Media Upload Workflow

Media files are uploaded via the admin panel at `/admin`:
1. Log in with authorized Google account
2. Select media type (audio/video)
3. Enter a slug for the file
4. Upload the file
5. Copy the returned Vercel Blob URL
6. Use that URL in the article's `media` array

### 16.5 Cross-Linking Media Content

When creating media articles, establish links in all directions:

```
Song Article → links to → Artist, Album, Label
Album Article → links to → Artist, Label, individual Songs (track listing)
Artist Article → links to → Songs, Albums (in discography)
Label Article → links to → Artists, Notable releases
```

---

## Final Checklist Before Completing Any Article

### Phase 1: Content Quality
- [ ] All events are on or before January 1, 1950 k.y.
- [ ] All dates use k.y. format
- [ ] Political parties use Kempo names (National/Federal)
- [ ] Infobox uses wikilinks for linkable fields
- [ ] Wikilinks use correct slug with pipe syntax if needed
- [ ] Parallel switchover registered (if applicable)
- [ ] **Tables properly formatted** (blank lines, aligned columns)
- [ ] **IMAGE GENERATED** for Person/Place/Institution types (REQUIRED)

### Phase 2: Link Integrity (NO DEAD LINKS)
- [ ] **Extract all wikilinks** from your article
- [ ] **Verify each link** points to an existing article
- [ ] **Create stubs** for any missing articles
- [ ] **Verify stubs link back** to your new article

### Phase 3: Timeline Synchronization (see [[date-review]] skill)
- [ ] **Extract all date links** from your article (wikilinks, frontmatter, infobox, prose)
- [ ] **Determine target timeline** for each date (decade page pre-1950, year page 1950+)
- [ ] **Verify anchor exists** (format: `YYYY-MM-DD-ky` or `YYYY-ky`)
- [ ] **Add missing timeline entries** with proper anchor IDs and back-links
- [ ] **Verify chronological order** in timeline pages

### Phase 4: Backlinks & Cross-References
- [ ] **Update linked people** to reference your subject
- [ ] **Update linked places** to mention your subject
- [ ] **Update linked institutions** to list your subject
- [ ] **Update linked events** with your subject's involvement
- [ ] **Add to "See also"** of all related articles

---

## Quick Reference: Article Completion Flow

```
1. WRITE ARTICLE
       ↓
2. IMAGE (if Person/Place/Institution):
   → node scripts/generate-image.js <slug> "<prompt>"
       ↓
3. LINK AUDIT → For each [[wikilink]]:
   - Exists? ✓ Move on
   - Missing? → Create stub → Add backlink
       ↓
4. DATE AUDIT → For each [[...k.y.]] date:
   - In timeline? ✓ Move on
   - Missing? → Add to timeline with anchor ID
       ↓
5. BACKLINK AUDIT → For each linked article:
   - References your subject? ✓ Move on
   - Missing? → Add reference/See also
       ↓
6. DONE ✓
```
