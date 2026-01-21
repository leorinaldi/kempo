# Generate Image Skill

Generate images for Kempopedia articles using Grok or Gemini APIs, with automatic upload to Vercel Blob and database tracking.

## Usage

```bash
node scripts/generate-image.js "<prompt>" --name "Image Name" [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--name "Name"` | Name for the image (required) |
| `--caption "Text"` | Image caption/description |
| `--category "type"` | Category: portrait, location, product, logo, etc. |
| `--style "style"` | Style: realistic (default), comic_bw, logo, product |
| `--tool "grok"` | Generation tool: grok (default) or gemini |
| `--article-id "id"` | Link to an article ID |

## Choosing a Generation Tool

| Tool | Model | Use When |
|------|-------|----------|
| `grok` | grok-2-image-1212 | **Default.** Most portraits, landscapes, general images |
| `gemini` | gemini-2.0-flash-exp | Images with text/lettering (signs, hotel names, storefronts), or as fallback when Grok produces poor results |

**Guidelines:**
- **Start with Grok** for most images (portraits, rural landscapes, generic locations)
- **Use Gemini first** when the image involves readable text (building signs, neon signs, marquees, etc.)
- **Switch to Gemini as fallback** if Grok produces unsatisfactory results after 1-2 attempts

### Examples

```bash
# Realistic portrait (default: Grok)
node scripts/generate-image.js "Photorealistic portrait photograph of a 55-year-old white male politician, dignified expression. Wearing glasses and a formal dark suit. Professional studio lighting, 1940s photography style, black and white." --name "Harold Kellman" --category "portrait"

# Location with signage (use Gemini for text)
node scripts/generate-image.js "Black and white photograph of The Claridge Hotel, an elegant Art Deco luxury hotel. Grand entrance with 'THE CLARIDGE' signage, doormen in uniform. 1940s." --name "The Claridge Hotel" --category "location" --tool gemini

# Realistic location without text (default: Grok)
node scripts/generate-image.js "Photorealistic photograph of a Western frontier town main street, 1940s. Dirt road, wooden storefronts with awnings, vintage automobiles. Professional architectural photography, period-accurate details." --name "Abilene Main Street" --category "location"

# Logo (kept as-is)
node scripts/generate-image.js "The flag of a fictional nation waving against blue sky. Red and blue with white star. Full color, crisp edges." --name "Republic of Atlasia Flag" --category "logo" --style logo
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

### New Images

1. Create the article with image placeholder in infobox
2. Run `generate-image.js` with realistic prompt
3. Script generates image, uploads to Vercel Blob, creates Image record with metadata
4. Copy the Blob URL from output to article infobox
5. Optionally link image to subjects in admin UI

### Regenerating Legacy Images

1. Identify image to regenerate by ID (from admin UI)
2. Write a new realistic prompt
3. Run `regenerate-image.js` with `--update-refs`
4. Verify new image looks correct
5. Original is preserved for reference

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
