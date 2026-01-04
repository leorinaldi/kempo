# Backup System

**Scope:** Procedures for backing up the Neon PostgreSQL database and Vercel Blob storage.

---

## Strategy

| Backup Type | Frequency | Source | Destination | Redundancy |
|-------------|-----------|--------|-------------|------------|
| Database | Daily (24h) | Neon PostgreSQL | Primary blob (`backups/`) | 2x (also in weekly) |
| Full Blob | Weekly (7 days) | Primary blob (all files) | Backup blob (`YYYY-MM-DD/`) | 1x |

**Storage Locations:**
- Primary blob (`BLOB_READ_WRITE_TOKEN`): us-east-1 — media files + daily DB backups
- Backup blob (`BACKUP_READ_WRITE_TOKEN`): us-west-1 — weekly snapshots of everything

## Prerequisites

- `pg_dump` installed: `/opt/homebrew/opt/libpq/bin/pg_dump`
- If missing: `brew install libpq`

---

## Daily Database Backup (24-hour check)

### 1. Check if Needed

```bash
cd /Users/leonardorinaldi/Claude/Kempo/web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const setting = await prisma.setting.findUnique({ where: { key: 'lastBackupDate' } });
  if (!setting) { console.log('BACKUP_NEEDED: No previous backup'); return; }
  const hours = (Date.now() - new Date(setting.value).getTime()) / 3600000;
  console.log(hours >= 24 ? 'BACKUP_NEEDED: ' + Math.round(hours) + 'h since last' : 'BACKUP_SKIPPED: Only ' + Math.round(hours) + 'h since last');
}
main().finally(() => prisma.\$disconnect());
"
```

### 2. Create Backup

```bash
/opt/homebrew/opt/libpq/bin/pg_dump "postgresql://neondb_owner:npg_E6lTGP7sIgFj@ep-tiny-dawn-ah7g9t0e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" > /tmp/kempo-backup-$(date +%Y-%m-%d).sql
```

### 3. Upload and Update Setting

```bash
cd /Users/leonardorinaldi/Claude/Kempo/web && DATABASE_URL="..." BLOB_READ_WRITE_TOKEN="..." npx tsx -e "
import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const date = new Date().toISOString().split('T')[0];
  const content = readFileSync('/tmp/kempo-backup-' + date + '.sql', 'utf-8');

  const blob = await put('backups/kempo-backup-' + date + '.sql', content, { access: 'public' });
  console.log('Uploaded:', blob.url);

  await prisma.setting.upsert({
    where: { key: 'lastBackupDate' },
    update: { value: date },
    create: { key: 'lastBackupDate', value: date }
  });
  console.log('Updated lastBackupDate to:', date);
}

main().finally(() => prisma.\$disconnect());
"
```

---

## Weekly Full Blob Backup (7-day check)

### 1. Check if Needed

```bash
cd /Users/leonardorinaldi/Claude/Kempo/web && DATABASE_URL="..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const setting = await prisma.setting.findUnique({ where: { key: 'lastFullBackupDate' } });
  if (!setting) { console.log('FULL_BACKUP_NEEDED: No previous full backup'); return; }
  const days = (Date.now() - new Date(setting.value).getTime()) / 86400000;
  console.log(days >= 7 ? 'FULL_BACKUP_NEEDED: ' + Math.round(days) + ' days since last' : 'FULL_BACKUP_SKIPPED: Only ' + Math.round(days) + ' days since last');
}
main().finally(() => prisma.\$disconnect());
"
```

### 2. Copy All Files to Backup Store

```bash
cd /Users/leonardorinaldi/Claude/Kempo/web && DATABASE_URL="..." BLOB_READ_WRITE_TOKEN="..." BACKUP_READ_WRITE_TOKEN="..." npx tsx -e "
import { list, put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const date = new Date().toISOString().split('T')[0];
  const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });

  console.log('Copying', blobs.length, 'files to backup store under', date + '/');

  let copied = 0;
  for (const blob of blobs) {
    const response = await fetch(blob.url);
    const content = await response.blob();
    await put(date + '/' + blob.pathname, content, {
      access: 'public',
      token: process.env.BACKUP_READ_WRITE_TOKEN
    });
    copied++;
    if (copied % 20 === 0) console.log('Progress:', copied, '/', blobs.length);
  }

  console.log('Complete:', copied, 'files copied');

  await prisma.setting.upsert({
    where: { key: 'lastFullBackupDate' },
    update: { value: date },
    create: { key: 'lastFullBackupDate', value: date }
  });
  console.log('Updated lastFullBackupDate to:', date);
}

main().finally(() => prisma.\$disconnect());
"
```

---

## Restore Procedures

### Restore Database Only

```bash
# List available DB backups
BLOB_READ_WRITE_TOKEN="..." npx tsx -e "
import { list } from '@vercel/blob';
async function main() {
  const { blobs } = await list({ prefix: 'backups/', token: process.env.BLOB_READ_WRITE_TOKEN });
  blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
  blobs.forEach(b => console.log('-', b.pathname, b.url));
}
main();
"

# Download and restore
curl -o /tmp/restore.sql "BACKUP_URL"
/opt/homebrew/opt/libpq/bin/psql "DATABASE_URL" < /tmp/restore.sql
```

### List Full Backup Snapshots

```bash
BACKUP_READ_WRITE_TOKEN="..." npx tsx -e "
import { list } from '@vercel/blob';
async function main() {
  const { blobs } = await list({ token: process.env.BACKUP_READ_WRITE_TOKEN });
  const dates = [...new Set(blobs.map(b => b.pathname.split('/')[0]))];
  dates.sort().reverse();
  console.log('Available snapshots:');
  dates.forEach(d => {
    const count = blobs.filter(b => b.pathname.startsWith(d + '/')).length;
    console.log('-', d, '(' + count + ' files)');
  });
}
main();
"
```

---

## Tracking Settings

| Setting | Purpose |
|---------|---------|
| `lastBackupDate` | Last daily DB backup (24h check) |
| `lastFullBackupDate` | Last weekly full blob backup (7-day check) |
