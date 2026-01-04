# Claude Code Session Close

Run this skill when the user says "close the session", "session close protocol", "time to wrap up", or similar.

## Steps

### 1. Session Summary

Write a brief paragraph summarizing key accomplishments since the session started. Include:
- Features added or bugs fixed
- Files created, modified, or deleted
- Any notable decisions made

### 2. Documentation Review

Consider whether any process documents need updating based on work done:

| Document | Update if... |
|----------|--------------|
| `CLAUDE.md` | File locations changed, new skills added |
| `README.md` | Project structure changed, new interfaces added |
| `docs/*.md` | Workflows or patterns changed |
| Skills | New repeatable process emerged |

**Only update if process or structure changed materially.** Code changes alone don't require doc updates.

If uncertain whether changes are material enough to warrant doc updates, ask the user before proceeding.

If a new skill should be created, propose it to the user before creating.

### 3. Project History Update

Create a new entry directly in the database (API requires admin session):

```bash
cd web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.projectHistory.create({
    data: { content: 'YYYY-MM-DD: Brief description of main accomplishment' }
  });
  console.log('Project history entry created');
}
main().finally(() => prisma.\$disconnect());
"
```

Use today's date. Keep the description concise (one sentence).

### 4. Re-enable Login Requirement

Turn the security setting back on (API requires admin session):

```bash
cd web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.setting.upsert({
    where: { key: 'requireLogin' },
    update: { value: 'true' },
    create: { key: 'requireLogin', value: 'true' }
  });
  console.log('Login requirement re-enabled');
}
main().finally(() => prisma.\$disconnect());
"
```

Note: Model is `setting` (singular), not `settings`.

This prevents unauthorized access while the site is in development.

### 5. Push to GitHub

Commit any uncommitted changes and push:

```bash
git -C /Users/leonardorinaldi/Claude/Kempo add -A
git -C /Users/leonardorinaldi/Claude/Kempo commit -m "Session close: <brief description>"
git -C /Users/leonardorinaldi/Claude/Kempo push
```

Changes will auto-deploy to Vercel.

### 6. Deployment Verification (Optional)

Ask the user if they want to:
- **Wait for deployment** - Monitor Vercel deployment status before closing localhost
- **Close immediately** - Shut down without waiting

If waiting, check deployment status at https://vercel.com/leorinaldi/kempo or use the Vercel CLI.

### 7. Shut Down Local Services

Stop the dev server and ngrok tunnel:

```bash
# Find and kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Kill ngrok
pkill ngrok
```

### 8. Report Complete

Tell the user:
- Session summary (from step 1)
- Any doc updates made
- Project history entry added
- Login requirement re-enabled
- Changes pushed to GitHub
- Local services shut down
