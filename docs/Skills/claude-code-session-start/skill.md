# Claude Code Session Start

Run this skill when the user asks to "start session", "follow session start protocol", or similar.

## Steps

### 1. Review Project Context

Read these files to understand the project:
- [CLAUDE.md](../../../CLAUDE.md) - AI routing file
- [README.md](../../../README.md) - Project overview
- [docs/data-model.md](../data-model.md) - Entity taxonomy and relationships

### 2. Start Dev Server

```bash
cd web && npm run dev
```

Run in background so the session can continue.

### 3. Disable Login Requirement

Use Prisma directly (admin APIs require authentication):

```bash
cd web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.setting.upsert({
    where: { key: 'requireLogin' },
    update: { value: 'false' },
    create: { key: 'requireLogin', value: 'false' }
  });
  console.log('Login requirement disabled');
}
main().finally(() => prisma.\$disconnect());
"
```

Note: Model is `setting` (singular), not `settings`.

### 4. Start ngrok Tunnel

```bash
ngrok http 3000
```

Run in background. Then get the URL and generate QR code:

```bash
# Get URL
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | sed 's/"public_url":"//'

# Generate and open QR code
qrencode -o /tmp/ngrok-qr.png -s 10 "https://YOUR-URL.ngrok-free.app"
open /tmp/ngrok-qr.png
```

### 5. Review Recent Project History

Use Prisma directly (admin APIs require authentication):

```bash
cd web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.projectHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  events.forEach(e => {
    console.log(\`[\${e.createdAt.toISOString().split('T')[0]}] \${e.content.substring(0, 100)}\`);
  });
}
main().finally(() => prisma.\$disconnect());
"
```

Note: Field is `createdAt`, not `date`.

### 6. Report Ready

Tell the user:
- Dev server is running at http://localhost:3000
- ngrok URL for mobile access
- QR code has been opened for scanning
- Summary of recent project history
- Login requirement is disabled (remind to re-enable when done)
