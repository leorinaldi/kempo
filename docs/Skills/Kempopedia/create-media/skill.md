# Create Media Skill

Create articles for songs, albums, films, or other cultural works.

> **Required**: Read [article-global-rules](../article-global-rules/skill.md) first for mandatory rules.

## Media Types

| Type | Subtype | Has Media File? |
|------|---------|-----------------|
| culture | song | YES - audio embedded |
| culture | album | NO - links to songs |
| culture | film | YES - video if available |
| culture | book | NO |

## Song Article

### Frontmatter

```yaml
---
title: "Song Title"
slug: "song-title"
type: culture
subtype: song
status: published
tags:
  - music
  - song
  - genre
---
```

### JSON (with media)

```json
{
  "infobox": {
    "type": "song",
    "fields": {
      "Title": "Song Title",
      "Artist": "[[artist-slug|Artist Name]]",
      "Album": "[[album-slug|Album Title]]",
      "Released": "[[YEAR k.y.]]",
      "Genre": "Genre",
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

### Article Structure

```mdx
"**Song Title**" is a [genre] song recorded by [[Artist]] in [[YEAR k.y.]] for [[Label]].

## Background
## Reception
## See also
```

## Album Article

Albums do NOT have a `media` array. Link to individual song articles.

### JSON

```json
{
  "infobox": {
    "type": "album",
    "fields": {
      "Title": "Album Title",
      "Artist": "[[artist-slug|Artist Name]]",
      "Released": "[[YEAR k.y.]]",
      "Genre": "Genre",
      "Label": "[[label-slug|Label Name]]",
      "Length": "32:45"
    }
  }
}
```

### Article Structure

```mdx
***Album Title*** is a [genre] album by [[Artist]], released in [[YEAR k.y.]].

## Background
## Track listing
1. "[[song-slug|Song Title]]"
2. "Song Title" (no article yet)
## Reception
## See also
```

## Media Upload

Audio/video files are stored in Vercel Blob:
1. Go to `/admin/media`
2. Upload with appropriate slug
3. Copy the returned URL
4. Add to article's `media` array

## Cross-Linking

When creating media articles:
- Song → Add to artist's discography, album's track listing, label's releases
- Album → Add to artist's discography, label's releases

## Completion

Follow the 4-phase checklist in [article-global-rules](../article-global-rules/skill.md).
