# Claude Code Session Start

Run this skill when the user asks to "start session", "follow session start protocol", or similar.

## Steps

### 1. Review Project Context

Read these files to understand the project:
- [CLAUDE.md](../../../CLAUDE.md) - AI routing file
- [README.md](../../../README.md) - Project overview

### 2. Review Recent Project History

Query the `project_history` table for the most recent events:
```bash
DATABASE_URL="..." npx prisma db execute --stdin <<< "SELECT date, title FROM project_history ORDER BY date DESC LIMIT 10;"
```

Or use the admin API:
```bash
curl http://localhost:3000/api/admin/project-history?limit=10
```

This provides context on what was recently worked on.

### 3. Start Dev Server

```bash
cd web && npm run dev
```

Run in background so the session can continue.

### 4. Disable Login Requirement

This allows mobile testing via ngrok without authentication blocking.

Go to `/admin/security` and toggle off "Upfront Admin Login Requirement".

Or via API (if available):
```bash
curl -X POST http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -d '{"key": "requireAuth", "value": false}'
```

### 5. Set Up Mobile Testing

Follow [mobile-testing.md](../../mobile-testing.md):

```bash
# Start ngrok tunnel (run in background)
ngrok http 3000

# Wait for ngrok to start, then get URL
sleep 2
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | sed 's/"public_url":"//')

# Generate QR code and open it
qrencode -o /tmp/ngrok-qr.png -s 10 "$NGROK_URL"
open /tmp/ngrok-qr.png
```

### 6. Report Ready

Tell the user:
- Dev server is running at http://localhost:3000
- ngrok URL for mobile access
- QR code has been opened for scanning
- Login requirement is disabled (remind to re-enable when done)

## Session End Reminder

When the session ends, remind the user to:
- Re-enable login requirement at `/admin/security` if desired
- Stop ngrok if no longer needed
