# Synapse Study

An AI study companion for college students. Synapse Study turns handwritten notes and PDFs into structured, interactive study packs — with topic-based AI chat, a live viva-style tutor, and progress tracking — all organized into a clean **spaces → subjects → topics** hierarchy.

> Built as a hackathon prototype. It already supports the full end-to-end flow: auth, workspace organization, uploads, AI study-pack generation, topic chat, live tutor, progress, and sticky notes.

---

## Features

- **Organized workspace** — structure everything as `spaces → subjects → topics`
- **Upload notes** — bring in handwritten notes and PDFs per topic
- **AI study packs** — generate a full pack from a topic's context:
  - Overview & simple explanation
  - Key points
  - Flashcards
  - Quiz
  - Viva questions
  - Source notes
- **Topic AI chat** — ask doubts grounded in your saved topic material
- **Live tutor** — guided, viva-style practice using Gemini live audio
- **Progress tracking** — see how far along each topic is
- **Sticky notes** — quick per-topic reminders
- **Workspace search** — jump across spaces, subjects, and topics

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Data / forms | TanStack Query, React Hook Form, Zod |
| Backend | Node.js (native `http`, no framework) |
| Database & Auth | Supabase (Postgres) |
| AI | Google Gemini API |

**Repo layout**

```
web/        React + Vite frontend
server/     Node.js backend that proxies Gemini
supabase/   SQL migrations (schema, RLS)
demo-assets/ Sample note used for demos
render.yaml  Backend deploy config (Render)
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone & install

```bash
git clone https://github.com/AkhileshNagargoje/Synapse-Study.git
cd Synapse-Study

# frontend deps
cd web && npm install && cd ..

# backend deps
cd server && npm install && cd ..
```

### 2. Set up the database

In the Supabase SQL editor (or CLI), run the migration:

```
supabase/migrations/001_phase1_schema.sql
```

This creates the tables (`profiles`, `spaces`, `subjects`, `topics`, `uploads`, `study_packs`, `chat_threads`, `chat_messages`, `topic_progress`, `sticky_notes`) with row-level security.

### 3. Configure environment variables

**`web/.env.local`**

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_URL=http://127.0.0.1:8787
```

**`server/.env.local`**

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
PORT=8787
HOST=0.0.0.0
CORS_ORIGIN=http://127.0.0.1:4173
```

> `.env.local` files are gitignored — never commit real keys.

### 4. Run it

Start the **backend** (terminal 1):

```bash
cd server
npm start
# → Gemini study-pack server listening on http://0.0.0.0:8787
```

Start the **frontend** (terminal 2):

```bash
cd web
npm run dev -- --host 127.0.0.1 --port 4173
```

Open **http://127.0.0.1:4173**, create an account, and start building study packs.

---

## Backend API

The Node server exposes a small JSON API consumed by the frontend:

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/health` | Health check + active model info |
| `POST` | `/api/generate-study-pack` | Generate a study pack from topic context |
| `POST` | `/api/topic-chat` | Answer a doubt grounded in a topic |
| `POST` | `/api/live-token` | Mint a token for the live tutor session |

---

## Deployment

### Frontend (Vercel)

- Root directory: `web`
- Build command: `npm run build`
- Output directory: `dist`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_URL` (point to your deployed backend)

### Backend (Render)

A [`render.yaml`](render.yaml) is included.

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Env vars: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_LIVE_MODEL`, `HOST=0.0.0.0`, `CORS_ORIGIN=https://your-frontend-url`

### Supabase

Add your production frontend URL to Supabase **Auth → URL Configuration** (site & redirect URLs).

---

## Credits

Created by **Akhilesh Nagargoje**.
