# Manage Organization

Complete lifecycle management for Organization entities: database record, article, image, inspirations, and relationships.

## Overview

A fully managed Organization in Kempo has:
1. **Organization record** — Database entry with structured fields
2. **Article** — Kempopedia article (linked via `articleId`)
3. **Image** — Logo or building photo (linked via `ImageSubject`)
4. **Inspirations** — Real-world parallels (if applicable)
5. **Child entities** — Brands, albums (as label), series (as network), publications (as publisher)

## Organization Types

| orgType | Description | Examples |
|---------|-------------|----------|
| company | Commercial business | Continental Motors, Hartwell's |
| studio | Film/TV production | Pacific Pictures, Pinnacle Pictures |
| network | Broadcasting | UBC (United Broadcasting Company) |
| label | Record label | Sunbright Records |
| publisher | Print publisher | Know! Publications |
| political-party | Political party | National Party, Federal Party |
| government-agency | Government body | Federal Bureau of Security |
| military | Military branch | United States Army |
| university | Higher education | Hartwell University |
| institution | General institution | Vermont Army Academy |
| hospital | Medical facility | Motor City General |
| religious | Religious organization | Churches |

## Creation Workflow

### Step 1: Plan the Organization

Before creating, determine:
- Official name and abbreviation
- Organization type (see table above)
- Founding date and location
- Key figures (founders, leaders)
- Real-world inspiration(s) if any
- Child entities (brands, publications, etc.)

### Step 2: Create Prerequisites

Ensure these exist before creating:

| Prerequisite | Why Needed |
|--------------|------------|
| Headquarters city/state | For location link |
| Founder(s) | Person records for key figures |
| Parent organization | If this is a subsidiary |

### Step 3: Create the Article

Follow [create-organization](../../Kempopedia/create-organization/skill.md) to write the article.

**Key article elements:**
- Infobox with official name, abbreviation, founding date
- History section with founding story
- Notable members/alumni/employees
- Wikilinks to people, places, child entities

### Step 4: Generate the Image

**For logos (political parties, agencies, brands):**
```bash
node scripts/generate-image.js "<prompt>" --name "Org Name" --category "logo" --style logo
```

**For buildings (universities, studios, companies):**
```bash
node scripts/generate-image.js "<prompt>" --name "Org Name" --category "location"
```

**Logo prompt:**
```
Logo for [Organization Name], a [type]. [Design description: colors, symbols, typography]. Clean graphic design, professional quality, white background.
```

**Building prompt:**
```
Photorealistic photograph of [building description], headquarters of [Organization Name] in [City]. [Architectural details]. Professional architectural photography, [era] style, [COLOR].
```

### Step 5: Create the Organization Record

Navigate to `/admin/world-data/organizations/create`

**Required fields:**
| Field | Description |
|-------|-------------|
| name | Official name |
| orgType | See organization types above |

**Optional but recommended:**
| Field | Description |
|-------|-------------|
| abbreviation | Short form (UBC, FBI, etc.) |
| dateFounded | Founding date (k.y.) |
| dateDissolved | End date (null if active) |
| articleId | Link to Kempopedia article |

### Step 6: Link the Article

In the Organization form:
1. Find the "Article" dropdown
2. Select the article you created
3. Save the Organization record

### Step 7: Link the Image

1. Go to `/admin/world-data/image/manage`
2. Find the logo/building image
3. Click Edit
4. Add ImageSubject: itemType="organization", itemId=[org's ID]

### Step 8: Add Inspirations

If based on real-world organizations:

1. Go to the Organization's edit form
2. Add inspiration entries:
   - **Inspiration**: Real-world name (e.g., "General Motors")
   - **Wikipedia URL**: Link to Wikipedia

### Step 9: Create Child Entities

Organizations often own other entities:

**Brands:**
```
Organization: Continental Motors
  └── Brand: Monarch
  └── Brand: Sterling
```
Create Brand records with `organizationId` pointing to this org.

**As Record Label:**
```
Organization: Sunbright Records
  └── Album: "In the Wee Small Hours" (labelId → Sunbright)
```

**As Network:**
```
Organization: UBC
  └── Series: "I Like Linda" (networkId → UBC)
  └── Series: "The Dusty Dalton Show" (networkId → UBC)
```

**As Publisher:**
```
Organization: Know! Publications
  └── PublicationSeries: "Know! Magazine" (publisherId → Know!)
```

**As Studio:**
```
Organization: Pacific Pictures
  └── Video (movie): MovieMetadata.studioId → Pacific Pictures
```

### Step 10: Verify Completeness

- [ ] Organization record exists with all relevant fields
- [ ] Article exists and is linked via `articleId`
- [ ] Image exists and is linked via `ImageSubject`
- [ ] Inspirations recorded (if applicable)
- [ ] Child entities created and linked (brands, publications, etc.)
- [ ] Founder/leader Person records exist and link back
- [ ] Article wikilinks all resolve
- [ ] Related articles updated (founders, members, locations)

## Update Workflow

### Updating Basic Info
1. Go to `/admin/world-data/organizations/manage`
2. Find the organization, click Edit
3. Update fields, Save

### Adding Child Entities
1. Create the child entity (Brand, Series, etc.)
2. Set the appropriate foreign key (organizationId, networkId, etc.)
3. Update the organization article to mention the new entity

### Changing Organization Type
1. Update `orgType` in the record
2. Review and update article content to match
3. Verify child entity relationships still make sense

## Relationship Tracking

### Organization as Owner

| Owns | Via Field | On Model |
|------|-----------|----------|
| Brands | organizationId | Brand |
| Albums (as label) | labelId | Album |
| Series (as network) | networkId | Series |
| Publications (as publisher) | publisherId | PublicationSeries, Publication |
| Movies (as studio) | studioId | MovieMetadata |
| Commercials (as agency) | agencyId | CommercialMetadata |

### Organization in Events

Link via EventMedia when the organization is subject of an event:
- Founding events
- Major milestones
- Mergers, acquisitions

## Common Naming Patterns

| Real World | Kempo Equivalent |
|------------|------------------|
| General Motors | Continental Motors |
| Ford Motor Company | American Motors |
| NBC/CBS/ABC | UBC (United Broadcasting Company) |
| Columbia Pictures | Pacific Pictures |
| MGM | Pinnacle Pictures |
| RCA Records | Sunbright Records |
| Democratic Party | National Party |
| Republican Party | Federal Party |
| FBI | Federal Bureau of Security |
| West Point | Vermont Army Academy |
| Harvard | Hartwell University |

## Database Schema Reference

```prisma
model Organization {
  id            String    @id @default(cuid())
  name          String
  abbreviation  String?
  orgType       String
  dateFounded   DateTime?
  dateDissolved DateTime?
  articleId     String?   @unique
  article       Article?

  // Reverse relations
  brands        Brand[]
  albums        Album[]
  movies        MovieMetadata[]
  series        Series[]
  commercials   CommercialMetadata[]
  publications  PublicationSeries[]
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Create Organization | `/admin/world-data/organizations/create` |
| Manage Organizations | `/admin/world-data/organizations/manage` |
| Create Brand | `/admin/world-data/brands/create` |
| Manage Images | `/admin/world-data/image/manage` |
