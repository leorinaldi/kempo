# Mobile Testing via Localhost

Test the site on your phone without deploying to Vercel.

## Prerequisites (already installed)
- ngrok (with authtoken configured)
- qrencode

## Steps

### 1. Disable Login Requirement
Go to `/admin/security` and toggle off "Upfront Admin Login Requirement"

### 2. Start ngrok Tunnel
```bash
ngrok http 3000
```
This runs in the foreground. Use a separate terminal or run in background.

### 3. Generate QR Code
```bash
# Get the ngrok URL
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | sed 's/"public_url":"//'

# Generate QR code (replace URL with actual ngrok URL)
qrencode -o /tmp/ngrok-qr.png -s 10 "https://YOUR-NGROK-URL.ngrok-free.app"
open /tmp/ngrok-qr.png
```

### 4. Scan and Test
Scan the QR code with your phone camera to open the site.

## When Done
- Re-enable login requirement at `/admin/security` if desired
- Stop ngrok with Ctrl+C

## Notes
- ngrok URL changes each time you restart it (free tier)
- The `/admin` section still requires login even when site-wide auth is disabled
