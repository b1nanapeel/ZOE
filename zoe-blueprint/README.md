# ZOE — Behavioral Intelligence Platform for Autism Families

## What This Is

This folder contains the complete blueprint for building ZOE, a behavioral documentation and pattern intelligence platform for families of nonverbal/minimally verbal autistic children. Every architectural decision, screen specification, data model, and implementation detail is documented here.

## For Claude Code: How to Build This

Read the files in this order:

1. **docs/PRODUCT_REQUIREMENTS.md** — The full product spec. Every feature, every screen, every user flow.
2. **docs/TECH_STACK.md** — Technology choices and why. Do not deviate from these choices.
3. **docs/DATA_MODEL.md** — Database schema with all tables, relationships, and constraints.
4. **docs/API_SPEC.md** — Every API endpoint the backend needs to expose.
5. **docs/SCREEN_SPECS.md** — Screen-by-screen UI specifications with layout, components, and behavior.
6. **design/DESIGN_SYSTEM.md** — Colors, typography, spacing, component patterns. Follow exactly.
7. **claude-code-instructions/BUILD_ORDER.md** — Step-by-step build sequence. Build in this exact order.
8. **claude-code-instructions/GITHUB_SETUP.md** — Repository setup, branching strategy, deployment.

## Project Overview

**The Problem:** 590,000-705,000 nonverbal/minimally verbal autistic children in the US receive therapy 1-3 hours/week. Their families are alone for the other 165+ hours with no tools to document behavioral patterns or share observations with therapists.

**The Solution:** ZOE lets parents record short video clips, tag them with clinical-grade behavioral context (ABC framework), view patterns over time, and share structured summaries with their child's therapy team.

**The Users:**
- Parents/caregivers of nonverbal or minimally verbal autistic children (ages 0-17)
- BCBAs, SLPs, and OTs who treat these children
- (Later) School district special education teams

**What We're Building First (MVP):**
- Parent-facing web app (PWA-ready) for recording, tagging, and viewing behavioral clips
- Basic pattern visualization (frequency trends, behavior grouping)
- Care team sharing (invite therapist to view child's profile)
- No AI in MVP — pure documentation tool that's valuable from day one

**What We Add Later (Post-MVP):**
- On-device MediaPipe pose estimation for auto-detecting movements
- Prosodic feature extraction from audio (15-feature set per Hu et al. 2025)
- Therapist dashboard (B2B)
- Pattern correlation engine
- Session prep summaries
