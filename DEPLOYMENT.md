# Character Career Blueprint — Deployment Guide

Step-by-step guide to go from a fresh VPS to a live, email-sending production deployment.

---

## Prerequisites

- A VPS with at least **2 GB RAM, 20 GB disk** (Ubuntu 22.04 LTS recommended)
- A domain name pointed at the VPS IP (`A` record)
- A [Resend](https://resend.com) account (free tier is fine to start)
- Your Gemini API key
- SSH access to the VPS

---

## 1 — VPS initial setup

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

---

## 2 — Clone the repository

```bash
git clone https://github.com/atanakatana/career-character-blueprint.git
cd career-character-blueprint
```

---

## 3 — Resend: verify your domain (critical for email delivery)

Without this step, Resend can only send to addresses you own. All customer emails will fail.

### 3.1 — Add your domain in Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your sending domain (e.g. `yourdomain.com` or `mail.yourdomain.com`)
4. Select your DNS provider
5. Resend will show you **three DNS records** to add

### 3.2 — Add the DNS records

In your DNS provider's control panel, add all three records Resend shows:

| Type | Name | Value |
|------|------|-------|
| `TXT` | `resend._domainkey.yourdomain.com` | `p=MIGf...` (DKIM public key) |
| `TXT` | `yourdomain.com` | `v=spf1 include:amazonses.com ~all` |
| `MX`  | `resend.yourdomain.com` | `feedback-smtp.us-east-1.amazonses.com` |

> DNS propagation can take up to 48 hours, but usually completes in under 30 minutes.

### 3.3 — Verify in Resend dashboard

Click **Verify DNS Records** in Resend. All three records should show green checkmarks.

### 3.4 — Create an API key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Name it `CCB Production`
4. Permission: **Sending access**
5. Copy the key — you will not see it again

### 3.5 — Set the from address

Your `RESEND_FROM_EMAIL` must use the verified domain:
- `noreply@yourdomain.com` ✓
- `blueprint@yourdomain.com` ✓
- `noreply@gmail.com` ✗ (not your domain)

---

## 4 — Create the production environment file

```bash
cp .env.example .env.production
nano .env.production
```

Fill in every value:

```bash
# ── APPLICATION ───────────────────────────────
ENVIRONMENT=production
DEBUG=false

# ── DATABASE ──────────────────────────────────
# Use a strong random password:
# python3 -c "import secrets; print(secrets.token_hex(16))"
POSTGRES_PASSWORD=<strong-random-password>

# ── REDIS ─────────────────────────────────────
# python3 -c "import secrets; print(secrets.token_hex(16))"
REDIS_PASSWORD=<strong-random-password>

# ── SECURITY ──────────────────────────────────
# Generate both with: python3 -c "import secrets; print(secrets.token_hex(32))"
REPORT_TOKEN_SECRET=<64-char-hex>
ADMIN_SECRET_KEY=<different-64-char-hex>

# ── AI ────────────────────────────────────────
GEMINI_API_KEY=<your-gemini-api-key>

# ── EMAIL ─────────────────────────────────────
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Character Career Blueprint

# ── SITE URL (the public domain) ──────────────
SITE_URL=https://yourdomain.com
FRONTEND_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# ── ADMIN SEED ────────────────────────────────
ADMIN_DEFAULT_EMAIL=your@email.com
ADMIN_DEFAULT_PASSWORD=<strong-password>
```

> **Never commit `.env.production` to git.** It's in `.gitignore` already.

---

## 5 — Update nginx config with your domain

Edit `nginx/nginx.prod.conf` and replace `server_name _;` with your domain:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

---

## 6 — First deployment (HTTP first, then add HTTPS)

Start with HTTP to confirm everything works before adding SSL:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production \
  up -d --build
```

This will:
- Build production images (takes 3–5 minutes on first run)
- Start all services with `restart: always`
- No ports exposed for DB or Redis

Check everything is up:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=20
```

Visit `http://yourdomain.com` — the landing page should load.

---

## 7 — Run the database seed

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production \
  exec backend python -m scripts.seed
```

Expected output:
```
✓ Admin user:       your@email.com
✓ Gemini config:    gemini-2.5-flash (active)
• Prompt template v1 already exists
✓ Prompt template:  blueprint_main_v2 (active)
✓ Seed complete
```

Log in at `https://yourdomain.com/admin/login` with the credentials you set in `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD`.

---

## 8 — Add HTTPS with Let's Encrypt (Certbot)

Install Certbot:

```bash
sudo apt install certbot -y
```

Stop nginx temporarily (Certbot needs port 80):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production stop nginx
```

Get the certificate:

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

The certificate files are placed at:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

Now edit `nginx/nginx.prod.conf` to enable HTTPS. Uncomment these blocks:

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache   shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # ... rest of the server block stays the same
}
```

Restart nginx:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production up -d nginx
```

Visit `https://yourdomain.com` — it should load with a valid SSL certificate.

### Auto-renewal

Certbot certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal works
sudo certbot renew --dry-run

# Add to crontab (runs twice daily)
sudo crontab -e
# Add this line:
0 3,15 * * * certbot renew --quiet && docker compose -f /path/to/docker-compose.yml -f /path/to/docker-compose.prod.yml --env-file /path/to/.env.production restart nginx
```

---

## 9 — Test email delivery end-to-end

1. Submit a test blueprint at `https://yourdomain.com/create`
2. Watch worker logs: `docker compose ... logs -f worker`
3. Look for: `[Resend] Delivered — id=<resend_message_id>  to=<recipient>`
4. Check the recipient inbox — email should arrive within seconds
5. Click the link in the email — the blueprint report should load

If you see `DRY RUN` in the logs, `RESEND_API_KEY` isn't set or the env file isn't loading correctly.

---

## 10 — Useful operations

### View all logs
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production logs -f
```

### Restart a single service
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production restart backend
```

### Deploy an update (after pushing to GitHub)
```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production up -d --build backend worker frontend
```

### Manual database backup
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production \
  exec postgres pg_dump -U ccblueprint ccblueprint > backup_$(date +%Y%m%d).sql
```

### Access the database directly
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production \
  exec postgres psql -U ccblueprint -d ccblueprint
```

---

## 11 — Health check

The backend exposes a detailed health endpoint:

```bash
curl https://yourdomain.com/api/health/detailed | python3 -m json.tool
```

Should return:
```json
{
  "status": "healthy",
  "api": "ok",
  "database": "ok",
  "redis": "ok"
}
```

---

## Troubleshooting

**Emails going to dry_run:**
Check `RESEND_API_KEY` is set and not empty in `.env.production`. Verify the env file is being loaded: `docker compose ... exec backend env | grep RESEND`.

**"from address not verified" error from Resend:**
The domain in `RESEND_FROM_EMAIL` must match a verified domain in your Resend dashboard. If you set `noreply@yourdomain.com`, then `yourdomain.com` must be verified.

**Blueprint report page shows error:**
Check `NEXT_PUBLIC_API_URL` matches your domain exactly (including `https://`). The browser makes API requests to this URL, so it must be publicly accessible.

**Nginx 502 Bad Gateway:**
Usually means the backend or frontend container isn't healthy yet. Check logs: `docker compose ... logs backend frontend`.

**SSL certificate not found:**
Certbot stores certs at `/etc/letsencrypt/live/<domain>/`. The prod compose mounts `/etc/letsencrypt` read-only into nginx. Make sure certbot ran successfully before starting nginx.
