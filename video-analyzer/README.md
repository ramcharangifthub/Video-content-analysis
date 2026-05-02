# 🎬 VidAnalyzer v4 — AI Video Content Analysis

## Quick Start

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** · Login: `demo@vidanalyzer.ai` / `demo123`

---

## What's New in v4

### ✅ Genre + Specific Category (displayed in frontend)
Every result now shows a breadcrumb like:
```
🏆 Sports  ›  🏏 Cricket
🎭 Entertainment  ›  💃 Dance
🎓 Education  ›  📚 Educational
```
Plus a one-line category description and full AI summary paragraph.

### ✅ FFT-Based Speech Detection
Before Whisper runs, FFT analyses the 300–3400 Hz human speech frequency band:
- Computes speech-band energy vs background noise
- Calculates spectral flatness and zero-crossing rate
- Returns confidence score and detection method
- Avoids running Whisper on silent or music-only videos

### ✅ Fixed Voice Transcript
- Multi-strategy transcription (tiny → base fallback)
- Shows full text + timestamped segments
- Clear error messages per failure type (no_speech / whisper_not_installed / audio_extraction_failed)
- FFT stats shown in the transcript tab (SNR, confidence, method)

### ✅ Video Summary Always Visible
The "What is this video about?" block is the first thing shown in results:
- Genre → Specific category breadcrumb
- Natural language summary paragraph
- One-line category description

## Supported Genres & Types
| Genre | Types |
|-------|-------|
| 🏆 Sports | 🏏 Cricket, ⚽ Football, 🏀 Basketball, Sports |
| 🎭 Entertainment | 💃 Dance, 🎮 Gaming, 😄 Comedy |
| 🎓 Education | 📚 Educational, 💻 Tech/Tutorial |
| 🌿 Health & Lifestyle | 💪 Fitness, 📸 Vlog |
| 🌍 Food & Travel | 🍳 Food/Cooking, ✈️ Travel |
| 🎨 Music & Arts | 🎵 Music |
| 📡 News & Info | 📰 News, 🎙️ Interview/Podcast |
