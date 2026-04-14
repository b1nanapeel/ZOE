# ZOE Data Model

## Entity Relationship Overview

```
User (parent) ──has many──▶ Child
Child ──has many──▶ Clip
Clip ──has many──▶ ClipTag
Clip ──has many──▶ Annotation (by therapist)
Child ──has many──▶ CareTeamMember
CareTeamMember ──references──▶ User (therapist)
Child ──has many──▶ ObservationMission
User ──has many──▶ TherapySchedule (per child)
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS
// ============================================

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String
  avatarUrl       String?
  role            UserRole @default(PARENT)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  children        Child[]           @relation("ParentChildren")
  careTeamRoles   CareTeamMember[]  @relation("TeamMemberUser")
  annotations     Annotation[]
  missions        ObservationMission[]

  @@map("users")
}

enum UserRole {
  PARENT
  THERAPIST
  ADMIN
}

// ============================================
// CHILDREN
// ============================================

model Child {
  id                  String   @id @default(cuid())
  parentId            String
  name                String
  dateOfBirth         DateTime
  photoUrl            String?
  communicationLevel  CommunicationLevel
  diagnosisStatus     DiagnosisStatus
  diagnosisDetails    String?  // Free text for specifics
  currentTherapies    String[] // Array: ["ABA", "SLP", "OT"]
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  parent              User              @relation("ParentChildren", fields: [parentId], references: [id], onDelete: Cascade)
  clips               Clip[]
  careTeam            CareTeamMember[]
  therapySchedules    TherapySchedule[]
  missions            ObservationMission[]

  @@map("children")
}

enum CommunicationLevel {
  NONVERBAL
  MINIMALLY_VERBAL
  VERBAL_WITH_SUPPORT
  VERBAL
}

enum DiagnosisStatus {
  DIAGNOSED
  IN_EVALUATION
  SUSPECTED
  OTHER
}

// ============================================
// CLIPS (core entity)
// ============================================

model Clip {
  id              String   @id @default(cuid())
  childId         String
  uploadedById    String   // The user who uploaded
  videoUrl        String   // Supabase Storage path (not public URL)
  thumbnailUrl    String?  // Auto-generated thumbnail
  durationSeconds Int      // Clip length in seconds
  fileSizeBytes   Int      // File size for storage tracking
  
  // ABC Tagging
  antecedents     String[] // Tags from predefined list
  antecedentNote  String?  // Free text
  behaviors       String[] // Tags from predefined list
  behaviorNote    String?  // Free text
  consequences    String[] // Tags from predefined list
  consequenceNote String?  // Free text
  
  // Context
  location        String?  // Home, School, Therapy, Car, Public, Other
  timeContext     String?  // Morning routine, Mealtime, Playtime, etc.
  peoplePresent   String[] // Just me, Both parents, Sibling, etc.
  moodBefore      String?  // Happy, Calm, Anxious, Upset, Tired, Excited
  
  // Parent reflection
  parentInterpretation String? // "What do you think was happening?"
  parentFeeling        String? // "How did this make you feel?"
  
  // Metadata
  recordedAt      DateTime? // When the clip was actually recorded (from file metadata or manual entry)
  uploadedAt      DateTime  @default(now())
  isDeleted       Boolean   @default(false)
  deletedAt       DateTime?
  
  // Relations
  child           Child         @relation(fields: [childId], references: [id], onDelete: Cascade)
  tags            ClipTag[]
  annotations     Annotation[]

  @@index([childId, uploadedAt])
  @@index([childId, isDeleted])
  @@map("clips")
}

// ============================================
// CLIP TAGS (normalized for querying)
// ============================================

// While tags are stored as arrays on Clip for convenience,
// this table enables efficient querying for pattern analysis

model ClipTag {
  id        String   @id @default(cuid())
  clipId    String
  category  TagCategory  // ANTECEDENT, BEHAVIOR, CONSEQUENCE, CONTEXT
  value     String       // The actual tag value
  createdAt DateTime @default(now())

  clip      Clip     @relation(fields: [clipId], references: [id], onDelete: Cascade)

  @@index([category, value])
  @@index([clipId])
  @@map("clip_tags")
}

enum TagCategory {
  ANTECEDENT
  BEHAVIOR
  CONSEQUENCE
  LOCATION
  TIME_CONTEXT
  PEOPLE_PRESENT
  MOOD
}

// ============================================
// ANNOTATIONS (therapist notes on clips)
// ============================================

model Annotation {
  id          String   @id @default(cuid())
  clipId      String
  authorId    String   // The therapist/team member who wrote it
  content     String   // The annotation text
  isPrivate   Boolean  @default(false) // Private = only visible to care team, not parent
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  clip        Clip     @relation(fields: [clipId], references: [id], onDelete: Cascade)
  author      User     @relation(fields: [authorId], references: [id])

  @@map("annotations")
}

// ============================================
// CARE TEAM
// ============================================

model CareTeamMember {
  id          String        @id @default(cuid())
  childId     String
  userId      String?       // Null if invited but not yet signed up
  email       String        // Email used for invitation
  role        TeamRole
  status      InviteStatus  @default(PENDING)
  invitedAt   DateTime      @default(now())
  joinedAt    DateTime?

  child       Child         @relation(fields: [childId], references: [id], onDelete: Cascade)
  user        User?         @relation("TeamMemberUser", fields: [userId], references: [id])

  @@unique([childId, email]) // One invite per email per child
  @@map("care_team_members")
}

enum TeamRole {
  THERAPIST   // Can view clips, annotate, set missions
  FAMILY      // Can view clips only
}

enum InviteStatus {
  PENDING
  ACCEPTED
  DECLINED
}

// ============================================
// THERAPY SCHEDULE
// ============================================

model TherapySchedule {
  id            String   @id @default(cuid())
  childId       String
  therapyType   String   // ABA, SLP, OT, etc.
  dayOfWeek     Int      // 0=Sunday, 6=Saturday
  timeOfDay     String   // "10:00 AM"
  providerName  String?  // Therapist name
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  child         Child    @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@map("therapy_schedules")
}

// ============================================
// OBSERVATION MISSIONS
// ============================================

model ObservationMission {
  id          String        @id @default(cuid())
  childId     String
  assignedById String       // Therapist who assigned it
  prompt      String        // "Try to capture a clip during morning transition"
  status      MissionStatus @default(ACTIVE)
  dueDate     DateTime?
  createdAt   DateTime      @default(now())
  completedAt DateTime?

  child       Child         @relation(fields: [childId], references: [id], onDelete: Cascade)
  assignedBy  User          @relation(fields: [assignedById], references: [id])

  @@map("observation_missions")
}

enum MissionStatus {
  ACTIVE
  COMPLETED
  EXPIRED
}
```

