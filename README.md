# ZOE

**Behavioral intelligence for autism families**

[Live demo](https://zoe4all.vercel.app)

---

## What is ZOE?

ZOE is a multimodal behavioral documentation platform for parents of nonverbal and minimally verbal autistic children. Families record short video moments, tag them with a clinical ABC (antecedent–behavior–consequence) framework, and watch patterns emerge across weeks and months. Structured summaries can then be shared with the child's therapy team so clinicians walk into every session already knowing the week.

## The Problem

There are an estimated **590,000 to 705,000 nonverbal or minimally verbal autistic children in the United States**. Most of them receive between **1 and 3 hours of therapy per week**. That leaves families alone for **165+ hours a week** — at home, in the car, at the grocery store — with no tools to document what they see. The breakthroughs, the regressions, and the triggers that matter most live in those 165 hours, and today they are almost entirely invisible to the clinicians trying to help.

ZOE exists to close that gap.

## What ZOE Does

- **AI-powered video analysis** — Google Gemini 2.5 Flash observes each clip and suggests behaviors, antecedents, consequences, and mood, with a plain-English narrative observation.
- **In-browser audio prosody extraction** — pitch, pitch variability, speech rate, pause ratio, vocalization duration, peak energy, and a waveform, all computed locally via the Web Audio API.
- **In-browser movement detection** — MediaPipe Pose Landmarker runs client-side to compute hand-to-head proximity, center-of-mass sway, repetitive-motion score, and gross motor activity.
- **ABC clinical framework tagging** — structured antecedent, behavior, consequence, location, time, people-present, and mood tags aligned with clinical documentation standards.
- **Pattern intelligence engine** — trigger analysis, time-of-day patterns, context correlations, trend narratives, and progress summaries generated from the full clip history.
- **Research knowledge base** — peer-reviewed research chunked and indexed so relevant evidence surfaces alongside the patterns ZOE detects.
- **Care team sharing** — parents invite therapists into a shared view with role-based permissions.
- **Therapist session prep summaries** — clinicians see a concise, therapist-ready digest of the week before each session.
- **Observation missions** — therapists send gentle prompts for what parents should watch for at home.

## Tech Stack

- **Next.js 16** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres, authentication, storage, row-level security
- **Recharts** — pattern visualizations
- **Google Gemini 2.5 Flash** — video understanding via signed URLs
- **MediaPipe Tasks Vision** — client-side pose estimation (WebAssembly)
- **Web Audio API** — client-side prosody analysis

## Privacy & Security

- Encrypted video storage in a private Supabase bucket; access is granted only through short-lived signed URLs.
- **Row-level security** policies on every table; parents, care team members, and admins see only what their role permits.
- **Audio and movement analysis run entirely in the browser** — raw audio and video frames never leave the user's device during local analysis.
- **Content Security Policy**, **HSTS**, **X-Frame-Options DENY**, and **X-Content-Type-Options nosniff** headers enforced at the edge.
- Per-IP API rate limiting and a hard 9 RPM / 240 RPD gate on the Gemini pipeline.
- **COPPA-aligned** data practices. Terms acceptance is required before any dashboard access, and users can opt out of research use at any time.
- Full data export and deletion are available to every account.

## Getting Started

```bash
# 1. Clone
git clone https://github.com/b1nanapeel/ZOE.git
cd zoe

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# then fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   GEMINI_API_KEY

# 4. Apply the database schema
# In the Supabase SQL editor, run the contents of:
#   supabase/schema.sql

# 5. Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Live Demo

https://zoe4all.vercel.app

## License

All rights reserved.
