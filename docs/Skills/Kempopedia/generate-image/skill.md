# Generate Image Skill

Generate images for Kempopedia articles using Grok or Gemini APIs, with automatic upload to Vercel Blob and database tracking.

## Usage

Run from the **project root** (`/Users/leonardorinaldi/Claude/Kempo/`):

```bash
node scripts/generate-image.js "<prompt>" --name "Image Name" [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--name "Name"` | Name for the image (required) |
| `--description "Text"` | Human-readable description/caption for the image |
| `--caption "Text"` | Alias for `--description` |
| `--category "type"` | Category: portrait, location, product, logo, etc. |
| `--purpose "type"` | Purpose: profile, action, event, scene |
| `--style "style"` | Style: realistic (default), comic_bw, logo, product |
| `--tool "grok"` | Generation tool: grok (default) or gemini |
| `--article-id "id"` | Link to an article ID |
| `--ky-date "YYYY-MM-DD"` | Set kyDate for temporal filtering (e.g., "1950-06-15") |

### Entity Linking Options

| Option | Description |
|--------|-------------|
| `--person-id "id"` | Link image to a Person (creates ImageSubject record automatically) |
| `--org-id "id"` | Link image to an Organization |
| `--place-id "id"` | Link image to a Place |
| `--is-reference` | Mark as canonical likeness for character consistency |

### Character Consistency Options

| Option | Description |
|--------|-------------|
| `--reference "url"` | Reference image URL for character consistency (uses Gemini) |
| `--from-person "id"` | Look up person's reference image automatically (can be used multiple times for multi-person images) |

## Choosing a Generation Tool

| Tool | Model | Use When |
|------|-------|----------|
| `grok` | grok-2-image-1212 | Portraits, landscapes, general images WITHOUT text |
| `gemini` | gemini-2.0-flash-exp | **DEFAULT for images with text/words.** Signs, marquees, storefronts, any readable text |

> ⚠️ **Important: Use Gemini for ANY image containing text or words.** Grok cannot reliably render readable text. This includes: neon signs, building names, theater marquees, storefronts, banners, newspapers, etc.

**Guidelines:**
- **Use Gemini (--tool gemini)** for ANY image with readable text (signs, marquees, storefronts, building names, neon signs)
- **Use Grok (default)** only for images without text (portraits, rural landscapes, generic locations)
- **Switch to Gemini as fallback** if Grok produces unsatisfactory results after 1-2 attempts
- **Character consistency** automatically uses Gemini (when using `--reference` or `--from-person`)

## Image Purpose Types

| Purpose | Description | Use For |
|---------|-------------|---------|
| `profile` | Standard portrait/headshot | Infobox images, auto-sets `isReference` |
| `action` | Person doing something | Speaking, performing, working |
| `event` | Image from a specific event | Ceremonies, meetings, performances |
| `scene` | Scene or location shot | Establishing shots, environments |

## Character Consistency

Generate multiple images of the same person with consistent likeness using reference images.

### Method 1: Direct Reference URL

Use when you have a specific image URL to reference:

```bash
node scripts/generate-image.js "Person giving a speech at a podium, 1950s, black and white" \
  --name "Person Speaking" \
  --reference "https://blob.vercel-storage.com/image-url.jpg"
```

### Method 2: From Person Record (Recommended)

Use when generating additional images for an existing person:

```bash
node scripts/generate-image.js "Person performing on stage, spotlight, 1950s, black and white" \
  --name "Person Performing" \
  --from-person "PERSON_ID" \
  --purpose "action" \
  --description "Person Name performing at the Palladium, 1952"
```

The `--from-person` flag:
1. Looks up the person's reference image (marked with `isReference=true`)
2. Uses it for character consistency (automatically switches to Gemini)
3. Auto-links the new image to the same person via ImageSubject

### Method 3: Multi-Person Images (Multiple References)

Use multiple `--from-person` flags to generate images with consistent likenesses for multiple characters:

```bash
node scripts/generate-image.js "Two men in suits at a formal event, 1950s, black and white" \
  --name "Goodwin and Langford at Gala" \
  --from-person "GOODWIN_ID" \
  --from-person "LANGFORD_ID" \
  --purpose "action" \
  --description "Jerome Goodwin and Howard Langford at the Ambassador's Gala, 1950"
```

