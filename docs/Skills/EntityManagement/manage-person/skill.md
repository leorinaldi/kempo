# Manage Person

Complete lifecycle management for Person entities: database record, article, image, inspirations, and relationships.

## Overview

A fully managed Person in Kempo has:
1. **Person record** — Database entry with structured fields
2. **Article** — Kempopedia biography (linked via `articleId`)
3. **Images** — Profile portrait + action shots (linked via `ImageSubject`)
4. **Inspirations** — Real-world parallels (if applicable)
5. **Relationships** — Connections to events, media, publications

## Creation Workflow

### Step 1: Plan the Person

Before creating, determine:
- Full name (first, middle, last, nickname, stage name)
- Birth/death dates and places
- Key biographical facts
- Real-world inspiration(s) if any
- Related entities that need to exist first (birthplace, organizations, etc.)

### Step 2: Create Prerequisites

Ensure these exist before creating the Person:

| Prerequisite | Why Needed |
|--------------|------------|
| Birth city/state | For birthplace link in article |
| Death city/state | For death place link (if deceased) |
| Organizations | Employers, schools, political parties |
| Related people | Spouse, mentors (if they need articles) |

### Step 3: Create the Article

Follow [article-person](../../Kempopedia/article-person/skill.md) to write the biography.

**Key article elements:**
- Infobox with all relevant fields
- Wikilinks to places, organizations, other people
- Timeline-worthy dates linked with `[[Date k.y.]]` syntax
- Proper structure (Early life → Career → Personal life → Legacy)

### Step 4: Generate the Profile Image

Generate the primary profile image with auto-linking:

```bash
node scripts/generate-image.js "<prompt>" \
  --name "Person Name" \
  --person-id "PERSON_ID" \
  --purpose "profile" \
  --is-reference \
  --description "Portrait of Person Name, circa 1950"
```

**New Flags:**
- `--person-id "ID"` — Auto-creates ImageSubject link (no manual step needed)
- `--is-reference` — Marks as canonical likeness for character consistency
- `--purpose "profile"` — Tags image purpose (profile, action, event, scene)
- `--description "text"` — Human-readable caption for the image

**Prompt formula:**
```
Photorealistic portrait photograph of a [age] [ethnicity] [gender], [role/profession].
[Physical description: expression, distinctive features].
Wearing [period-accurate clothing].
Professional studio lighting, [era] photography style, [COLOR].
```

**Color rules:**
- Pre-1955: "black and white"
- 1955-1965: "color, slightly muted tones"
- 1965+: "full color"

Copy the generated URL to the article infobox.

### Step 5: Create the Person Record

Navigate to `/admin/world-data/people/create`

| Field | Requirement | Description |
|-------|-------------|-------------|
| firstName | **Required** | First name |
| lastName | **Required** | Last name |
| gender | **Required** | male, female, other |
| middleName | Optional | Middle name(s) |
| nickname | Optional | Common nickname (e.g., "Frank" for "Francis") |
| stageName | Optional | Professional name (actors, musicians) |
| dateBorn | Recommended | Birth date (k.y.) — include when known |
| dateDied | Recommended | Death date (k.y.) — null if living |
| articleId | **Required*** | Link to Kempopedia article |

*Every Person record should have a linked article. Create the article first, then link it.

### Step 6: Link the Article

In the Person form:
1. Find the "Article" dropdown
2. Select the biography article you created
3. Save the Person record

This creates the bidirectional link: Person ↔ Article

### Step 7: Link the Image (Auto or Manual)

**If you used `--person-id` flag:** The ImageSubject record was created automatically. Verify in admin that the person shows linked images.

**If you didn't use `--person-id`:** Create the ImageSubject manually:

The Image table links to Articles (via `articleId`), but the ImageSubject table links Images to Entities (Person, Organization, Place, etc.). Both are needed:
- `Image.articleId` → Shows image in article
- `ImageSubject` → Shows image in admin entity pages, enables entity-based queries

**Via Prisma:**
```typescript
await prisma.imageSubject.create({
  data: {
    imageId: "image-id",
    itemId: "person-id",
    itemType: "person",
    isReference: true  // Mark as canonical likeness
  }
});
```

**Batch fix for missing links:**
```bash
# Check for people with images but missing ImageSubject
node --env-file=.env.local -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`
  SELECT p.id, CONCAT(p.first_name, ' ', p.last_name) as name
  FROM people p
  JOIN articles a ON a.id = p.article_id
  JOIN image i ON i.article_id = a.id
  WHERE NOT EXISTS (
    SELECT 1 FROM image_subjects isub
    WHERE isub.item_id = p.id AND isub.item_type = 'person'
  )
\`.then(r => console.log('Missing ImageSubject:', r.length, r))
  .finally(() => prisma.\$disconnect());
"
```

### Step 8: Generate Additional Images (Optional)

For significant people, generate action shots with character consistency:

```bash
# Uses the person's reference image automatically
node scripts/generate-image.js "<action prompt>" \
  --name "Person at Event" \
  --from-person "PERSON_ID" \
  --purpose "action" \
  --description "Person Name giving a speech, 1950"
```

