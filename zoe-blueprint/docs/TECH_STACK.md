# ZOE Tech Stack

## Decision: Web App (PWA-Ready), Not Native

**Why:** Faster to build, easier to iterate, works on all devices, no App Store review process. We wrap it as a Progressive Web App so parents can "install" it on their home screen and it feels native. We go React Native later if/when we need camera access for in-app recording.

## Frontend

| Choice | Technology | Why |
|--------|-----------|-----|
| Framework | **Next.js 14+ (App Router)** | Server-side rendering for fast loads, API routes built-in, excellent DX |
| Language | **TypeScript** | Type safety prevents bugs in a health-adjacent app |
| Styling | **Tailwind CSS** | Rapid UI development, consistent design system |
| UI Components | **shadcn/ui** | Accessible, composable, customizable. Not a heavy library — copies components into your codebase |
| Charts | **Recharts** | Simple, React-native charting for pattern visualizations |
| Video Player | **React Player** or native HTML5 `<video>` | Lightweight, handles MP4/MOV/WEBM |
| State Management | **React Context + hooks** (MVP) | No need for Redux complexity at this stage |
| Forms | **React Hook Form + Zod** | Validation for tagging flow, onboarding |
| Icons | **Lucide React** | Clean, consistent icon set |

## Backend

| Choice | Technology | Why |
|--------|-----------|-----|
| Runtime | **Node.js** | Same language as frontend, large ecosystem |
| Framework | **Next.js API Routes** (initially) → **separate Express/Fastify server** (when scaling) | Start simple, split when needed |
| Database | **PostgreSQL** (via Supabase or Neon) | Relational data (children, clips, tags, teams) needs SQL. Supabase gives you auth + DB + storage in one |
| ORM | **Prisma** | Type-safe database queries, great migration system |
| Auth | **Supabase Auth** or **NextAuth.js** | Email/password + Google OAuth out of the box |
| File Storage | **Supabase Storage** or **AWS S3** | Encrypted video storage with signed URLs for playback |
| Video Processing | **FFmpeg** (server-side, post-MVP) | Thumbnail generation, compression, format conversion |

## Infrastructure

| Choice | Technology | Why |
|--------|-----------|-----|
| Hosting | **Vercel** (frontend) + **Supabase** (backend/DB/storage) | Zero-config deployment, excellent free tier for MVP |
| Domain | Custom domain via Vercel | Professional URL from day one |
| CDN | **Vercel Edge Network** | Fast global delivery |
| Monitoring | **Vercel Analytics** (MVP) → **Sentry** (later) | Error tracking and performance monitoring |

## Why Supabase Specifically

Supabase gives us four things in one platform that would otherwise require separate services:
1. **PostgreSQL database** — our primary data store
2. **Authentication** — email/password + OAuth, with row-level security
3. **Storage** — S3-compatible file storage with policies (for video uploads)
4. **Row Level Security** — ensures parents only see their own children's data, therapists only see children they're invited to

This means Claude Code can set up the entire backend with one service instead of stitching together 4 different providers.

## Repository Structure

```
zoe/
├── .github/
│   └── workflows/          # CI/CD (later)
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   └── icons/              # PWA icons
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Login, signup, onboarding
│   │   ├── (dashboard)/    # Main app (requires auth)
│   │   │   ├── children/   # Child profiles
│   │   │   ├── clips/      # Clip upload, tagging, viewing
│   │   │   ├── timeline/   # Timeline view
│   │   │   ├── patterns/   # Pattern visualization
│   │   │   ├── team/       # Care team management
│   │   │   └── settings/   # Account settings
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── clips/          # Clip-related components
│   │   ├── tagging/        # ABC tagging flow components
│   │   ├── patterns/       # Chart and visualization components
│   │   └── shared/         # Header, nav, layout components
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client config
│   │   ├── utils.ts        # Utility functions
│   │   └── constants.ts    # App constants (tag options, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── styles/
│       └── globals.css     # Tailwind + custom styles
├── .env.local              # Environment variables (not committed)
├── .env.example            # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ZOE

# (Post-MVP) AI Services
# OPENAI_API_KEY=your_key
```

## Key Technical Decisions

1. **Video stays on Supabase Storage, not in the database.** DB stores metadata + signed URL reference.
2. **All video access via signed URLs with expiration.** No permanent public links to child videos.
3. **Row Level Security on every table.** A parent cannot see another parent's data. Period.
4. **Soft delete for clips** (marked as deleted, purged after 30 days) to allow undo, with hard delete option.
5. **No client-side AI in MVP.** All pattern visualizations are SQL aggregations over tags, not ML models.
6. **PWA manifest from day one** so parents can install on home screen.
