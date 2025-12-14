# Kempo

A collaborative AI-human project to create the most extensive and cohesive fictional universe ever constructed.

**Live Site**: https://kempo.vercel.app/
**Repository**: https://github.com/leorinaldi/kempo

## Purpose

Kempo is a living simulation—a new reality built day by day through iterative worldbuilding. Rather than creating a static fictional setting, this project evolves organically, with AI helping to maintain internal consistency, generate emergent narratives, and simulate the passage of time across an interconnected cosmos.

## Vision

- **Day-by-day simulation**: Time moves forward in Kempo, with events unfolding, characters aging, civilizations rising and falling
- **Internal coherence**: Every element connects—history, cultures, individuals—forming a unified whole
- **Emergent complexity**: Simple rules and interactions give rise to unpredictable, rich outcomes
- **Living documentation**: The universe is recorded as it evolves, creating an ever-growing archive of its reality

## Calendar System

All dates in Kempo use **k.y.** (Kempo Year), which matches standard Gregorian years. For example, 1952 k.y. = 1952 AD. The fictional history begins diverging from real-world history in 1950 k.y.

## Kempopedia

Kempopedia is the encyclopedia of the Kempo universe—a Wikipedia-style wiki documenting everything in this fictional world. It features:

- Wikipedia-style article layout with infoboxes
- Internal wikilinks between articles (`[[Article Name]]`)
- Category-based organization
- Timeline integration

**Access Kempopedia**: https://kempo.vercel.app/kempopedia

## Project Structure

```
kempo/
├── Kempopedia/                    # Documentation and schemas
│   ├── ARCHITECTURE.md            # Technical architecture
│   └── ARTICLE_SCHEMA.md          # Article format specification
├── Skills/                        # Claude Skills
│   └── Kempopedia/
│       └── create-article.md      # Skill for generating articles
└── web/                           # Next.js web application
    ├── content/
    │   └── articles/              # Kempopedia article files (MDX)
    └── src/
        ├── app/
        │   └── kempopedia/        # Kempopedia pages
        ├── components/            # React components (Infobox, etc.)
        └── lib/                   # Article loading utilities
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Content**: MDX with frontmatter
- **Hosting**: Vercel
- **Repository**: GitHub

## Development

```bash
cd web
npm install
npm run dev
```

The site runs at http://localhost:3000

## Creating Articles

Articles are markdown files in `web/content/articles/` with YAML frontmatter and optional JSON infobox data. See `Kempopedia/ARTICLE_SCHEMA.md` for the full specification.

---

*Kempo begins now.*