This:
1. Looks up reference images for both persons
2. Sends all reference images to Gemini for multi-character consistency
3. Auto-links the generated image to both persons via ImageSubject

### Setting Up Reference Images

When creating a person's first image, mark it as the canonical likeness:

```bash
node scripts/generate-image.js "Photorealistic portrait of..." \
  --name "Person Name" \
  --person-id "PERSON_ID" \
  --purpose "profile" \
  --is-reference \
  --description "Portrait of Person Name, circa 1950"
```

The `--is-reference` flag (or `--purpose profile`) marks this image as the canonical likeness for future character consistency.

### Character Consistency Workflow

1. **Create profile image** with `--person-id` and `--is-reference`
2. **Generate action shots** with `--from-person` (uses the reference automatically)
3. **Add to articles** via infobox or inline images

### Examples

```bash
# Profile image with auto-linking and reference marking
node scripts/generate-image.js "Photorealistic portrait photograph of a 55-year-old white male politician, dignified expression. Wearing glasses and a formal dark suit. Professional studio lighting, 1940s photography style, black and white." \
  --name "Harold Kellman" \
  --person-id "cmjd59zmu005titwdlfecncg7" \
  --purpose "profile" \
  --is-reference \
  --description "Portrait of Harold S. Kellman, circa 1948" \
  --ky-date "1948-01-01"

# Action shot with character consistency
node scripts/generate-image.js "Photorealistic photograph of a middle-aged male politician giving a speech at a podium, American flags behind him, crowd visible. Professional press photography, 1940s, black and white." \
  --name "Kellman Speech" \
  --from-person "cmjd59zmu005titwdlfecncg7" \
  --purpose "action" \
  --description "Harold Kellman addressing Congress, 1949" \
  --ky-date "1949-03-15"

# Location with signage (use Gemini for text)
node scripts/generate-image.js "Black and white photograph of The Claridge Hotel, an elegant Art Deco luxury hotel. Grand entrance with 'THE CLARIDGE' signage, doormen in uniform. 1940s." \
  --name "The Claridge Hotel" \
  --category "location" \
  --tool gemini

# TV show title card (use Gemini for text)
node scripts/generate-image.js "1950s television title card for 'THE BERNIE KESSLER HOUR' variety show. Art deco styling, UBC TELEVISION logo at bottom." \
  --name "Bernie Kessler Hour Title" \
  --tool gemini \
  --description "Title card for The Bernie Kessler Hour, 1950"

# Movie poster with character reference
node scripts/generate-image.js "Theatrical movie poster for Western film 'ABILENE DAWN'. Starring CLAY MARSHALL. Cowboy on horseback against sunset, desert landscape. 1940s poster art style." \
  --name "Abilene Dawn Poster" \
  --reference "https://blob.vercel-storage.com/clay-marshall-ref.jpg" \
  --tool gemini

# Multi-person image with character consistency for both people
node scripts/generate-image.js "Photorealistic photograph of two men in formal suits shaking hands at a business meeting, 1950s boardroom, black and white." \
  --name "Goodwin Langford Meeting" \
  --from-person "cmjd59zmu005titwdlfecncg7" \
  --from-person "cmjd59zmu005titwdlfecncg8" \
  --purpose "action" \
  --description "Jerome Goodwin and Howard Langford at Pinnacle Pictures board meeting, 1950" \
  --ky-date "1950-03-15"

# Logo (kept as-is)
node scripts/generate-image.js "The flag of a fictional nation waving against blue sky. Red and blue with white star. Full color, crisp edges." \
  --name "Republic of Atlasia Flag" \
  --category "logo" \
  --style logo
```

## Style Categories

| Style | Use For | Description |
|-------|---------|-------------|
| `realistic` | Portraits, locations | **Default for new images.** Photorealistic style |
| `comic_bw` | Legacy images | Black and white comic book style (legacy) |
| `logo` | Flags, emblems, badges | Keep as-is, not regenerated |
| `product` | Vehicles, consumer goods | Keep as-is, not regenerated |

## Prompt Formulas

### Realistic Portraits

```
Photorealistic portrait photograph of a [age] [ethnicity] [gender], [role/profession].
[Physical description: expression, distinctive features].
Wearing [period-accurate clothing].
Professional studio lighting, [era] photography style, [color: "black and white" for pre-1955, "color" for 1955+].
```