## Tag Value Constants

These are the predefined tag options used in the tagging flow. Stored in `src/lib/constants.ts`:

### Antecedent Tags
- Transition
- New environment
- Sensory input
- Social interaction
- Routine activity
- Demand/request placed
- Nothing specific
- Other

### Behavior Tags (by subcategory)

**Communication:**
- Vocalized
- Gestured/pointed
- Used AAC device
- Made eye contact
- Said a word/phrase
- Echolalia

**Movement:**
- Hand flapping
- Rocking
- Spinning
- Toe walking
- Reached for something
- Moved away/withdrew

**Emotional:**
- Smiled/laughed
- Cried/screamed
- Appeared calm
- Appeared distressed
- Meltdown
- Shutdown

**Sensory:**
- Covered ears
- Touched/rubbed texture
- Avoided touch
- Sought pressure/squeeze
- Stared at light/object

### Consequence Tags
- Got what they wanted
- I helped them
- Situation changed
- Nothing changed
- They calmed down
- They escalated
- Other

### Location Tags
- Home
- School
- Therapy
- Car
- Public place
- Outdoors
- Other

### Time Context Tags
- Morning routine
- Mealtime
- Playtime
- Bedtime routine
- Transition between activities
- Free time
- Other

### People Present Tags
- Just me
- Both parents
- Sibling(s)
- Therapist
- Teacher
- Peers/other children
- Strangers/unfamiliar people

### Mood Tags
- Happy
- Calm
- Anxious
- Upset
- Tired
- Excited
- Unclear
