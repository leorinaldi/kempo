# Create Place Skill

You are creating a **place article** for Kempopedia—a full entry for a fictional or real location in the Kempo universe.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, and more.

## Critical Rules

1. **Current Date: January 1, 1950 k.y.** — No events after this date
2. **No dead links**: Every wikilink must have an article (create stubs)
3. **Infobox wikilinks**: Use `[[wikilinks]]` for state, country, and related places in infobox fields
4. **Real places**: Most real-world places keep their names; use parallel switchover for significant fictional locations

## Place Types

Places use `type: place` in frontmatter, with a `subtype` field to specify the kind of place:

- **nation**: Nation-states and countries (United States, Japan, Germany)
- **state**: US states or equivalent administrative divisions
- **city**: Major metropolitan areas
- **town**: Small towns and municipalities
- **region**: Geographic regions, territories

**Note:** Nations are stored in the `places/` folder with `subtype: nation`. They appear under the Places category but have special image rules (flags).

## Output Format

### Frontmatter

```yaml
---
title: "Place Name"
slug: "place-name"
type: place
subtype: country | state | city | town | region
status: published
parallel_switchover:  # Only if applicable
  real_world: "Real Place Name"
  wikipedia: "https://en.wikipedia.org/wiki/..."
tags:
  - country adjective (e.g., american, japanese)
  - state/region (e.g., missouri)
  - parallel-switchover  # if applicable
dates:
  - "Significant date k.y."
---
```

### Infobox JSON

**Use wikilinks for linkable fields** (state, country, capital). Plain text for names, types, populations.

```json
{
  "infobox": {
    "type": "place",
    "image": {
      "url": "/media/place-name.jpg",
      "caption": "Place Name, circa YEAR k.y."
    },
    "fields": {
      "type": "Country | State | City | Town",
      "state": "[[State Name]]",
      "country": "[[Country Name]]",
      "capital": "[[Capital City]]",
      "population": "X,XXX (YEAR k.y.)"
    }
  },
  "timeline_events": [
    {
      "date": "YEAR k.y.",
      "headline": "Event headline",
      "description": "Description of event"
    }
  ]
}
```

### Article Content (MDX)

```mdx
**Place Name** is a [type] in [[Parent Region/Country]]. [One-sentence description of significance or notable features].

## History

[Historical overview, significant events]

## Geography

[Physical geography, climate, landscape features]

## Notable residents

- [[Person 1]] — brief connection to place
- [[Person 2]] — brief connection to place

## See also

- [[Related Place]]
- [[Related Person]]
- [[Related Event]]
```

## Image Generation (MANDATORY)

> **AUTOMATIC STEP**: Image generation is a REQUIRED part of creating any place article. Do not consider the article complete until an image has been generated and added to the infobox.

After creating the article, generate an image and add it immediately.

### Step 1: Determine Place Type and Image Style

| Place Type | Image Style | Description |
|------------|-------------|-------------|
| **Nation** | Flag (color) | Real nations use real flag; fictional nations get fictional flag |
| **State/Province** | Scenic landscape or capitol | Rolling hills, mountains, farmland, or state capitol building |
| **Major City** | Skyline or downtown scene | Tall buildings, busy streets, urban atmosphere |
| **Small Town** | Main street scene | Downtown storefronts, quiet streets, local character |
| **Historic Site** | The specific location | The landmark, battlefield, or site itself |

**Note on Nations:** Flags are always in **full color** regardless of the current Kempo date. The color-by-era rule does not apply to flags. Use a **plain white background or blue sky** behind the flag to avoid color blending.

### Step 2: Tailor Prompt to Location

Include location-specific details:

**Geographic features:**
- Midwest: Rolling farmland, wheat fields, grain elevators
- New England: Colonial architecture, fall foliage, fishing villages
- Southwest: Desert landscapes, adobe architecture, cacti
- Pacific Coast: Ocean views, palm trees, Spanish mission style
- Japan: Traditional architecture, cherry blossoms, mountainous terrain
- Europe: Historic architecture specific to the region

**Period-appropriate details:**
- 1940s-1950s: Vintage cars, period fashion, old signage, Art Deco elements
- Include era-appropriate technology and infrastructure

**Regional architecture:**
- Small Missouri towns: Red brick buildings, Victorian storefronts
- Japanese cities: Mix of traditional and early modern buildings
- Coastal cities: Harbor, ships, waterfront activity

### Step 3: Apply Color by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "Black and white scene" |
| 1955-1965 | "Muted early color, slightly faded" |
| 1965+ | "Full color" |

**Current Kempo date: January 1, 1950 k.y.** — Use black and white for now.

### Step 4: Build the Prompt

