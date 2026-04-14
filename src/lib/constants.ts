export const COMMUNICATION_LEVELS = [
  { value: "NONVERBAL", label: "Nonverbal" },
  { value: "MINIMALLY_VERBAL", label: "Minimally verbal" },
  { value: "VERBAL_WITH_SUPPORT", label: "Verbal with support" },
  { value: "VERBAL", label: "Verbal" },
] as const;

export const DIAGNOSIS_STATUSES = [
  { value: "DIAGNOSED", label: "Diagnosed" },
  { value: "IN_EVALUATION", label: "In evaluation" },
  { value: "SUSPECTED", label: "Suspected" },
  { value: "OTHER", label: "Other" },
] as const;

export const THERAPY_OPTIONS = [
  "ABA",
  "Speech Therapy",
  "Occupational Therapy",
  "Other",
] as const;

export const ANTECEDENT_TAGS = [
  "Transition",
  "New environment",
  "Sensory input",
  "Social interaction",
  "Routine activity",
  "Demand/request placed",
  "Nothing specific",
  "Other",
] as const;

export const BEHAVIOR_TAGS = {
  Communication: [
    "Vocalized",
    "Gestured/pointed",
    "Used AAC device",
    "Made eye contact",
    "Said a word/phrase",
    "Echolalia",
  ],
  Movement: [
    "Hand flapping",
    "Rocking",
    "Spinning",
    "Toe walking",
    "Reached for something",
    "Moved away/withdrew",
  ],
  Emotional: [
    "Smiled/laughed",
    "Cried/screamed",
    "Appeared calm",
    "Appeared distressed",
    "Meltdown",
    "Shutdown",
  ],
  Sensory: [
    "Covered ears",
    "Touched/rubbed texture",
    "Avoided touch",
    "Sought pressure/squeeze",
    "Stared at light/object",
  ],
} as const;

export const CONSEQUENCE_TAGS = [
  "Got what they wanted",
  "I helped them",
  "Situation changed",
  "Nothing changed",
  "They calmed down",
  "They escalated",
  "Other",
] as const;

export const LOCATION_TAGS = [
  "Home",
  "School",
  "Therapy",
  "Car",
  "Public place",
  "Outdoors",
  "Other",
] as const;

export const TIME_CONTEXT_TAGS = [
  "Morning routine",
  "Mealtime",
  "Playtime",
  "Bedtime routine",
  "Transition between activities",
  "Free time",
  "Other",
] as const;

export const PEOPLE_PRESENT_TAGS = [
  "Just me",
  "Both parents",
  "Sibling(s)",
  "Therapist",
  "Teacher",
  "Peers/other children",
  "Strangers/unfamiliar people",
] as const;

export const MOOD_TAGS = [
  "Happy",
  "Calm",
  "Anxious",
  "Upset",
  "Tired",
  "Excited",
  "Unclear",
] as const;
