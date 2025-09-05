# NeonFinance – Personal Finance Platform (MERN + AI)

NeonFinance is a dark, neon‑accented personal finance platform built with React (Vite), TypeScript, Tailwind, Express, and MongoDB. It includes AI coaching via Google Gemini, budgeting, charts, masked mode, panic hide, command palette, and authentication wired to MongoDB Atlas.

## Quick Start (npm)

- Install deps: `npm install`
- Dev server: `npm run dev` (Vite + Express on one port)
- Build: `npm run build`  •  Start: `npm start`
- Tests: `npm test`  •  Typecheck: `npm run typecheck`

## Run Locally

Prerequisites:
- Node.js ≥ 18 and npm (bundled with Node)
- A MongoDB connection string (Atlas or local)
- Optional: Google Gemini API key for AI, Gmail SMTP app password for emails

Steps:
1) Install
```
npm install
```
2) Configure environment (create `.env.local` or export in your shell):
```
# Required
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="7d"

# Optional (AI + email)
GEMINI_API_KEY="<your-gemini-key>"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="<gmail-app-password>"   # Use a Gmail App Password

# Optional
CORS_ORIGIN="http://localhost:8080"
```
3) Start the dev server
```
npm run dev
```
- App + API: http://localhost:8080
- Example endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/ai/coach`

4) Production build
```
npm run build
npm start
```

Troubleshooting:
- If Mongo Atlas blocks connections, allow your IP in Atlas Network Access.
- For Gmail SMTP, enable 2‑step verification and create an App Password; regular passwords won’t work.
- If ports conflict, change the Vite/Express port in config.

## Environment
- MONGODB_URI
- JWT_SECRET, JWT_EXPIRES_IN
- GEMINI_API_KEY (Google Generative Language API)
- CORS_ORIGIN (optional)

## API (server)
- POST `/api/auth/signup` – { name?, email, password } → { user, token }
- POST `/api/auth/login` – { email, password } → { user, token }
- POST `/api/ai/coach` – { prompt, model? } → { message }

## Frontend
- Landing page: `/` – marketing hero with stats and features
- App dashboard: `/dashboard` – KPIs (₹), savings and cashflow charts, quick‑add expense
- Command palette: ⌘K / Ctrl+K
- Masked mode (M), Panic hide (H)

## Tech Stack
React 18, TypeScript, Vite, Tailwind 3, Radix UI, shadcn/ui, Framer Motion, Recharts, Zustand, Express 5, Mongoose 8, Zod, bcrypt, JWT.

## Security
Passwords hashed with bcrypt; JWT for sessions; CORS enabled. Avoid committing secrets.

## Deploy
Use Netlify or Vercel MCP to deploy. Set env vars and trigger a deploy.