**Examples:**

```
Photorealistic portrait photograph of a 50-year-old white male, US Senator.
Distinguished appearance, slight gray at temples, confident expression.
Wearing a dark pinstripe suit with pocket square.
Professional studio lighting, 1940s photography style, black and white.
```

```
Photorealistic portrait photograph of a 35-year-old African American female, jazz singer.
Elegant appearance, warm smile, glamorous styling.
Wearing an evening gown with pearl necklace.
Professional studio lighting, 1950s photography style, black and white.
```

### Realistic Locations

```
Photorealistic photograph of [location type], [era].
[Architectural details, atmosphere, notable features].
Professional architectural photography, period-accurate details, [lighting conditions].
```

**Examples:**

```
Photorealistic photograph of a 1940s American city downtown, Detroit.
Art Deco skyscrapers, busy street with period automobiles, pedestrians in hats and coats.
Professional architectural photography, period-accurate details, overcast afternoon light.
```

```
Photorealistic photograph of a small Missouri town main street, 1940s.
Red brick storefronts, vintage pickup trucks, American flags on lampposts.
Professional architectural photography, period-accurate details, golden hour sunlight.
```

## Color by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "black and white" |
| 1955-1965 | "color, slightly muted tones" |
| 1965+ | "full color" |

**Exception**: Flags and logos are always full color.

## Regenerating Images

To regenerate an existing image with a new style:

```bash
node scripts/regenerate-image.js <image-id> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--prompt "..."` | Override the generation prompt |
| `--style "realistic"` | Target style (default: realistic) |
| `--tool "grok"` | Generation tool: grok (default) or gemini |
| `--update-refs` | Update article references to new image |

### Examples

```bash
# Regenerate with default realistic style (Grok)
node scripts/regenerate-image.js cm123abc --update-refs

# Regenerate with Gemini (for text/lettering issues)
node scripts/regenerate-image.js cm123abc --tool gemini --update-refs

# Regenerate with a new prompt and update references
node scripts/regenerate-image.js cm123abc --prompt "Photorealistic portrait..." --update-refs
```

**Notes:**
- Creates a NEW image record; original is preserved
- New image has `previousVersionId` pointing to original
- Use `--update-refs` to automatically update article infoboxes
- Use `--tool gemini` if the original had text/lettering problems

## Backfilling Existing Images

To set styles on existing images that don't have one:

```bash
# Preview changes
node scripts/backfill-image-styles.js --dry-run

# Apply changes
node scripts/backfill-image-styles.js
```

This sets:
- `logo` category → "logo" style
- `product` category → "product" style
- All others → "comic_bw" style (legacy)

## Workflow

### New Profile Images (with auto-linking)

```bash
node scripts/generate-image.js "Photorealistic portrait..." \
  --name "Person Name" \
  --person-id "PERSON_ID" \
  --purpose "profile" \
  --is-reference \
  --description "Portrait of Person Name, circa 1950"
```

This automatically:
1. Generates the image and uploads to Vercel Blob
2. Creates Image record with metadata
3. Creates ImageSubject link to the person
4. Marks it as reference image for character consistency

Then copy the Blob URL to the article infobox.

### Additional Images (with character consistency)

```bash
node scripts/generate-image.js "Person speaking at podium..." \
  --name "Person Speaking" \
  --from-person "PERSON_ID" \
  --purpose "action" \
  --description "Person Name at the 1950 convention"
```

This automatically:
1. Looks up the person's reference image
2. Uses Gemini for character consistency
3. Creates ImageSubject link to the same person

### Inline Images in Articles

To display images in the article body (not just infobox), add to the article's `inlineImages` field:

```json
{
  "inlineImages": [
    {
      "imageId": "generated-image-id",
      "section": "Career",
      "position": "right",
      "caption": "Person speaking at the 1950 convention"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `imageId` | The generated image's ID |
| `section` | The h2 heading text to place image after (or "intro" for before first h2) |
| `position` | "left", "right", or "center" |
| `caption` | Optional override of image description |

### Temporal Filtering (kyDate)

Images respect the viewing date system via the `kyDate` field:

- **Images without `kyDate`**: Always shown (permissive default)
- **Images with `kyDate`**: Only shown when `viewingDate >= kyDate`

This enables time-appropriate imagery. For example, a 1955 photo won't appear when viewing at 1950.

**Setting `kyDate`** (via CLI at generation time - recommended):

```bash
node scripts/generate-image.js "<prompt>" \
  --name "Person Name" \
  --ky-date "1950-06-15"