**Template:**
```
Comic book illustration, bold ink lines, graphic novel style. [Scene description] in [Location]. [Geographic/architectural details]. [Period-appropriate elements]. [COLOR STYLE].
```

**Always START with:** "Comic book illustration, bold ink lines, graphic novel style."

This ensures the comic book aesthetic is the primary style driver, not an afterthought.

### Step 5: Examples by Place Type

**Nation (Real - United States):**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of the United States of America waving in the wind against a blue sky. Stars and stripes, red white and blue. Full color.
```

**Nation (Real - Japan):**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of Japan waving in the wind against a blue sky. White flag with red circle (rising sun). Full color.
```

**Nation (Real - Soviet Union):**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of the Soviet Union waving in the wind against a blue sky. Red flag with golden hammer and sickle symbol and gold-bordered red star. Full color.
```

**Nation (Fictional):**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of [Fictional Nation Name] waving in the wind against a blue sky. [Describe the flag design]. Full color.
```

**State (Missouri):**
```
Comic book illustration, bold ink lines, graphic novel style. Rolling farmland in Missouri with a small town in the distance. Grain silos, wooden fences, and a country road. 1940s rural America. Black and white.
```

**Major City (Hiroshima - pre-bombing):**
```
Comic book illustration, bold ink lines, graphic novel style. Downtown Hiroshima, Japan in the 1940s. Traditional Japanese buildings mixed with early 20th century structures. Streetcars, pedestrians in period clothing. Black and white.
```

**Small Town (Liberty, Missouri):**
```
Comic book illustration, bold ink lines, graphic novel style. Main street of a small Missouri town in the 1940s. Red brick storefronts, vintage cars parked along the street, American flags, pedestrians in period clothing. Black and white.
```

**Another Small Town (Lawton, Missouri):**
```
Comic book illustration, bold ink lines, graphic novel style. A quiet rural Missouri town in the late 1800s. Dirt main street, wooden storefronts, horse-drawn wagons, general store with front porch. Black and white.
```

**Japanese City (Nagasaki):**
```
Comic book illustration, bold ink lines, graphic novel style. Harbor view of Nagasaki, Japan in the 1940s. Ships in the port, hillside buildings, mix of traditional Japanese and Western architecture. Black and white.
```

**State Capitol:**
```
Comic book illustration, bold ink lines, graphic novel style. The Missouri State Capitol building in Jefferson City. Neoclassical architecture with dome, American flag flying, manicured grounds. 1940s. Black and white.
```

### Step 6: Generate and Add to Article

1. Generate image: `node scripts/generate-image.js <slug> "<prompt>"`
2. Immediately update infobox with image reference
3. Provide article URL for user review

```json
"image": {
  "url": "/media/<slug>.jpg",
  "caption": "Place Name, circa YEAR k.y."
}
```

**Caption guidelines:**
- States: "Missouri countryside, circa 1945 k.y."
- Cities: "Downtown Liberty, Missouri, circa 1940 k.y."
- Historic scenes: "Hiroshima before August 1945 k.y."

## Parallel Switchover for Places

Most real-world places keep their names (Missouri, Japan, etc.). Use parallel switchover when:
- Creating a fictional town that parallels a real one (Liberty → Independence)
- The location plays a significant role in a character's life

| Real World | Kempo Universe |
|------------|----------------|
| Independence, Missouri | [[Liberty, Missouri]] |

## Connections

Places should connect to:
- **People**: Notable residents, birthplaces
- **Events**: Significant historical events at this location
- **Other places**: Parent regions, nearby cities
- **Institutions**: Schools, organizations located here

## Checklist Before Completing

> **CRITICAL**: A place article is NOT complete until all phases are done. See [[global-rules]] for full details.

### Phase 1: Content Quality
- [ ] All events on or before January 1, 1950 k.y.
- [ ] All dates use k.y. format
- [ ] Infobox uses wikilinks for linkable fields (state, country)
- [ ] Geographic and period details are accurate
- [ ] Parallel switchover registered (if applicable)
- [ ] **IMAGE GENERATED** using `node scripts/generate-image.js` (REQUIRED)
- [ ] Caption includes "circa YEAR k.y."

### Phase 2: Link Integrity (NO DEAD LINKS)
- [ ] All wikilinks point to existing articles
- [ ] Stubs created for any referenced places, people, institutions
- [ ] Stubs link back to this place's article

### Phase 3: Timeline Synchronization
- [ ] Founding date added to appropriate timeline (if applicable)
- [ ] Significant historical events at this location added to timeline
- [ ] All date links in article have corresponding timeline entries

### Phase 4: Backlinks & Cross-References
- [ ] People born/living here listed in "Notable residents"
- [ ] Related places reference back to this location
- [ ] This place added to "See also" of related articles
