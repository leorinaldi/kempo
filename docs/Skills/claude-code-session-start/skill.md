# Claude Code Session Start

Run this skill when the user asks to "start session", "follow session start protocol", or similar.

## Steps

### 1. Review Project Context

Read these files to understand the project:
- [CLAUDE.md](../../../CLAUDE.md) - AI routing file
- [README.md](../../../README.md) - Project overview

### 2. Review Recent Project History

Query the `project_history` table for the most recent events to understand what was recently worked on:

```bash
curl http://localhost:3000/api/admin/project-history?limit=10
```

(Run after dev server is started in step 3)

### 3. Start Dev Server

```bash
cd web && npm run dev
```

Run in background so the session can continue.

### 4. Set Up Mobile Testing

Follow [mobile-testing.md](../../mobile-testing.md) which covers:
- Disabling login requirement
- Starting ngrok tunnel
- Generating QR code

### 5. Report Ready

Tell the user:
- Dev server is running at http://localhost:3000
- ngrok URL for mobile access
- QR code has been opened for scanning
- Login requirement is disabled (remind to re-enable when done)
