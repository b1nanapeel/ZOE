# ZOE Design System

## Design Philosophy

ZOE is used by exhausted parents in stressful moments. The design must be:
- **Calm** — soft colors, generous whitespace, no visual noise
- **Clear** — obvious what to do next, never overwhelming
- **Warm** — feels human and supportive, not clinical or sterile
- **Fast** — one-thumb operation, minimal taps to complete any task

This is not a medical app. It's a journal for parents who love their kids. Design it like you're designing for someone who's had a long day.

## Color Palette

```css
:root {
  /* Primary — a warm teal/sage that feels calming and trustworthy */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-200: #bbf7d0;
  --color-primary-300: #86efac;
  --color-primary-400: #4ade80;
  --color-primary-500: #22c55e;    /* Main primary */
  --color-primary-600: #16a34a;
  --color-primary-700: #15803d;
  --color-primary-800: #166534;
  --color-primary-900: #14532d;
  
  /* Secondary — a soft purple for accents and highlights */
  --color-secondary-50: #faf5ff;
  --color-secondary-100: #f3e8ff;
  --color-secondary-200: #e9d5ff;
  --color-secondary-300: #d8b4fe;
  --color-secondary-400: #c084fc;
  --color-secondary-500: #a855f7;   /* Main secondary */
  --color-secondary-600: #9333ea;
  
  /* Neutral — warm grays, not cold */
  --color-neutral-50: #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Behavior category colors (for tag chips) */
  --color-communication: #3b82f6;   /* Blue */
  --color-movement: #f59e0b;        /* Amber */
  --color-emotional: #ec4899;       /* Pink */
  --color-sensory: #8b5cf6;         /* Violet */
  --color-antecedent: #6b7280;      /* Gray */
  --color-consequence: #10b981;     /* Emerald */
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #fafaf9;
  --bg-card: #ffffff;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
}
```

## Typography

Use **Google Fonts**:
- **Display / Headings:** `DM Sans` — warm, rounded, friendly but professional
- **Body text:** `DM Sans` — same family for consistency
- **Monospace (data/numbers):** `JetBrains Mono` — for pattern statistics

```css
/* Type Scale */
--text-xs: 0.75rem;     /* 12px — captions, timestamps */
--text-sm: 0.875rem;    /* 14px — secondary text */
--text-base: 1rem;      /* 16px — body text */
--text-lg: 1.125rem;    /* 18px — card titles */
--text-xl: 1.25rem;     /* 20px — section headers */
--text-2xl: 1.5rem;     /* 24px — page titles */
--text-3xl: 1.875rem;   /* 30px — hero text */

/* Font weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Spacing

Use Tailwind's default spacing scale. Key values:
- Card padding: `p-4` (16px) on mobile, `p-6` (24px) on desktop
- Section gaps: `gap-6` (24px)
- Between cards in a list: `gap-3` (12px)
- Between tag chips: `gap-2` (8px)
- Page horizontal padding: `px-4` (16px) on mobile

## Border Radius

- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Tag chips: `rounded-full` (pill shape)
- Input fields: `rounded-lg` (8px)
- Avatars: `rounded-full`

## Component Patterns

### Tag Chips
```
Appearance: Pill-shaped, colored background at 10% opacity with full-color text
Sizes: 
  - Default: h-8, px-3, text-sm
  - Small: h-6, px-2, text-xs
States:
  - Unselected: bg-neutral-100, text-neutral-600
  - Selected: bg-[category-color]/10, text-[category-color], ring-1 ring-[category-color]/30
  - Hover: slight brightness increase
```

### Clip Card
```
Layout: Horizontal card, 80px square thumbnail on left, content on right
Background: white
Border: 1px solid neutral-200
Shadow: shadow-sm
Border radius: rounded-xl
Content right side:
  - Top: behavior tags as small chips (max 3 + overflow count)
  - Middle: antecedent text preview (1 line, truncated)
  - Bottom: timestamp + location icon
Hover: shadow-md, slight scale transform
```

### Floating Action Button (Add Clip)
```
Position: Fixed, bottom-right (above bottom nav on mobile)
Size: 56px circle
Color: primary-500 background, white icon
Shadow: shadow-lg
Icon: Plus sign
Animation: gentle pulse on first visit, static after
```

### Bottom Navigation
```
Height: 64px + safe area inset
Background: white
Border-top: 1px solid neutral-200
Items: 4 icons with labels below
Active state: primary-500 color
Inactive state: neutral-400
```

### Cards
```
Background: white
Border: 1px solid neutral-100
Border-radius: rounded-xl
Padding: p-4
Shadow: shadow-sm
```

### Form Inputs
```
Height: 44px (meets touch target requirements)
Border: 1px solid neutral-300
Focus: ring-2 ring-primary-500/30, border-primary-500
Border-radius: rounded-lg
Padding: px-3
Font-size: text-base (16px — prevents iOS zoom)
```

### Buttons
```
Primary: bg-primary-500, text-white, hover:bg-primary-600, h-11 (44px)
Secondary: bg-white, text-neutral-700, border border-neutral-300, hover:bg-neutral-50
Ghost: bg-transparent, text-primary-500, hover:bg-primary-50
Destructive: bg-error, text-white
All: rounded-lg, font-medium, transition-colors
```

## Animation Guidelines

- Page transitions: fade + slight slide up (200ms ease-out)
- Chip selection: scale bounce (150ms)
- Upload progress: smooth linear progress bar
- Success state: gentle checkmark animation (300ms)
- Loading: subtle skeleton screens, not spinners
- Keep all animations under 300ms — parents are in a hurry

## Empty States

Every list/view needs a designed empty state:
- Timeline with no clips: "Your timeline is empty. Record your first clip to start building your child's story." + prominent upload button
- Patterns with insufficient data: "Keep recording! Patterns will appear after 5 or more clips with the same behavior tag."
- No care team: "Invite your child's therapist to see clips and add their insights."

## Accessibility Requirements

- All interactive elements: minimum 44x44px touch target
- Color contrast: minimum 4.5:1 for text, 3:1 for large text
- All images/icons: aria-labels
- Focus indicators visible
- Form fields: associated labels
- Error messages: clear, specific, and linked to the field
- Video player: playback controls accessible via keyboard
