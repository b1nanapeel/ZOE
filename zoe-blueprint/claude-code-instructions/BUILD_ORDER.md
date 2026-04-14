# ZOE Build Order for Claude Code

## How to Use This File

You are building ZOE, a behavioral documentation platform for autism families. Read ALL files in the `/docs` and `/design` folders before starting. Then follow these phases in exact order. Each phase should result in a working, testable increment.

## Pre-Build Setup

Before writing any application code:

1. Initialize Next.js project with TypeScript and Tailwind:
   ```bash
   npx create-next-app@latest zoe --typescript --tailwind --eslint --app --src-dir
   ```

2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   npm install prisma @prisma/client
   npm install react-hook-form @hookform/resolvers zod
   npm install recharts
   npm install lucide-react
   npm install class-variance-authority clsx tailwind-merge
   npm install date-fns
   ```

3. Initialize Prisma:
   ```bash
   npx prisma init
   ```

4. Set up shadcn/ui:
   ```bash
   npx shadcn-ui@latest init
   ```
   Add components as needed: button, input, card, dialog, dropdown-menu, badge, tabs, avatar, progress, skeleton, toast

5. Copy the Prisma schema from `docs/DATA_MODEL.md` into `prisma/schema.prisma`

6. Set up `.env.local` with Supabase credentials (see `docs/TECH_STACK.md`)

7. Set up the design system in `tailwind.config.ts` using values from `design/DESIGN_SYSTEM.md`

8. Add Google Fonts (DM Sans, JetBrains Mono) in `src/app/layout.tsx`

---

## Phase 1: Authentication & Onboarding

**Goal:** User can sign up, log in, and create a child profile.

### Build:
1. `src/lib/supabase.ts` — Supabase client configuration (browser + server)
2. `src/app/(auth)/login/page.tsx` — Login form (email/password + Google OAuth)
3. `src/app/(auth)/signup/page.tsx` — Signup form
4. `src/middleware.ts` — Auth middleware (redirect unauthenticated users to login)
5. `src/app/(auth)/onboarding/page.tsx` — Three-step onboarding flow
6. `src/app/(dashboard)/layout.tsx` — Authenticated layout with bottom nav
7. `src/app/(dashboard)/page.tsx` — Basic home dashboard (empty state for now)

### Test:
- Can create account with email/password
- Can log in and see dashboard
- Can create a child profile through onboarding
- Unauthenticated users are redirected to login

---

## Phase 2: Clip Upload & Tagging

**Goal:** User can upload a video and tag it with ABC framework.

### Build:
1. `src/components/clips/UploadButton.tsx` — Floating action button
2. `src/components/clips/UploadFlow.tsx` — Multi-step upload flow container
3. `src/components/clips/VideoUploader.tsx` — File picker + upload to Supabase Storage
4. `src/components/tagging/AntecedentStep.tsx` — Antecedent tag selection
5. `src/components/tagging/BehaviorStep.tsx` — Behavior tag selection (with subcategories)
6. `src/components/tagging/ConsequenceStep.tsx` — Consequence tag selection
7. `src/components/tagging/ContextStep.tsx` — Optional context fields
8. `src/components/tagging/ReflectionStep.tsx` — Optional parent reflection
9. `src/components/tagging/TagChip.tsx` — Reusable tag chip component with selection state
10. `src/lib/constants.ts` — All tag options organized by category (from DATA_MODEL.md)
11. `src/app/api/clips/upload-url/route.ts` — API: generate signed upload URL
12. `src/app/api/clips/route.ts` — API: create clip record with tags

### Test:
- Can select a video from camera roll / file picker
- Video uploads to Supabase Storage with progress indicator
- Can step through all tagging steps, selecting chips and entering text
- Can skip optional steps
- Clip saved to database with all tags
- Thumbnail generated (or placeholder used)
- Success state shows after save
- New clip appears on home dashboard

---

## Phase 3: Timeline View

**Goal:** User can browse all clips in a filterable timeline.

### Build:
1. `src/app/(dashboard)/timeline/page.tsx` — Timeline page
2. `src/components/clips/ClipCard.tsx` — Clip card component (thumbnail + tags + time)
3. `src/components/clips/ClipList.tsx` — Grouped list (by date) with infinite scroll or pagination
4. `src/components/shared/FilterBar.tsx` — Horizontal scrollable filter chips
5. `src/components/shared/AdvancedFilters.tsx` — Expandable advanced filter panel
6. `src/app/api/children/[childId]/clips/route.ts` — API: list clips with filtering + pagination
7. `src/app/(dashboard)/clips/[clipId]/page.tsx` — Clip detail page
8. `src/components/clips/ClipDetail.tsx` — Full clip view with video player, tags, context, reflections

### Test:
- Timeline shows all clips grouped by date
- Filter chips filter the list in real-time
- Advanced filters work (date range, location, behavior)
- Tapping a clip opens detail view
- Video plays in detail view
- All tags and context display correctly
- Empty state shows when no clips match filter

---

## Phase 4: Patterns View

**Goal:** User can see behavioral frequency charts, context maps, and trends.

### Build:
1. `src/app/(dashboard)/patterns/page.tsx` — Patterns page with tabs
2. `src/components/patterns/BehaviorFrequencyChart.tsx` — Recharts bar chart
3. `src/components/patterns/ContextHeatmap.tsx` — Behavior-context co-occurrence grid
4. `src/components/patterns/TrendList.tsx` — List of behaviors with trend arrows and sparklines
5. `src/components/patterns/CommunicationLog.tsx` — Communication-specific trend view
6. `src/app/api/children/[childId]/patterns/behavior-frequency/route.ts`
7. `src/app/api/children/[childId]/patterns/behavior-context/route.ts`
8. `src/app/api/children/[childId]/patterns/trends/route.ts`

### Test:
- Frequency chart displays correctly with real clip data
- Context heatmap shows behavior-context correlations
- Trends calculate correctly (increasing/decreasing/stable)
- Communication log filters correctly
- Empty states show when insufficient data
- Time period selector works (4/8/12 weeks)

---

## Phase 5: Care Team & Sharing

**Goal:** Parent can invite therapists who can view clips and add annotations.

### Build:
1. `src/app/(dashboard)/team/page.tsx` — Care team management page
2. `src/components/team/InviteModal.tsx` — Invite by email
3. `src/components/team/MemberList.tsx` — Current team members with roles
4. `src/components/clips/AnnotationSection.tsx` — Annotations on clip detail
5. `src/components/clips/AddAnnotation.tsx` — Annotation input for therapists
6. `src/app/api/children/[childId]/team/route.ts` — Team management APIs
7. `src/app/api/clips/[clipId]/annotations/route.ts` — Annotation APIs
8. Row Level Security policies in Supabase for care team access

### Test:
- Parent can invite by email
- Invited user receives access after signup
- Therapist can view child's timeline and clips
- Therapist can add annotations to clips
- Parent can see therapist annotations
- Parent can remove team members
- Team member cannot see other children they weren't invited to

---

## Phase 6: Session Prep & Missions

**Goal:** Auto-generated therapy session summaries and therapist-assigned observation missions.

### Build:
1. `src/components/dashboard/SessionPrepBanner.tsx` — Banner on home dashboard
2. `src/app/(dashboard)/session-prep/[childId]/page.tsx` — Session prep summary page
3. `src/components/patterns/SessionPrepSummary.tsx` — Summary component
4. `src/components/missions/MissionCard.tsx` — Active mission display
5. `src/components/missions/CreateMission.tsx` — Mission creation form (therapist only)
6. `src/app/api/children/[childId]/patterns/session-prep/route.ts`
7. `src/app/api/children/[childId]/missions/route.ts`

### Test:
- Session prep appears before scheduled therapy
- Summary includes correct data for the period
- Therapist can create observation missions
- Parent sees active missions on home dashboard
- Share link generates correctly (time-limited access)

---

## Phase 7: Polish & PWA

**Goal:** Production-ready quality and installability.

### Build:
1. PWA manifest + service worker configuration
2. Offline mode: cached clips viewable without connection
3. Loading skeletons for all data-dependent views
4. Error boundaries and fallback UI
5. Toast notifications for actions (clip saved, team member invited, etc.)
6. Edit clip tags flow
7. Delete clip flow (soft delete with undo option)
8. Child profile editing
9. Data export functionality
10. Account deletion flow

### Test:
- App installable on mobile home screen
- Works offline for viewing cached content
- All error states handled gracefully
- All CRUD operations work correctly
- Responsive design works on phone, tablet, desktop
