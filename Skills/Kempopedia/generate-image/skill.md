# Generate Image Skill

Generate images for Kempopedia articles using the Grok API (xAI).

## Prerequisites

- Node.js 18+ (for native fetch support)
- XAI_API_KEY in `/Kempo/.env` file

## Usage

```bash
# From the Kempo directory:
node scripts/generate-image.js <slug> "<prompt>"
```

### Example

```bash
node scripts/generate-image.js harold-kellman "Image of a fictional US President in the late 1940s and early 1950s. Older white intellectual male wearing glasses and a suit. Black and white portrait. Comic book style drawing."
```

## Prompt Formula

For best results, include these elements in your prompt:

1. **Role/archetype**: President, political boss, shopkeeper, soldier, etc.
2. **Time period**: "1920s", "late 1940s", "early 1950s", etc.
3. **Physical description**: Age, ethnicity, build, demeanor/expression
4. **Clothing/accessories**: Suit, fedora, cigar, glasses, uniform, etc.
5. **Setting/background** (optional): When it adds context to the character
6. **Color style**: Based on era (see below)
7. **Style**: Always end with "Comic book style drawing."

### Template

```
Image of a fictional [ROLE] in [TIME PERIOD]. [PHYSICAL DESCRIPTION: age, ethnicity, build, demeanor]. [CLOTHING/ACCESSORIES]. [OPTIONAL: setting/background]. [COLOR STYLE]. Comic book style drawing.
```

## Color Style by Era

| Era | Color Style |
|-----|-------------|
| Pre-1955 | "Black and white" |
| 1955-1965 | "Muted early color, slightly faded" |
| 1965+ | "Full color" |

**Current Kempo date: January 1, 1950 k.y.** — Use black and white for now.

### Examples by Article Type

**Person (Leader/Politician)**
```
Image of a fictional US President in the late 1940s. Older white intellectual male, dignified demeanor. Wearing glasses and a formal suit. Black and white portrait. Comic book style drawing.
```

**Person (Political Boss)**
```
Image of a fictional 1920s American political boss. Older heavy-set Irish-American male, stern commanding presence. Wearing a dark suit and fedora hat, smoking a cigar. Back-room politician. Black and white portrait. Comic book style drawing.
```

**Person (Businessman)**
```
Image of a fictional American businessman in the 1920s. Middle-aged white male, friendly face. Wearing a three-piece suit with vest. Standing in a men's haberdashery shop with hats and clothing displays in the background. Black and white portrait. Comic book style drawing.
```

**Person (Military)**
```
Image of a fictional US Army Colonel from World War I era. Middle-aged white male, serious expression. In military uniform with medals. Black and white portrait. Comic book style drawing.
```

**Person (Woman)**
```
Image of a fictional First Lady in the late 1940s. Middle-aged white woman, graceful demeanor. Styled hair, wearing an elegant dress. Black and white portrait. Comic book style drawing.
```

**Nation (Real Flag)**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of Japan waving in the wind against a blue sky. White flag with red circle (rising sun). Full color.
```

**Nation (Fictional Flag)**
```
Comic book illustration, bold ink lines, graphic novel style. The flag of [Fictional Nation] waving in the wind against a blue sky. [Describe flag design]. Full color.
```

Note: Nation flags are always **full color** regardless of the current Kempo date. Use a **blue sky background** to avoid color blending with the flag.

**Place (State - Scenic)**
```
Comic book illustration, bold ink lines, graphic novel style. Rolling farmland in Missouri with a small town in the distance. Grain silos, wooden fences, and a country road. 1940s rural America. Black and white.
```

**Place (Small Town)**
```
Comic book illustration, bold ink lines, graphic novel style. Main street of a small Missouri town in the 1940s. Red brick storefronts, vintage cars parked along the street, American flags, pedestrians in period clothing. Black and white.
```

**Place (Major City)**
```
Comic book illustration, bold ink lines, graphic novel style. Downtown Hiroshima, Japan in the 1940s. Traditional Japanese buildings mixed with early 20th century structures. Streetcars, pedestrians in period clothing. Black and white.
```

**Place (Harbor City)**
```
Comic book illustration, bold ink lines, graphic novel style. Harbor view of Nagasaki, Japan in the 1940s. Ships in the port, hillside buildings, mix of traditional Japanese and Western architecture. Black and white.
```

**Place (Historic Town - 1800s)**
```
Comic book illustration, bold ink lines, graphic novel style. A quiet rural Missouri town in the late 1800s. Dirt main street, wooden storefronts, horse-drawn wagons, general store with front porch. Black and white.
```

**Institution (Political Party)**
```
Emblem of a fictional American political party. Blue star symbol on patriotic background. Clean graphic design. Comic book style drawing.
```

**Events and Concepts:** No images needed for now.

## Output

Images are saved to:
```
/web/public/media/<slug>.jpg
```

## Workflow

**Always add the image to the article immediately after generating.**

1. Generate the image with the script
2. Update the article's infobox with the image reference
3. Provide the article URL for user to review
4. User approves or requests regeneration by viewing the full article

```json
"image": {
  "url": "/media/<slug>.jpg",
  "caption": "Name, circa YEAR k.y."
}
```

Images are clickable in the infobox to view full size.

**Do not ask user to approve image separately** — embed it in the article and let them see it in context.

## API Details

- **Endpoint**: `https://api.x.ai/v1/images/generations`
- **Model**: `grok-2-image`
- **Response**: URL to generated image (temporary, downloaded immediately)

## Troubleshooting

**"XAI_API_KEY not found"**
- Ensure `.env` file exists in `/Kempo/` with `XAI_API_KEY="your-key"`

**API errors**
- Check API key is valid at https://x.ai/
- Rate limits may apply
