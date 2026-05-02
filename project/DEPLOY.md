# VidAnalyzer — Deployment Guide

Your app has two parts:
- **Backend** — FastAPI (Python) on port 8000
- **Frontend** — React/Vite served via Nginx on port 80

---

## ✅ Option 1: Render.com (Recommended — Free tier available)

Render can host both services for free. No credit card needed for basic use.

### Step 1 — Deploy Backend

1. Go to [render.com](https://render.com) → Sign up → **New → Web Service**
2. Connect your GitHub repo (push this project to GitHub first)
3. Set these settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Instance Type:** Free
4. Click **Deploy**
5. Copy your backend URL → looks like `https://vidanalyzer-backend.onrender.com`

### Step 2 — Deploy Frontend

1. **New → Static Site** on Render
2. Set these settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com` ← paste from Step 1
4. Click **Deploy**

✅ Done — your app is live at the frontend URL Render gives you.

---

## ✅ Option 2: Railway.app (Easiest, $5/month)

Railway auto-detects Docker and deploys both services.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vidanalyzer.git
git push -u origin main
```

### Step 2 — Deploy on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo
3. Railway will detect `docker-compose.yml` automatically
4. Set environment variable in Railway dashboard:
   - `VITE_API_URL` = `https://YOUR-backend-service.up.railway.app`
5. Click **Deploy**

---

## ✅ Option 3: Docker on Any VPS (DigitalOcean / AWS / Hetzner)

This runs both services together using Docker Compose.

### Requirements
- Ubuntu 22.04 VPS (DigitalOcean Droplet costs ~$6/month)
- Docker + Docker Compose installed

### Step 1 — Set up VPS

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y
```

### Step 2 — Upload project

```bash
# From your local machine
scp -r ./project root@YOUR_VPS_IP:/opt/vidanalyzer
```

### Step 3 — Run

```bash
# On the VPS
cd /opt/vidanalyzer

# Set your backend URL (use your VPS IP or domain)
export VITE_API_URL=http://YOUR_VPS_IP:8000

# Build and start
docker-compose up -d --build
```

App is now live at: `http://YOUR_VPS_IP`

### Optional: Point a domain + HTTPS

```bash
# Install Caddy (auto HTTPS)
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
apt-get install caddy -y

# Create Caddyfile
cat > /etc/caddy/Caddyfile << 'EOF'
yourdomain.com {
    reverse_proxy localhost:80
}

api.yourdomain.com {
    reverse_proxy localhost:8000
}
EOF

systemctl restart caddy
```

---

## ✅ Option 4: Local run without Docker

If you just want to test or share via ngrok:

### Terminal 1 — Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 — Frontend
```bash
cd frontend
cp .env.example .env          # Edit VITE_API_URL if needed
npm install
npm run dev
```

### Share publicly with ngrok (free)
```bash
# Install ngrok from ngrok.com, then:
ngrok http 8000   # exposes backend
ngrok http 3000   # exposes frontend
```
Update `VITE_API_URL` in `.env` to the ngrok backend URL.

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `VITE_API_URL` | frontend `.env` | Full URL to your backend (no trailing slash) |

---

## Troubleshooting

**Upload fails / CORS error**
→ Make sure `VITE_API_URL` points to the correct backend URL with no trailing slash.

**Backend crashes on video processing**
→ FFmpeg must be installed. The Docker image handles this automatically.

**Whisper transcription is slow**
→ Whisper runs on CPU by default. On Render free tier, first run takes ~2 min. This is normal.

**Free tier goes to sleep**
→ Render free services sleep after 15 min of inactivity. First request after sleep takes ~30s to wake up. Upgrade to a paid plan ($7/month) to avoid this.