**Examples of action shots:**
- Speaking at a podium
- Performing on stage
- Meeting with officials
- In uniform (military, sports, etc.)
- At significant locations

The `--from-person` flag:
1. Looks up the person's reference image (marked with `isReference=true`)
2. Uses it for character consistency (auto-switches to Gemini)
3. Auto-links the new image to the same person

**Inline Images in Articles:**

To show images in the article body (not just infobox), add to the article's `inlineImages` field:

```json
{
  "inlineImages": [
    {
      "imageId": "generated-image-id",
      "section": "Career",
      "position": "right",
      "caption": "Marshall speaking at the 1950 convention"
    }
  ]
}
```

- `section`: The h2 heading text to place image after (or "intro" for before first h2)
- `position`: "left", "right", or "center"
- `caption`: Optional override of image description

### Step 9: Add Inspirations (if applicable)

If the person is based on real-world figures:

1. Go to the Person's edit form in admin
2. Find the "Inspirations" section
3. Add entries:
   - **Inspiration**: Real-world name (e.g., "Harry S. Truman")
   - **Wikipedia URL**: Link to Wikipedia article

**Multiple inspirations:** Kempo uses compression (2-4 real → 1 Kempo), so add all relevant sources.

### Step 10: Create Event Links (if applicable)

For significant life events, create Event records:

**Birth Event:**
```typescript
await prisma.event.create({
  data: {
    title: "Harold Kellman born",
    kyDateBegin: new Date("1897-05-03"),
    eventType: "birth",
    significance: 7
  }
});

await prisma.eventPerson.create({
  data: {
    eventId: "event-id",
    personId: "person-id",
    role: "subject"
  }
});
```

**Other events:** elections, inaugurations, deaths, major achievements

### Step 11: Verify Completeness

Run through this checklist:

- [ ] Person record exists with all relevant fields
- [ ] Article exists and is linked via `articleId`
- [ ] Profile image exists and is linked via `ImageSubject`
- [ ] Profile image has `isReference: true` for character consistency
- [ ] Additional action shots generated (for significant figures)
- [ ] Inline images configured in article (if using action shots)
- [ ] Inspirations recorded (if applicable)
- [ ] Birth/death events created (for significant figures)
- [ ] Article wikilinks all resolve (no dead links)
- [ ] Timeline entries exist for linked dates
- [ ] Related articles updated (mentioned people, places, orgs)

## Update Workflow

When updating an existing Person:

### Updating Basic Info
1. Go to `/admin/world-data/people/manage`
2. Find the person, click Edit
3. Update fields
4. Save

### Updating the Article
1. Edit the article content
2. Update infobox fields if needed
3. Verify wikilinks still resolve
4. Update timeline entries if dates changed

### Regenerating the Image
```bash
node scripts/regenerate-image.js <image-id> --update-refs
```

This creates a new image version while preserving the original.

### Adding New Inspirations
1. Go to Person edit form
2. Add new inspiration entries
3. Existing inspirations are preserved

## Relationship Tracking

### Person → Media

| Relationship | Via Table | Role Field |
|--------------|-----------|------------|
| Sang on audio | AudioElement | singer |
| Composed audio | AudioElement | composer |
| Wrote lyrics | AudioElement | lyricist |
| Produced audio | AudioElement | producer |
| Acted in video | VideoElement | actor |
| Directed video | VideoElement | director |
| Wrote video | VideoElement | writer |
| Produced video | VideoElement | producer |

### Person → Publications

| Relationship | Via Table | Role Field |
|--------------|-----------|------------|
| Authored | PublicationElement | author |
| Edited | PublicationElement | editor |
| Column writer | PublicationElement | columnist |
| Reported | PublicationElement | reporter |
| Illustrated | PublicationElement | illustrator |
| Photographed | PublicationElement | photographer |

### Person → Events

| Relationship | Via Table | Role Field |
|--------------|-----------|------------|
| Event about them | EventPerson | subject |
| Participated | EventPerson | participant |
| Witnessed | EventPerson | witness |
| Performed | EventPerson | performer |
| Was victim | EventPerson | victim |
| Was perpetrator | EventPerson | perpetrator |

## Common Issues

### Article not showing in dropdown
- Check article `type` is "person"
- Check article isn't already linked to another Person
- Refresh the page

### Image not linking
- Verify imageId and personId are correct
- Check itemType is exactly "person" (lowercase)
- Ensure no duplicate ImageSubject exists

### Inspiration not saving
- Verify subjectType is "person"
- Check subjectId matches the Person record

## Database Schema Reference

```prisma
model Person {
  id          String    @id @default(cuid())
  firstName   String
  middleName  String?
  lastName    String
  nickname    String?
  stageName   String?
  gender      String
  dateBorn    DateTime?
  dateDied    DateTime?
  articleId   String?   @unique
  article     Article?
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Create Person | `/admin/world-data/people/create` |
| Manage People | `/admin/world-data/people/manage` |
| Manage Images | `/admin/world-data/image/manage` |
