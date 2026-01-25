# Manage Place

Complete lifecycle management for location entities: Nation, State, City, and Place records with articles, images, and relationships.

## Overview

A fully managed location in Kempo has:
1. **Location record** — Database entry (Nation, State, City, or Place)
2. **Article** — Kempopedia article (linked via `articleId`)
3. **Image** — Flag, skyline, or scene (linked via `ImageSubject`)
4. **Inspirations** — Real-world parallels (for fictional locations)

## Location Hierarchy

```
Nation
  └── State
        └── City
              └── Place (specific venues, buildings)
                    └── Place (nested, e.g., room within building)
```

**Example:**
```
United States (Nation)
  └── Michigan (State)
        └── Motor City (City) — inspired by Detroit
              └── Continental Motors HQ (Place)
              └── Motor City Arena (Place)
```

## Location Types

### Nation
Countries and sovereign states.
- Most real nations keep their names (United States, Japan, Germany)
- Create inspirations only for fictional nations

### State
States, provinces, territories.
- US states typically keep real names
- Create inspirations for fictional states if needed

### City
Metropolitan areas and municipalities.
- Major cities may have Kempo names (Detroit → Motor City)
- Smaller cities often keep real names

### Place
Specific locations within cities:
- Buildings, venues, landmarks
- Businesses, restaurants, hotels
- Parks, monuments
- Can nest within other Places

## Creation Workflow

### Step 1: Determine Location Type

| Creating | Model | Parent Required |
|----------|-------|-----------------|
| Nation | Nation | None |
| State | State | Nation |
| City | City | State |
| Place | Place | City (and optionally parent Place) |

### Step 2: Create Parent Locations

Work top-down. Before creating Motor City:
1. Ensure "United States" Nation exists
2. Ensure "Michigan" State exists
3. Then create "Motor City" City

### Step 3: Create the Article

Follow [create-place](../../Kempopedia/create-place/skill.md) to write the article.

**Key article elements:**
- Infobox with location type, parent, population
- History section
- Notable residents
- Landmarks (for cities)
- Wikilinks to people and events

### Step 4: Generate the Image

**For Nations (flags):**
```bash
node scripts/generate-image.js "<prompt>" --name "Nation Name" --category "logo" --style logo
```
```
Flag of [Nation Name] waving against blue sky. [Design: colors, symbols, stripes, emblems]. Full color, crisp edges.
```

**For States (landscapes or capitol):**
```bash
node scripts/generate-image.js "<prompt>" --name "State Name" --category "location"
```
```
Photorealistic photograph of [state landmark or landscape]. [Description]. Professional landscape photography, [era], [COLOR].
```

**For Cities (skylines):**
```bash
node scripts/generate-image.js "<prompt>" --name "City Name" --category "location"
```
```
Photorealistic photograph of [City Name] skyline, [era]. [Architectural details, notable buildings]. Professional architectural photography, [COLOR].
```

**For Places (buildings, venues):**
```bash
node scripts/generate-image.js "<prompt>" --name "Place Name" --category "location"
```
```
Photorealistic photograph of [Place Name], [place type] in [City]. [Architectural details]. Professional photography, [era], [COLOR].
```

Use `--tool gemini` if the image includes signage or text.

### Step 5: Create the Location Record

Navigate to `/admin/world-data/locations`

**Nation fields:**
| Field | Description |
|-------|-------------|
| name | Country name |
| shortCode | ISO-style code (US, JP, DE) |
| dateFounded | Founding date |
| lat, long | Coordinates (optional) |
| articleId | Link to article |

**State fields:**
| Field | Description |
|-------|-------------|
| name | State name |
| abbreviation | Two-letter code (MI, NY) |
| stateType | state, territory, province |
| nationId | Parent nation (required) |
| lat, long | Coordinates (optional) |
| articleId | Link to article |

**City fields:**
| Field | Description |
|-------|-------------|
| name | City name |
| cityType | city, town, village |
| stateId | Parent state (required) |
| lat, long | Coordinates (optional) |
| articleId | Link to article |

**Place fields:**
| Field | Description |
|-------|-------------|
| name | Place name |
| placeType | building, venue, landmark, park, etc. |
| cityId | Parent city (required) |
| parentPlaceId | Parent place (for nesting) |
| address | Street address |
| dateOpened | Opening date |
| dateClosed | Closing date |
| lat, long | Coordinates (optional) |
| articleId | Link to article |

