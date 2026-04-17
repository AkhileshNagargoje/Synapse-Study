# Synapse Study

Synapse Study is an AI study companion for college students. It helps students organize handwritten notes and PDFs into spaces, subjects, and topics, then convert them into structured study packs with topic-based AI chat, live tutor support, and progress tracking.

## What it does

- Organize study into `spaces -> subjects -> topics`
- Upload handwritten notes and PDFs
- Generate study packs with:
  - overview
  - key points
  - simple explanation
  - flashcards
  - quiz
  - viva questions
  - source notes
- Ask AI doubts from saved topic context
- Use live tutor mode for guided viva-style practice
- Save sticky notes and track progress

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js
- Database/Auth: Supabase
- AI: Gemini API

## Local setup

### 1. Frontend env

Create `web/.env.local`

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_URL=http://127.0.0.1:8787
```

### 2. Backend env

Create `server/.env.local`

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
PORT=8787
HOST=0.0.0.0
CORS_ORIGIN=http://127.0.0.1:4173
```

### 3. Install and run

Frontend:

```powershell
cd web
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

Backend:

```powershell
cd server
npm install
npm start
```

### 4. Database

Run the Supabase migration from:

- `supabase/migrations/001_phase1_schema.sql`

## Hosting

### Frontend on Vercel

- Root directory: `web`
- Build command: `npm run build`
- Output directory: `dist`
- Env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GEMINI_API_URL=https://your-render-backend.onrender.com`

### Backend on Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Env vars:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL=gemini-2.5-flash`
  - `GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025`
  - `HOST=0.0.0.0`
  - `CORS_ORIGIN=https://your-vercel-app.vercel.app`

### Supabase production setup

Add your frontend production URL to Supabase Auth redirect/site URLs.

## Status

This project was built as a hackathon prototype and already supports the main end-to-end flow:

- auth
- spaces / subjects / topics
- uploads
- study pack generation
- topic AI chat
- live tutor
- progress tracking
- sticky notes
- workspace search
