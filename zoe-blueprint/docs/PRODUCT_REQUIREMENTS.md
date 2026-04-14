# ZOE Product Requirements Document (PRD)

## 1. Product Vision

ZOE is a behavioral documentation platform that makes the 165 hours between therapy sessions clinically productive for families of autistic children. Parents document what they observe. The app organizes it. Therapists get the data they've never had.

## 2. User Personas

### Persona 1: Sarah (Parent)
- Mother of a 6-year-old nonverbal autistic son
- Works part-time, manages therapy schedule (ABA 2x/week, SLP 1x/week)
- Currently tries to remember behavioral incidents to tell therapist, forgets most of them
- Has 200+ unorganized videos of her son on her phone
- Pain: "I know he's trying to tell me something but I can't figure out what. And by the time I see the therapist, I've forgotten half of what happened."

### Persona 2: Dr. Reyes (BCBA)
- Board Certified Behavior Analyst with caseload of 18 children
- Uses CentralReach for session documentation
- Gets unreliable verbal reports from parents about between-session behavior
- Pain: "I see the child for 2 hours. The parents see them for 166. But I have no idea what happens in those hours."

### Persona 3: (Future) Ms. Thompson (Special Ed Teacher)
- Manages IEPs for 12 students with autism
- Required to document behavioral progress quarterly
- Pain: "I need measurable data for IEP meetings and I'm doing it on paper."

## 3. MVP Feature Set (What We Build Now)

### 3.1 Authentication & Onboarding
- Email/password signup and login
- OAuth with Google (many parents use Android)
- Onboarding flow: create first child profile (name, date of birth, diagnosis status, current therapies, communication level)
- Onboarding asks: "What does your child do when they want something?" and "What's the hardest part of your day?" — this primes the parent to think in behavioral terms

### 3.2 Child Profile
- Each account can have multiple child profiles
- Profile stores: name, DOB, photo (optional), diagnosis info, communication level (nonverbal / minimally verbal / verbal with support / verbal), current therapies and providers, notes
- Profile is the hub — all clips, tags, and patterns are per-child

### 3.3 Clip Recording & Upload
- **Primary flow: Upload from camera roll** (MVP — simpler than in-app recording)
- Secondary flow: Record directly in app (post-MVP)
- Max clip length: 3 minutes (enforced on upload)
- Supported formats: MP4, MOV, WEBM
- Upload shows progress bar
- After upload, immediately goes to tagging flow
- Videos stored encrypted at rest (AES-256)
- Parents can delete any clip at any time — hard delete, not soft

### 3.4 Clip Tagging (ABC Framework)
This is the core interaction. After uploading a clip, the parent tags it.

**Screen: Tag This Clip**

Section 1 — What happened before? (Antecedent)
- Quick-select chips: "Transition", "New environment", "Sensory input", "Social interaction", "Routine activity", "Nothing specific", "Other"
- Optional free-text field: "Describe what was happening..."

Section 2 — What did your child do? (Behavior)
- Quick-select chips organized by category:
  - **Communication**: "Vocalized", "Gestured/pointed", "Used AAC device", "Made eye contact", "Said a word/phrase", "Echolalia"
  - **Movement**: "Hand flapping", "Rocking", "Spinning", "Toe walking", "Reached for something", "Moved away/withdrew"
  - **Emotional**: "Smiled/laughed", "Cried/screamed", "Appeared calm", "Appeared distressed", "Meltdown", "Shutdown"
  - **Sensory**: "Covered ears", "Touched/rubbed texture", "Avoided touch", "Sought pressure/squeeze", "Stared at light/object"
- Multiple selections allowed
- Optional free-text: "Describe what you noticed..."

Section 3 — What happened after? (Consequence)
- Quick-select chips: "Got what they wanted", "I helped them", "Situation changed", "Nothing changed", "They calmed down", "They escalated", "Other"
- Optional free-text

