# 🌿 TouchQuest
**Hacktoberfest 2026 Open-Source AI Challenge — Week 1: Touch Grass**

> Step away from your screen. Connect with the living world around you.

TouchQuest is a mobile-first nature companion that generates personalized, mindful outdoor missions. Select your available time (5–45 minutes), environment, mood, and pace. Powered by Google's open-weight **Gemma 2** model, TouchQuest synthesizes an actionable, tactile mission with specific sensory anchors, reads it aloud via hands-free audio briefing, and switches into a distraction-free "phone-down" quest timer with natural bell chimes.

---

## ✨ Features

- 🌲 **Tactile Nature Missions**: Tailored to your exact environment (urban park, balcony, trail, sidewalk, waterside) and energy level (stillness to brisk movement).
- 🤖 **Real Gemma 2 Integration**: Generates structured missions using Google's open-weight `gemma-2-9b-it` or `gemma-2-2b-it` through hosted inference APIs (Groq, OpenRouter, Hugging Face) or local **Ollama**.
- 🛡️ **Zero-Harm Guardrails**: Server-side safety verification preventing road crossings, trespassing, handling venomous or wild fauna, and plant/mushroom ingestion.
- 📱 **Phone-Down Mode**: Minimalist, high-contrast, distraction-free screen designed to stay in your pocket while you observe the outdoors.
- 🔊 **Hands-Free Audio Briefing**: Web Speech API narrating your mission steps so you never have to look down at your screen while walking.
- 🔔 **Organic Bell Chimes**: Pure Web Audio API synthesized singing bowl tones marking start and completion without third-party audio asset overhead.
- 📖 **Local Field Log & Streak Journal**: 100% private client-side persistence using browser `localStorage`. Track your outdoor minutes, mood shifts (pre- vs post-quest), and export reflections as Markdown.
- 🚀 **Curated Offline Fallback**: Labeled sample mode guarantees instant reliability without an API key or internet access.

---

## 🏗️ Architecture

```
User (Browser)
    │
    ├── Next.js App Router (Client UI)
    │     ├── Quest Preference Form
    │     ├── Web Speech API Audio Briefing
    │     ├── Minimal Phone-Down Timer & Web Audio Chimes
    │     └── LocalStorage (Private Field Log & Streaks)
    │
    └── Next.js Route Handler (/api/generate-quest)
          ├── Server Boundary & Edge Middleware (Strict Security Headers)
          ├── Zod Schema Validation & Input Sanitizer
          ├── Server-Side Safety Keyword Scanner (Leave-No-Trace)
          └── Gemma Inference Client (OpenAI-compatible / Ollama / Sample Mode)
```

---

## 🏆 Hacktoberfest 2026 Prize Alignment

1. **Best Use of Gemma**:
   - Integrates Google's open-weight Gemma 2 model (`gemma-2-9b-it`) to structure creative, safe, sensory-rich micro-quests formatted strictly as validated JSON.
   - Provides first-class support for both cloud-hosted Gemma inference and local Ollama (`ollama run gemma2:9b`).
2. **Best Use of Render**:
   - Production-ready `render.yaml` blueprint with health checks, Node 20 runtime, and zero-downtime deployment settings.
3. **Best Use of GitHub Copilot & Actions**:
   - Automated CI workflow in `.github/workflows/ci.yml` verifying linting, TypeScript typing, and production compilation on every PR.

---

## 🔒 Privacy & Safety Principles

- **Zero Remote PII**: Reflections, outdoor stats, and journal entries are kept strictly in the user's browser `localStorage`. No user coordinates or personal data are ever saved to remote servers.
- **Server-Side API Key Sequestration**: All LLM keys (`GEMMA_API_KEY`) reside purely in server-side environment variables and are never leaked to client bundles.
- **Leave No Trace (LNT)**: All generated missions enforce observing with eyes and gentle touch without disturbing wildlife or plucking living foliage.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/Harry1402/nexuscrm.git touchquest
cd touchquest
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your preferred Gemma provider:
```env
# Hosted Gemma 2 via Groq (super fast free tier):
GEMMA_API_KEY=gsk_your_key_here
GEMMA_API_BASE_URL=https://api.groq.com/openai/v1
GEMMA_MODEL=gemma2-9b-it

# OR Local Ollama:
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=gemma2:9b
```

> **Note**: If you don't provide an API key, TouchQuest runs automatically in **Curated Sample Mode**, giving you full functionality with verified nature quests!

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your mobile or desktop browser.

### 4. Run Automated Tests
TouchQuest includes automated test coverage for Zod schema validation, safety hazard scanning, quick-start preferences, and fallback handling:
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## ⚡ Direct API Testing (`curl`)

You can test the server-side quest generation API directly:

```bash
# 1. Test Quick-Start 5-minute outdoor reset
curl -X POST http://localhost:3000/api/generate-quest \
  -H "Content-Type: application/json" \
  -d '{
    "durationMinutes": 5,
    "environment": "neighborhood",
    "energyLevel": "gentle",
    "questType": "sensory",
    "customContext": "Quick screen detox"
  }'

# 2. Test Custom Trail Observation
curl -X POST http://localhost:3000/api/generate-quest \
  -H "Content-Type: application/json" \
  -d '{
    "durationMinutes": 15,
    "environment": "forest",
    "energyLevel": "curious",
    "questType": "micro_wonder"
  }'
```

---

## 🔍 AI Inference & Privacy Transparency

TouchQuest believes in complete transparency regarding where your data travels:

| Provider Mode | Latency | Network Destination | Privacy Guarantee |
|:---|:---|:---|:---|
| **Local Ollama** (`gemma2:9b`) | 800–2500ms | `http://localhost:11434` (on-device only) | **100% local**: Zero network packets leave your computer. |
| **Hosted Gemma** (`gemma2-9b-it`) | 200–500ms | Encrypted HTTPS to Groq / OpenRouter API | API keys isolated on server; never leaked to frontend. |
| **Curated Sample Mode** | < 10ms | Internal memory | Offline, deterministic, zero network calls required. |

Each generated quest displays a transparent provider badge showing the active model and roundtrip generation latency.

---

## 🌐 Deploy to Render

1. Fork or push this repository to GitHub.
2. In the Render Dashboard, click **New > Blueprint**.
3. Select this repository. Render will automatically detect `render.yaml`.
4. (Optional) Set `GEMMA_API_KEY` in Render's environment settings.
5. Click **Apply** to deploy your live Web Service!

---

## 📜 License
MIT License • Created for the Open-Source AI Challenge 2026.
