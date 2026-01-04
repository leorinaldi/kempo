# Generate Image Skill

Generate images for Kempopedia articles using the Grok API, with automatic upload to Vercel Blob and database tracking.

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
| `--article-id "id"` | Link to an article ID |

### Examples

```bash
# Person portrait
node scripts/generate-image.js "1940s presidential portrait, black and white. Comic book style drawing." --name "Harold Kellman" --category "portrait"

# Location
node scripts/generate-image.js "Comic book illustration of a Western town main street, 1940s. Black and white." --name "Abilene Main Street" --category "location"

# Flag
node scripts/generate-image.js "Comic book illustration, bold ink lines. The flag of a fictional nation waving against blue sky. Full color." --name "Republic of Atlasia Flag" --category "logo"
```

## Prompt Formula

1. **Role/archetype**: President, soldier, shopkeeper, etc.
2. **Time period**: "1920s", "late 1940s", etc.
3. **Physical description**: Age, ethnicity, build, expression
4. **Clothing/accessories**: Suit, uniform, fedora, etc.
5. **Setting** (optional): When it adds context
6. **Color style**: Based on era
7. **Style**: Always end with "Comic book style drawing."

## Color by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "Black and white" |
| 1955-1965 | "Muted early color, slightly faded" |
| 1965+ | "Full color" |

**Exception**: Flags are always full color with blue sky background.

## Prompt Examples

**Person (Politician):**
```
Image of a fictional US President in the late 1940s. Older white intellectual male, dignified demeanor. Wearing glasses and a formal suit. Black and white portrait. Comic book style drawing.
```

**Person (Military):**
```
Image of a fictional US Army Colonel from World War I era. Middle-aged white male, serious expression. In military uniform with medals. Black and white portrait. Comic book style drawing.
```

**Nation (Flag):**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of Japan waving in the wind against a blue sky. White flag with red circle. Full color.
```

**Place (Town):**
```
Comic book illustration, bold ink lines, graphic novel style. Main street of a small Missouri town in the 1940s. Red brick storefronts, vintage cars. Black and white.
```

**Institution (Logo):**
```
A blue star on a white background as a logo for a fictional national US political party. Clean graphic design. Comic book style drawing.
```

**Institution (Building):**
```
Comic book illustration, bold ink lines, graphic novel style. A prestigious American military academy campus. Stone Gothic buildings, cadets in formation. Black and white.
```

## Workflow

1. Create the article with image placeholder in infobox
2. Run the generate-image script with prompt and name
3. Script generates image, uploads to Vercel Blob, creates Image record
4. Copy the Blob URL from output to article infobox
5. Optionally link image to subjects in admin UI

## Output

The script outputs:
- Image ID (for database reference)
- Blob URL (for article infobox)
- Ready-to-use infobox JSON snippet

## Environment Variables

Required in `.env` files:

| Variable | Location | Purpose |
|----------|----------|---------|
| `XAI_API_KEY` | `.env` (root) | Grok API key |
| `DATABASE_URL` | `web/.env.local` | PostgreSQL connection |
| `BLOB_READ_WRITE_TOKEN` | `web/.env.local` | Vercel Blob token |

## Troubleshooting

- **"XAI_API_KEY not found"**: Add to `.env` in project root
- **"DATABASE_URL not found"**: Add to `web/.env.local`
- **"BLOB_READ_WRITE_TOKEN not found"**: Add to `web/.env.local`
- **API errors**: Check API key validity at https://x.ai/