Section 4 — Context (all optional)
- Location: Home, School, Therapy, Car, Public place, Other
- Time relevance: Morning routine, Mealtime, Playtime, Bedtime, Transition, Other
- Who was present: Just me, Both parents, Sibling(s), Therapist, Teacher, Peers, Strangers
- Overall mood before clip: Happy, Calm, Anxious, Upset, Tired, Excited

Section 5 — Your reflection (optional)
- "What do you think was happening?" — free text
- "How did this make you feel?" — free text
- These fields are for the parent's benefit and therapist context. Not analyzed by AI.

**Save** → clip appears in timeline with all tags

### 3.5 Timeline View
- Reverse-chronological list of all clips for a child
- Each clip card shows: thumbnail, date/time, primary behavior tags (as colored chips), antecedent summary, clip duration
- Filter by: behavior type, date range, location, mood
- Search by tag or free-text content
- Tap a clip → full playback with all tags and context visible alongside the video

### 3.6 Patterns View
- **Behavior Frequency**: Bar chart showing how often each behavior tag appears per week over the past 4/8/12 weeks
- **Behavior by Context**: Which behaviors happen in which contexts (heatmap-style — e.g., "meltdowns" happen 70% during "transitions" and 20% during "new environments")
- **Trend Lines**: For any behavior the parent has tagged 5+ times, show a simple trend line (increasing, decreasing, stable)
- **Communication Log**: Filtered view showing only communication-related clips (vocalized, gestured, used AAC, made eye contact, said word) with frequency trend
- All of this is pure data visualization from the parent's own tags. No AI interpretation. No clinical claims.

### 3.7 Care Team Sharing
- Parent can invite care team members by email
- Roles: "Therapist" (can view all clips, add annotations), "Family" (can view clips, cannot annotate)
- Therapist sees: child profile, full timeline, patterns view, can add private notes per clip
- **Session Prep Summary**: Auto-generated before a therapy appointment (parent sets recurring schedule). Summary shows: total clips this period, most frequent behaviors, any new behaviors tagged for first time, trend changes, parent's reflection notes. This is a formatted summary the therapist can review in 2 minutes.
- Therapist can set "Observation Missions" — a prompt that appears for the parent: "This week, try to capture a clip when [child] is playing with a peer" or "Can you record what happens during the morning transition?"

### 3.8 Settings & Data Management
- Edit child profile
- Manage care team members
- Set therapy schedule (for session prep timing)
- Export data (download all clips + tags as ZIP)
- Delete all data (complete account deletion with confirmation)
- Notification preferences

## 4. Non-Functional Requirements

### 4.1 Privacy & Compliance
- All video encrypted at rest (AES-256) and in transit (TLS 1.3)
- COPPA compliance: parental consent required, no data from children under 13 collected directly
- HIPAA-readiness: architecture must support BAA with cloud provider (use AWS with BAA or similar)
- No video is ever used for AI training without explicit, separate, opt-in consent
- Parents can delete all data at any time — hard delete within 30 days from all backups
- Privacy policy must be clear, plain-language, and prominent

### 4.2 Performance
- Video upload: support clips up to 200MB
- Timeline loads in under 2 seconds with 100+ clips
- Patterns view calculates in under 3 seconds with 500+ tagged clips
- App works offline for viewing cached clips (upload requires connection)

### 4.3 Accessibility
- WCAG 2.1 AA compliance
- Works on screen readers
- High contrast mode
- Text scales to 200%
- Touch targets minimum 44x44px

## 5. What We Explicitly Do NOT Build in MVP

- In-app video recording (use camera roll upload)
- AI-powered analysis of any kind (no computer vision, no speech analysis)
- Native mobile apps (web app first, PWA-ready)
- Payment/subscription system
- Therapist-facing standalone dashboard (therapists access through sharing, not a separate product)
- Any diagnostic or interpretive features
- Community features or parent-to-parent communication

## 6. Success Metrics

- Can a parent upload and tag a clip in under 3 minutes?
- Does a parent upload at least 3 clips per week after the first week?
- Does a therapist open the session prep summary before appointments?
- Do parents report feeling more prepared for therapy sessions? (In-app survey after 4 weeks)
- Does pattern data match therapist independent assessment? (Validation metric for later)