### Step 6: Link the Article

In the location form, select the article from the dropdown.

### Step 7: Link the Image

1. Go to `/admin/world-data/image/manage`
2. Find the location image
3. Add ImageSubject with appropriate itemType:
   - "nation" for nations
   - "state" for states
   - "city" for cities
   - "place" for places

### Step 8: Add Inspirations

For fictional locations based on real places:

| Kempo | Real World |
|-------|------------|
| Motor City | Detroit |
| Steel City | Pittsburgh |
| Lawton, Missouri | Lamar, Missouri |

### Step 9: Link to Events

Locations are linked to events via EventLocation:

```typescript
await prisma.eventLocation.create({
  data: {
    eventId: "event-id",
    locationId: "city-id",
    locationType: "city",
    role: "occurred_at"
  }
});
```

Roles: `occurred_at`, `originated_from`, `spread_to`, `destination`

### Step 10: Verify Completeness

- [ ] Location record exists with parent link
- [ ] Article exists and is linked via `articleId`
- [ ] Image exists and is linked via `ImageSubject`
- [ ] Inspirations recorded (for fictional locations)
- [ ] Parent article mentions this location (if relevant)
- [ ] Notable residents linked in article
- [ ] Events at this location linked via EventLocation

## Update Workflow

### Updating Location Info
1. Go to `/admin/world-data/locations`
2. Navigate to the appropriate level (nations/states/cities/places)
3. Find and edit the record

### Adding Notable Residents
1. Update the location article's "Notable residents" section
2. Update each resident's article to mention the location

### Changing Parent Location
1. Update the parent ID field
2. Update both location articles
3. Verify no broken references

## Fictional Location Patterns

### City Naming

| Real City | Kempo City | Reason |
|-----------|------------|--------|
| Detroit | Motor City | Industry reference |
| Pittsburgh | Steel City | Industry reference |
| New York | (keep as-is) | Too iconic to change |
| Los Angeles | (keep as-is) | Too iconic to change |

### Town Naming

For small towns (birthplaces, etc.):
- Change the name slightly
- Keep the state
- Example: Lamar, Missouri → Lawton, Missouri

### Place Naming

| Real Venue | Kempo Venue | Type |
|------------|-------------|------|
| Madison Square Garden | [TBD] | Arena |
| Empire State Building | [TBD] | Building |
| Waldorf-Astoria | The Claridge | Hotel |

## Relationship Tracking

### Location Contains

| Contains | Via Field | On Model |
|----------|-----------|----------|
| States | nationId | State |
| Cities | stateId | City |
| Places | cityId | Place |
| Nested places | parentPlaceId | Place |

### Location in Events

| Relationship | Via Table | Role |
|--------------|-----------|------|
| Event location | EventLocation | occurred_at, originated_from, spread_to, destination |

### Location in Articles

People reference locations via:
- Birth_place in infobox
- Death_place in infobox
- Location wikilinks in article text

## Map Integration

Locations with coordinates appear on the map at `/admin/world-data/locations/map`.

Set `lat` and `long` for:
- Cities (required for map display)
- Significant places (landmarks, venues)

## Database Schema Reference

```prisma
model Nation {
  id            String    @id @default(cuid())
  name          String
  shortCode     String?
  dateFounded   DateTime?
  dateDissolved DateTime?
  lat           Float?
  long          Float?
  articleId     String?   @unique

  states State[]
}

model State {
  id           String   @id @default(cuid())
  name         String
  abbreviation String?
  stateType    String   @default("state")
  nationId     String
  nation       Nation
  lat          Float?
  long         Float?
  articleId    String?  @unique

  cities City[]
}

model City {
  id        String  @id @default(cuid())
  name      String
  cityType  String  @default("city")
  stateId   String
  state     State
  lat       Float?
  long      Float?
  articleId String? @unique

  places Place[]
}

model Place {
  id            String    @id @default(cuid())
  name          String
  placeType     String?
  cityId        String
  city          City
  parentPlaceId String?
  parentPlace   Place?
  address       String?
  dateOpened    DateTime?
  dateClosed    DateTime?
  lat           Float?
  long          Float?
  articleId     String?   @unique

  childPlaces Place[]
}
```

## Admin Paths

| Action | Path |
|--------|------|
| Manage Locations | `/admin/world-data/locations` |
| Location Map | `/admin/world-data/locations/map` |
| Manage Images | `/admin/world-data/image/manage` |
