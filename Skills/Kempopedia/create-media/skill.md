# Create Media Article (Song/Album)

You are creating a **media article** for Kempopedia—a song, album, film, or other cultural work.

> **IMPORTANT**: Before creating any article, review the [[global-rules]] skill for mandatory rules about current date, dead links, infobox formatting, media embedding, and more.

## Media Article Types

| Type | Subtype | Has Media File? |
|------|---------|-----------------|
| culture | song | YES - audio embedded |
| culture | album | NO - links to songs |
| culture | film | YES - video if available |
| culture | book | NO |
| culture | radio-program | YES - audio if available |

## Song Article Template

```yaml
---
title: "Song Title"
slug: "song-title"
type: culture
subtype: song
status: published
tags:
  - american
  - music
  - song
  - [genre]
  - [decade]
dates:
  - "YEAR k.y."
---
```

```json
{
  "infobox": {
    "type": "song",
    "fields": {
      "Title": "Song Title",
      "Artist": "[[artist-slug|Artist Name]]",
      "Album": "[[album-slug|Album Title]]",
      "Released": "[[YEAR k.y.]]",
      "Genre": "Genre, another genre",
      "Label": "[[label-slug|Label Name]]",
      "Length": "3:12"
    }
  },
  "media": [
    {
      "type": "audio",
      "url": "https://[blob-url]/kempo-media/audio/song-slug.mp3"
    }
  ]
}
```

```markdown
"**Song Title**" is a [genre] song recorded by [[artist-slug|Artist Name]] in [[YEAR k.y.]] for [[label-slug|Label Name]]. The song was released as part of [artist]'s album *[[album-slug|Album Title]]*.

## Background

[How the song came to be written/recorded]

## Reception

[Critical and commercial reception]

## See also

- [[artist-slug|Artist Name]]
- [[album-slug|Album Title]]
- [[label-slug|Label Name]]
```

## Album Article Template

```yaml
---
title: "Album Title"
slug: "album-title"
type: culture
subtype: album
status: published
tags:
  - american
  - music
  - album
  - [genre]
  - [decade]
dates:
  - "YEAR k.y."
---
```

```json
{
  "infobox": {
    "type": "album",
    "fields": {
      "Title": "Album Title",
      "Artist": "[[artist-slug|Artist Name]]",
      "Released": "[[YEAR k.y.]]",
      "Genre": "Genre, another genre",
      "Label": "[[label-slug|Label Name]]",
      "Length": "32:45"
    }
  }
}
```

**Note**: Albums do NOT have a `media` array. Individual songs have their own articles with embedded audio.

```markdown
***Album Title*** is a [genre] album by [[artist-slug|Artist Name]], released in [[YEAR k.y.]] by [[label-slug|Label Name]].

## Background

[Context for the album's creation]

## Track listing

1. "[[song-1-slug|Song Title 1]]"
2. "[[song-2-slug|Song Title 2]]"
3. "Song Title 3" (no article yet - plain text)
...

## Reception

[Critical and commercial reception]

## See also

- [[artist-slug|Artist Name]]
- [[song-slug|Notable Song]]
- [[label-slug|Label Name]]
```

## Infobox Field Reference

### Song Fields

| Field | Required | Format |
|-------|----------|--------|
| Title | Yes | Plain text |
| Artist | Yes | Wikilink to person |
| Album | No | Wikilink to album (if applicable) |
| Released | Yes | Wikilink to year |
| Genre | Yes | Plain text (comma-separated) |
| Label | Yes | Wikilink to institution |
| Length | Yes | "M:SS" format |

### Album Fields

| Field | Required | Format |
|-------|----------|--------|
| Title | Yes | Plain text |
| Artist | Yes | Wikilink to person |
| Released | Yes | Wikilink to year |
| Genre | Yes | Plain text (comma-separated) |
| Label | Yes | Wikilink to institution |
| Length | Yes | "MM:SS" format (total duration) |

## Cross-Linking Requirements

When creating media articles, you MUST establish bidirectional links:

### For Songs

1. **Artist article** → Add song to discography or "Notable recordings" section
2. **Album article** → Include song in track listing
3. **Label article** → Add to "Notable releases" section
4. **Timeline** → Add release entry if significant

### For Albums

1. **Artist article** → Add album to discography section
2. **Label article** → Add to "Notable releases" section
3. **Timeline** → Add release entry
4. **Song articles** → Create individual song articles for notable tracks

## File Organization

Media articles go in the `culture/` subdirectory:

```
web/content/articles/
├── culture/
│   ├── this-perfect-holiday.md    (song)
│   ├── a-martino-christmas.md     (album)
│   └── ...
```

## Media File Storage

Audio/video files are stored in Vercel Blob, NOT in the local `/media` directory.

- Local `/media` → Images only (generated via Grok)
- Vercel Blob → Audio and video files

Upload process:
1. Go to `/admin` (requires authorized Google account)
2. Upload media file with appropriate slug
3. Copy the returned URL
4. Add URL to article's `media` array

## Timeline Entries for Releases

Album releases warrant timeline entries. Songs generally don't unless exceptionally notable.

```markdown
[[artist-slug|Artist Name]] releases *[[album-slug|Album Title]]* on [[label-slug|Label Name]], featuring the hit single "[[song-slug|Song Title]]."
```

## Checklist for Media Articles

### Phase 1: Content
- [ ] Correct type (culture) and subtype (song/album)
- [ ] All dates in k.y. format
- [ ] Infobox has all required fields
- [ ] Media array included (songs only)
- [ ] Background and reception sections

### Phase 2: Link Integrity
- [ ] Artist article exists
- [ ] Album article exists (for songs)
- [ ] Label article exists
- [ ] All wikilinks resolve

### Phase 3: Cross-Linking
- [ ] Song added to artist's discography
- [ ] Song added to album's track listing
- [ ] Album added to label's notable releases
- [ ] Timeline entry created (albums)

### Phase 4: Media File
- [ ] Audio/video uploaded to Vercel Blob
- [ ] URL correctly added to media array
- [ ] Player renders on article page
