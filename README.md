# Kempo

An alternate-universe simulation engine—Wikipedia, YouTube, and mobile apps for a fictional world advancing year-by-year from 1950 to 2026.

For AI assistant instructions, see [CLAUDE.md](CLAUDE.md).
For strategic overview and philosophy, see [Kempo Project Context.md](Kempo%20Project%20Context.md).

**Live Site**: https://kempo.vercel.app (private access) — https://kempo.com coming soon

## Quick Start

```bash
cd web
npm install
npx prisma generate
npm run dev
```

Open http://localhost:3000

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless)

### Environment Variables

Create `web/.env.local`:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="..."
```

For image generation, create `.env` in root:

```
XAI_API_KEY="..."
GEMINI_API_KEY="..."
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (Neon) + Prisma |
| Storage | Vercel Blob |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| Hosting | Vercel |

## License

Private repository - not for distribution.
