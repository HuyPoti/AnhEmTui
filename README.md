# AnhEmTui - Genealogy Web App 🕵️‍♂️

A high-tech, interactive genealogy tree application. Build your family tree with a detective-style interface.

## 🌟 Features

- **Guest Mode**: Create trees without login (local storage).
- **User Mode**: Sync trees to the cloud, share with family.
- **Interactive Tree**: Drag & drop, zoom, pan (powered by React Flow).
- **Conan UI**: Character profile style node details.
- **Premium**: Unlimited nodes, realtime collaboration.

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, React Flow, Zustand.
- **Backend**: NestJS, Prisma, PostgreSQL (Supabase).
- **Database**: Supabase (Postgres + Realtime).
- **Storage**: Cloudinary / Supabase Storage.
- **Deployment**: Vercel (Frontend), Render (Backend).

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker (optional for local DB)
- Supabase Account
- Cloudinary Account (optional)

### 1. Setup Database (Supabase)

1. Create a new Supabase project.
2. Go to SQL Editor and run the script in `database/SUPABASE_SETUP.sql`.
3. Get your `DATABASE_URL` (Transaction pooler) from Settings > Database.
4. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. Backend Setup

```bash
cd backend
npm install

# Setup Environment
cp .env.example .env
# Edit .env:
# DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Generate Prisma Client
npx prisma generate

# Run Development Server
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Setup Environment (Create .env.local)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Run Development Server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📦 Deployment

### Frontend (Vercel)
1. Push code to GitHub.
2. Import project to Vercel.
3. Set Root Directory to `frontend`.
4. Add Environment Variables.

### Backend (Render)
1. Connect GitHub repo to Render.
2. Create **Web Service**.
3. Set Root Directory to `backend`.
4. Build Command: `npm install && npm run build`.
5. Start Command: `npm run start:prod`.
6. Add Environment Variables (`DATABASE_URL`).

## 📁 Project Structure

```
├── frontend/           # Next.js App
│   ├── src/components/ # UI Components (ConanProfileCard)
│   ├── src/stores/     # State (Zustand)
│   └── src/types/      # TypeScript Interfaces
├── backend/            # NestJS App
│   ├── src/trees/      # Trees Module
│   ├── src/prisma/     # Database Service
│   └── prisma/         # Schema
└── database/           # SQL Scripts
```

## 🔐 Security
- **RLS**: Row Level Security enabled on all tables.
- **Auth**: Google OAuth via Supabase.

---
Built with ❤️ by [Your Name]
