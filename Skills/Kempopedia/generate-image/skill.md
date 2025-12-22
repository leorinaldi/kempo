# Generate Image Skill

Generate images for Kempopedia articles using the Grok API.

## Usage

```bash
node scripts/generate-image.js <slug> "<prompt>"
```

Images are saved to `/web/public/media/<slug>.jpg`

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
2. Generate image immediately after
3. Verify image was created
4. User reviews article with image in context

```json
"image": {
  "url": "/media/<slug>.jpg",
  "caption": "Name, circa YEAR k.y."
}
```

## Troubleshooting

- **"XAI_API_KEY not found"**: Ensure `.env` file exists in `/Kempo/` with `XAI_API_KEY="your-key"`
- **API errors**: Check API key validity at https://x.ai/
