
# Genealogy Web App - Source Code Plan

## 1. Project Structure
The project is divided into two main folders:
- `frontend/`: Next.js application for the UI.
- `backend/`: NestJS application for the API.

## 2. Shared/Environment Setup
- **Supabase**: Used for Database (Postgres), Auth, and Realtime.
- **Cloudinary**: Used for image storage.
- **Render**: Deployment target for Backend.
- **Vercel**: Deployment target for Frontend.

## 3. Frontend Implementation Plan (Next.js)
- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS, React Flow, Zustand.
- **Key Directories**:
    - `src/app`: Routes (guest, dashboard, tree editor).
    - `src/components`: UI components (NodeCard, Toolbar, etc.).
    - `src/stores`: Zustand stores for tree state (local for guest, synced for user).
    - `src/lib`: Supabase client, helpers.
- **Features**:
    - Guest Mode: Local state management.
    - User Mode: Sync with Supabase via Backend API.
    - Drag & Drop: React Flow customization.
    - Node Styling: "Detective ID" style as requested.

## 4. Backend Implementation Plan (NestJS)
- **Tech Stack**: NestJS, TypeORM (or Prisma - sticking to raw SQL/TypeORM if preferred, but user asked for Supabase, so we might just use Supabase client directly or Prisma with Postgres connection). *Decision*: Use Prisma for better Type safety and schema management with Postgres.
- **Modules**:
    - `AuthModule`: Handle Google OAuth tokens/session verification (verify Supabase JWT).
    - `TreesModule`: CRUD for trees.
    - `MembersModule`: CRUD for nodes/members.
    - `RelationsModule`: CRUD for edges/relationships.
    - `UploadModule`: Proxy or signature generation for Cloudinary.
- **API**: Standard REST API.

## 5. Database Schema (Supabase/Postgres)
Tables:
- `profiles` (managed by Supabase Auth, but we might extend it)
- `trees` (id, owner_id, name, is_public, etc.)
- `members` (id, tree_id, full_name, birth_date, gender, photo_url, attributes, position_x, position_y)
- `relations` (id, tree_id, source_member_id, target_member_id, relation_type)
- `tree_shares` (tree_id, user_email, permission)
- `audit_logs` (action, user_id, tree_id, timestamp)
