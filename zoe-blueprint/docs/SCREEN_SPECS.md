# ZOE Screen Specifications

## Navigation Structure

Bottom navigation bar with 4 tabs:
1. **Home** (house icon) — Dashboard with recent clips and active missions
2. **Timeline** (list icon) — Full chronological clip list with filters
3. **Patterns** (chart icon) — Visualizations and trends
4. **Profile** (person icon) — Child profile, care team, settings

Plus a floating **"+ Add Clip"** button (prominent, always accessible) that launches the upload/tag flow.

---

## Screen 1: Landing Page (unauthenticated)

**Purpose:** Explain what ZOE is, get signups.

**Layout:**
- Hero section: headline "See what your child is telling you" with a brief description
- Three value props with icons: "Document moments that matter", "Discover patterns over time", "Share with your child's care team"
- CTA buttons: "Get Started Free" and "Learn More"
- Footer: privacy commitment statement, links to privacy policy

**Tone:** Warm, not clinical. This is for exhausted parents, not doctors.

---

## Screen 2: Onboarding Flow (3 steps)

**Step 1: Create Account**
- Name, email, password fields
- OR Google OAuth button
- Link to privacy policy and terms

**Step 2: Tell Us About Your Child**
- Child's first name (required)
- Date of birth (required)
- Photo (optional, upload or skip)
- Communication level (single select from 4 options)
- Diagnosis status (single select from 4 options)
- Current therapies (multi-select chips: ABA, Speech Therapy, Occupational Therapy, Other)

**Step 3: Quick Orientation**
- Three-panel swipeable tutorial:
  1. "Record a clip when you notice something" (icon: camera)
  2. "Tag what happened — before, during, and after" (icon: tag)
  3. "See patterns build over time" (icon: trending up)
- "Start Using ZOE" button

---

## Screen 3: Home Dashboard

**Purpose:** Quick overview and primary action point.

**Layout (top to bottom):**

1. **Header:** "Good morning, [Name]" with child photo/name switcher (if multiple children)

2. **Active Missions Card** (if any exist):
   - Shows mission prompt from therapist
   - "Record a clip for this" button
   - Dismissible

3. **Quick Stats Bar:**
   - Clips this week: [number]
   - Most tagged behavior: [behavior name]
   - Days until next therapy: [number]

4. **Recent Clips** (horizontal scrollable):
   - Last 5 clips as thumbnail cards
   - Each shows: thumbnail, behavior chips, relative time ("2 hours ago")
   - Tap to open clip detail

5. **This Week's Communication Log:**
   - Simple count of communication-related clips this week vs. last week
   - Small trend arrow (up/down/stable)

6. **Session Prep Banner** (shows 24 hours before scheduled therapy):
   - "You have therapy tomorrow. View your session summary."
   - Tap to open session prep view

---

## Screen 4: Add Clip Flow

**Triggered by:** Floating "+" button from any screen.

**Step 1: Upload**
- Large upload area: "Tap to choose a video from your library"
- Shows file picker filtered to videos
- After selection: video preview thumbnail, duration shown
- "Next" button

**Step 2: Tag — What Happened Before (Antecedent)**
- Question: "What was happening right before this?"
- Chip grid of antecedent options (multi-select)
- Optional text field: "Add more detail..."
- "Next" button

**Step 3: Tag — What Did [Child Name] Do (Behavior)**
- Question: "What did [child name] do?"
- Chip grid organized by subcategory (Communication, Movement, Emotional, Sensory) with small section headers
- Multi-select
- Optional text field
- "Next" button

**Step 4: Tag — What Happened After (Consequence)**
- Question: "What happened next?"
- Chip grid of consequence options
- Optional text field
- "Next" button

**Step 5: Context (optional, skippable)**
- All on one screen, all optional:
  - Location (single select chips)
  - Time context (single select chips)
  - Who was there (multi-select chips)
  - Mood before (single select chips)
- "Skip" link and "Next" button

