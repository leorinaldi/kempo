# Manage Person

Complete lifecycle management for Person entities: database record, article, image, inspirations, and relationships.

## Overview

A fully managed Person in Kempo has:
1. **Person record** — Database entry with structured fields
2. **Article** — Kempopedia biography (linked via `articleId`)
3. **Image** — Portrait photo (linked via `ImageSubject`)
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

Follow [create-person](../../Kempopedia/create-person/skill.md) to write the biography.

**Key article elements:**
- Infobox with all relevant fields
- Wikilinks to places, organizations, other people
- Timeline-worthy dates linked with `[[Date k.y.]]` syntax
- Proper structure (Early life → Career → Personal life → Legacy)

### Step 4: Generate the Image

```bash
node scripts/generate-image.js "<prompt>" --name "Person Name" --category "portrait"
```

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

**Required fields:**
| Field | Description |
|-------|-------------|
| firstName | First name |
| lastName | Last name |
| gender | male, female, other |

**Optional but recommended:**
| Field | Description |
|-------|-------------|
| middleName | Middle name(s) |
| nickname | Common nickname |
| stageName | Professional name (actors, musicians) |
| dateBorn | Birth date (k.y.) |
| dateDied | Death date (k.y.) - null if living |
| articleId | Link to Kempopedia article |

### Step 6: Link the Article

In the Person form:
1. Find the "Article" dropdown
2. Select the biography article you created
3. Save the Person record

This creates the bidirectional link: Person ↔ Article

### Step 7: Link the Image

Option A: Via Image Admin
1. Go to `/admin/world-data/image/manage`
2. Find the portrait image
3. Click Edit
4. Add ImageSubject: itemType="person", itemId=[person's ID]

Option B: Via API/Prisma
```typescript
await prisma.imageSubject.create({
  data: {
    imageId: "image-id",
    itemId: "person-id",
    itemType: "person"
  }
});
```

### Step 8: Add Inspirations

If the person is based on real-world figures:

1. Go to the Person's edit form in admin
2. Find the "Inspirations" section
3. Add entries:
   - **Inspiration**: Real-world name (e.g., "Harry S. Truman")
   - **Wikipedia URL**: Link to Wikipedia article

**Multiple inspirations:** Kempo uses compression (2-4 real → 1 Kempo), so add all relevant sources.

### Step 9: Create Event Links (if applicable)

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

### Step 10: Verify Completeness

Run through this checklist:

- [ ] Person record exists with all relevant fields
- [ ] Article exists and is linked via `articleId`
- [ ] Image exists and is linked via `ImageSubject`
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
