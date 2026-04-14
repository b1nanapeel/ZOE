# ZOE GitHub & Deployment Setup

## Step 1: Create the Repository

```bash
# Navigate to where you want the project
cd ~/projects  # or wherever you keep code

# Create the Next.js project first
npx create-next-app@latest zoe --typescript --tailwind --eslint --app --src-dir

# Go into the project
cd zoe

# Initialize git (create-next-app does this, but just in case)
git init

# Create the GitHub repository
# Option A: GitHub CLI (if installed)
gh repo create zoe --public --source=. --push

# Option B: Manual
# 1. Go to github.com/new
# 2. Create repo named "zoe" (or "zoe-app")
# 3. Don't initialize with README (we already have files)
# 4. Then:
git remote add origin https://github.com/YOUR_USERNAME/zoe.git
git branch -M main
git push -u origin main
```

## Step 2: Branch Strategy

Keep it simple for now:

- `main` — Production-ready code. Deploy from here.
- `dev` — Active development. Merge to main when a phase is complete.
- Feature branches (optional): `feature/clip-upload`, `feature/patterns-view`, etc.

```bash
# Create dev branch
git checkout -b dev
git push -u origin dev
```

**For Claude Code:** Work on the `dev` branch. Commit after each completed phase. Push regularly.

```bash
# After completing a phase:
git add .
git commit -m "Phase 1: Authentication & onboarding complete"
git push origin dev

# When ready to deploy:
git checkout main
git merge dev
git push origin main
```

## Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (name: "zoe", region: closest to you, set a strong DB password)
3. Wait for project to initialize (~2 minutes)
4. Go to Project Settings → API
5. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

6. Go to Authentication → Providers
   - Email is enabled by default
   - Enable Google OAuth (requires Google Cloud Console setup — can skip for MVP)

7. Go to Storage → Create bucket:
   - Name: `clips`
   - Public: NO (private bucket)
   - File size limit: 200MB
   - Allowed MIME types: `video/mp4, video/quicktime, video/webm, image/jpeg, image/png`

## Step 4: Environment Variables

Create `.env.local` in the project root (this file is gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ZOE
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project-id.supabase.co:5432/postgres
```

Create `.env.example` (this IS committed, as a template):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ZOE
DATABASE_URL=
```

## Step 5: Database Migration

After setting up the Prisma schema:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase database
npx prisma db push

# (Later, for production migrations)
npx prisma migrate dev --name init
```

## Step 6: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Import Project"
3. Select your `zoe` repository
4. Vercel auto-detects Next.js — accept defaults
5. Add environment variables (same as `.env.local` but with production Supabase values)
6. Click Deploy

After first deploy:
- Set up custom domain (if you have one)
- Enable Vercel Analytics (free tier)

**Auto-deploy:** Every push to `main` automatically deploys to production.

## Step 7: Supabase Row Level Security

After deploying the schema, set up RLS policies in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_missions ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Parents can CRUD their own children
CREATE POLICY "Parents can view own children" ON children
  FOR SELECT USING (parent_id = auth.uid()::text);
CREATE POLICY "Parents can insert children" ON children
  FOR INSERT WITH CHECK (parent_id = auth.uid()::text);
CREATE POLICY "Parents can update own children" ON children
  FOR UPDATE USING (parent_id = auth.uid()::text);
CREATE POLICY "Parents can delete own children" ON children
  FOR DELETE USING (parent_id = auth.uid()::text);

-- Care team members can view children they're invited to
CREATE POLICY "Team members can view assigned children" ON children
  FOR SELECT USING (
    id IN (
      SELECT child_id FROM care_team_members
      WHERE user_id = auth.uid()::text AND status = 'ACCEPTED'
    )
  );

-- Clips: parent can CRUD, team can read
CREATE POLICY "Parents can manage clips for own children" ON clips
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()::text)
  );
CREATE POLICY "Team members can view clips" ON clips
  FOR SELECT USING (
    child_id IN (
      SELECT child_id FROM care_team_members
      WHERE user_id = auth.uid()::text AND status = 'ACCEPTED'
    )
  );

-- Similar policies needed for clip_tags, annotations, etc.
-- Claude Code should generate the complete set following the same pattern.
```

## .gitignore

Ensure these are in `.gitignore`:

```
# dependencies
node_modules/
.next/

# env
.env
.env.local
.env.production.local

# Supabase
supabase/.temp/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/migrations/migration_lock.toml
```

## Claude Code Workflow

When using Claude Code to build ZOE:

1. Open the project directory: `cd ~/projects/zoe`
2. Make sure you're on the `dev` branch: `git checkout dev`
3. Point Claude Code to the blueprint files: "Read the files in ~/projects/zoe-blueprint/ before starting"
4. Build one phase at a time (follow BUILD_ORDER.md)
5. Test each phase before moving to the next
6. Commit after each phase
7. Push to GitHub regularly

### Useful Claude Code Prompts:

**Starting a new phase:**
"Read the blueprint files in ./zoe-blueprint/. We're starting Phase [N] from BUILD_ORDER.md. Build everything listed for this phase. Follow the SCREEN_SPECS.md for UI, DESIGN_SYSTEM.md for styling, DATA_MODEL.md for the schema, and API_SPEC.md for endpoints."

**Fixing issues:**
"The [component] isn't working correctly. It should [expected behavior] but instead [actual behavior]. Fix it following the specs in SCREEN_SPECS.md."

**Adding polish:**
"Review all screens against DESIGN_SYSTEM.md and ensure consistent styling — spacing, colors, typography, and component patterns all match the design system."