**Step 6: Your Reflection (optional, skippable)**
- "What do you think was happening?" — text area
- "How did this make you feel?" — text area
- "Skip" link and "Save Clip" button

**After save:** Brief success message with animation, returns to Home with new clip visible.

---

## Screen 5: Timeline View

**Purpose:** Scrollable, filterable list of all clips.

**Layout:**
- **Filter bar** at top: scrollable chips for quick filters (All, Communication, Movement, Emotional, Sensory, This Week, This Month)
- **Advanced filter** (expandable): date range picker, location, mood, specific behavior tags
- **Clip list:** Vertical list of clip cards, grouped by date ("Today", "Yesterday", "March 15")

**Clip Card:**
- Video thumbnail (left, square)
- Right side: behavior tag chips (max 3 visible + "+2 more"), antecedent text preview (1 line), time ("2:34 PM"), location icon if tagged
- Tap → opens Clip Detail Screen

---

## Screen 6: Clip Detail

**Purpose:** Full view of a single clip with all data.

**Layout:**
- **Video player** (top, full width, with standard controls)
- **Tags section:** All ABC tags displayed as colored chips organized by category
- **Context section:** Location, time, people, mood — shown as icon + text pairs
- **Parent reflection** (if provided): quoted text block
- **Therapist annotations** (if any): listed below with author name and date
- **Actions:** Edit tags, Delete clip, Share clip link

---

## Screen 7: Patterns View

**Purpose:** Visualize behavioral data over time.

**Layout (tabbed or scrollable sections):**

**Tab 1: Frequency**
- Bar chart: X-axis = weeks, Y-axis = count, bars colored by behavior category
- Dropdown to select which behaviors to show
- Default: shows top 5 most frequent behaviors

**Tab 2: Context Map**
- Grid/heatmap: rows = behaviors, columns = contexts (locations or antecedents)
- Cell intensity = co-occurrence count
- Helps answer: "When do meltdowns happen?" → "70% during transitions, 20% in new environments"

**Tab 3: Trends**
- List of behaviors with 5+ occurrences
- Each shows: behavior name, trend arrow (↑ ↓ →), percent change, sparkline mini-chart
- Sorted by most change first

**Tab 4: Communication Log**
- Filtered view showing only communication behaviors over time
- Line chart of vocalization/gesture/AAC use frequency per week

---

## Screen 8: Session Prep Summary

**Purpose:** Structured report for therapist before a session.

**Accessed from:** Home dashboard banner, or Patterns view.

**Layout:**
- **Header:** "Session Prep for [Child Name] — [Therapy Type] with [Therapist Name]"
- **Period:** "[Date] to [Date] (7 days)"
- **Overview:** Total clips recorded, top 3 behaviors, any new behaviors
- **Trend highlights:** Behaviors that increased or decreased significantly
- **Notable clips:** 2-3 clips the parent flagged as important (or most recent)
- **Parent reflections:** Any reflection text from the period
- **Active missions:** Status of observation missions
- **Share button:** Generate a link the therapist can access without logging in (time-limited, 72 hours)

---

## Screen 9: Care Team Management

**Purpose:** Invite and manage therapists/family access.

**Layout:**
- **Current team members:** List with name, email, role, status (pending/active)
- **Invite button:** Opens modal with email field and role selector (Therapist/Family)
- **Per-member actions:** Change role, remove from team

---

## Screen 10: Child Profile & Settings

**Purpose:** Manage child info and account settings.

**Layout:**
- **Child info card:** Photo, name, age, communication level, diagnosis — all editable
- **Therapies:** List of current therapies with schedule
- **Data management:** Export all data, delete all data
- **Account settings:** Change password, notification preferences, log out

---

## Responsive Behavior

- **Mobile (primary):** Single column, bottom nav, touch-optimized
- **Tablet:** Two-column layout where appropriate (timeline + detail side by side)
- **Desktop:** Three-column layout (nav sidebar + list + detail)
- Design mobile-first. Everything must work beautifully on a phone screen because that's where parents will use it — standing in the kitchen, sitting in the car, lying in bed after the kids are asleep.