```

**Setting `kyDate`** (via Prisma or admin UI for existing images):

```typescript
await prisma.image.update({
  where: { id: imageId },
  data: { kyDate: new Date(1950, 5, 15) }  // June 15, 1950
});
```

**Guidelines:**
- **ALWAYS set `--ky-date` when generating images** - prevents temporal filtering gaps
- Set `kyDate` to when the image would have been "available" in the Kempo world
- For photos: when the photo was taken (or published, if release date matters more)
- For portraits: typically matches the person's earliest article `publishDate`
- For event photos: the date of the event
- For profile images: use the person's debut in articles (check article `publishDate`)

### Manual ImageSubject Linking (legacy)

If you didn't use `--person-id` or `--from-person`, create the link manually:

```typescript
await prisma.imageSubject.create({
  data: {
    imageId: "image-id",
    itemId: "entity-id",
    itemType: "person",  // "person", "organization", "place"
    isReference: true    // if this is the canonical likeness
  }
});
```

### Regenerating Legacy Images

1. Identify image to regenerate by ID (from admin UI)
2. Write a new realistic prompt
3. Run `regenerate-image.js` with `--update-refs`
4. Verify new image looks correct
5. Original is preserved for reference

## Naming Conventions for Batch Processing

When generating multiple images for a yearbook or bulk content creation, use consistent naming to enable automatic linking to articles:

| Entity Type | `--name` Format | Example |
|-------------|-----------------|---------|
| Person | `{Full Name}` | `--name "Dusty Dalton"` |
| Organization | `{Name} Logo` | `--name "Pinnacle Pictures Logo"` |
| City | `{Name} Skyline` or `{Name}` | `--name "Steel City Skyline"` |
| Brand | `{Name} Badge` | `--name "Pioneer Badge"` |
| TV Show | `{Name} Show` | `--name "Dusty Dalton Show"` |
| Brightway | `{Name} Poster` | `--name "Oklahoma Wind Poster"` |
| Comic Strip | `{Name} Comic` | `--name "Bramblewood Comic"` |
| Store/Building | `{Name} Store` | `--name "Hartwells Store"` |
| Emblem | `{Name} Emblem` | `--name "AVL Emblem"` |
| Crest | `{Name} Crest` | `--name "New England University Crest"` |
| Seal | `{Name} Seal` | `--name "Fletcher Committee Seal"` |

These names enable the [yearbook-to-content](../../Workflows/yearbook-to-content/skill.md) workflow to automatically match images to articles and update infoboxes programmatically.

## Output

The scripts output:
- Image ID (for database reference)
- Blob URL (for article infobox)
- Ready-to-use infobox JSON snippet
- Version history link (for regenerated images)

## Environment Variables

Required in `.env` files:

| Variable | Location | Purpose |
|----------|----------|---------|
| `XAI_API_KEY` | `.env` (root) | Grok API key |
| `GEMINI_API_KEY` | `.env` (root) | Google Gemini API key |
| `DATABASE_URL` | `web/.env.local` | PostgreSQL connection |
| `BLOB_READ_WRITE_TOKEN` | `web/.env.local` | Vercel Blob token |

## Troubleshooting

- **"XAI_API_KEY not found"**: Add to `.env` in project root (required for `--tool grok`)
- **"GEMINI_API_KEY not found"**: Add to `.env` in project root (required for `--tool gemini`)
- **"DATABASE_URL not found"**: Add to `web/.env.local`
- **"BLOB_READ_WRITE_TOKEN not found"**: Add to `web/.env.local`
- **Grok API errors**: Check API key validity at https://x.ai/
- **Gemini API errors**: Check API key validity at https://aistudio.google.com/apikey
- **"No prompt available"**: Original image has no stored prompt - provide one with `--prompt`
- **Text/lettering looks garbled**: Use `--tool gemini` instead - Gemini handles text better
