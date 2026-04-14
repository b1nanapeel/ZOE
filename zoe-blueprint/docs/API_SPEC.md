# ZOE API Specification

## Base URL
`/api/v1`

## Authentication
All endpoints except `/auth/*` require a valid session token via Supabase Auth.
Token passed as `Authorization: Bearer <token>` header.

---

## Auth Endpoints

### POST /auth/signup
Create a new account.
```json
Request: { "email": "string", "password": "string", "name": "string" }
Response: { "user": User, "session": Session }
```

### POST /auth/login
```json
Request: { "email": "string", "password": "string" }
Response: { "user": User, "session": Session }
```

### POST /auth/logout
Invalidate current session.

### POST /auth/oauth/google
Initiate Google OAuth flow.

---

## Children Endpoints

### GET /children
List all children for the authenticated parent.
```json
Response: { "children": Child[] }
```

### POST /children
Create a child profile.
```json
Request: {
  "name": "string",
  "dateOfBirth": "ISO date",
  "communicationLevel": "NONVERBAL | MINIMALLY_VERBAL | VERBAL_WITH_SUPPORT | VERBAL",
  "diagnosisStatus": "DIAGNOSED | IN_EVALUATION | SUSPECTED | OTHER",
  "diagnosisDetails": "string (optional)",
  "currentTherapies": ["ABA", "SLP"],
  "notes": "string (optional)"
}
Response: { "child": Child }
```

### GET /children/:childId
Get a single child profile. Requires parent ownership or care team membership.

### PATCH /children/:childId
Update child profile. Parent only.

### DELETE /children/:childId
Delete child and all associated data. Parent only. Requires confirmation.

---

## Clips Endpoints

### POST /clips/upload-url
Get a signed upload URL for Supabase Storage.
```json
Request: { "childId": "string", "fileName": "string", "fileType": "string", "fileSize": number }
Response: { "uploadUrl": "string", "storagePath": "string" }
```

### POST /clips
Create clip record after successful upload.
```json
Request: {
  "childId": "string",
  "storagePath": "string",
  "durationSeconds": number,
  "fileSizeBytes": number,
  "recordedAt": "ISO datetime (optional)",
  "antecedents": ["string"],
  "antecedentNote": "string (optional)",
  "behaviors": ["string"],
  "behaviorNote": "string (optional)",
  "consequences": ["string"],
  "consequenceNote": "string (optional)",
  "location": "string (optional)",
  "timeContext": "string (optional)",
  "peoplePresent": ["string"],
  "moodBefore": "string (optional)",
  "parentInterpretation": "string (optional)",
  "parentFeeling": "string (optional)"
}
Response: { "clip": Clip }
```

### GET /children/:childId/clips
List clips for a child. Supports pagination and filtering.
```
Query params:
  - page (default: 1)
  - limit (default: 20)
  - behavior (filter by behavior tag)
  - location (filter by location)
  - dateFrom (ISO date)
  - dateTo (ISO date)
  - mood (filter by mood)
  - sort (uploadedAt_desc | uploadedAt_asc)
```
```json
Response: {
  "clips": Clip[],
  "total": number,
  "page": number,
  "totalPages": number
}
```

### GET /clips/:clipId
Get single clip with all tags, annotations, and a signed playback URL.
```json
Response: {
  "clip": Clip,
  "playbackUrl": "signed URL (expires in 1 hour)",
  "annotations": Annotation[]
}
```

### PATCH /clips/:clipId
Update clip tags/context. Parent only.

### DELETE /clips/:clipId
Soft delete. Sets isDeleted=true and deletedAt=now().

### DELETE /clips/:clipId/permanent
Hard delete. Removes from storage and database. Parent only.

---

## Patterns Endpoints

### GET /children/:childId/patterns/behavior-frequency
Get behavior tag frequency over time.
```
Query params:
  - weeks (default: 8, max: 52)
  - behaviors (comma-separated filter, optional)
```
```json
Response: {
  "weeks": [
    {
      "weekStart": "ISO date",
      "counts": { "hand_flapping": 3, "vocalized": 7, "meltdown": 1 }
    }
  ]
}
```

### GET /children/:childId/patterns/behavior-context
Get behavior-context co-occurrence data.
```json
Response: {
  "matrix": [
    { "behavior": "meltdown", "context": "transition", "count": 14, "percentage": 70 },
    { "behavior": "meltdown", "context": "new_environment", "count": 4, "percentage": 20 }
  ]
}
```

### GET /children/:childId/patterns/trends
Get trend data for behaviors tagged 5+ times.
```json
Response: {
  "trends": [
    {
      "behavior": "vocalized",
      "direction": "increasing",
      "percentChange": 40,
      "periodWeeks": 4,
      "totalOccurrences": 23
    }
  ]
}
```

### GET /children/:childId/patterns/session-prep
Generate session prep summary for a date range.
```
Query params:
  - from (ISO date, default: last therapy session)
  - to (ISO date, default: now)
```
```json
Response: {
  "period": { "from": "date", "to": "date" },
  "totalClips": number,
  "topBehaviors": [{ "behavior": "string", "count": number }],
  "newBehaviors": ["string"],  // First time tagged in this period
  "trends": Trend[],
  "parentReflections": [{ "clipId": "string", "text": "string", "date": "date" }],
  "activeMissions": Mission[],
  "missionCompletions": number
}
```

---

## Care Team Endpoints

### GET /children/:childId/team
List care team members.

### POST /children/:childId/team/invite
Invite a care team member.
```json
Request: { "email": "string", "role": "THERAPIST | FAMILY" }
Response: { "invitation": CareTeamMember }
```

### PATCH /team/invitations/:inviteId/accept
Accept an invitation (called by the invited user).

### DELETE /children/:childId/team/:memberId
Remove a team member. Parent only.

---

## Annotations Endpoints

### POST /clips/:clipId/annotations
Add an annotation to a clip. Therapist role required.
```json
Request: { "content": "string", "isPrivate": boolean }
Response: { "annotation": Annotation }
```

### DELETE /annotations/:annotationId
Delete own annotation. Author only.

---

## Observation Missions Endpoints

### POST /children/:childId/missions
Create a mission. Therapist role required.
```json
Request: { "prompt": "string", "dueDate": "ISO date (optional)" }
Response: { "mission": ObservationMission }
```

### GET /children/:childId/missions
List active missions for a child.

### PATCH /missions/:missionId/complete
Mark mission as completed.
