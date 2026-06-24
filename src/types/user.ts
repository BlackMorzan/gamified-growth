// src/types/user.ts
// User-owned data — the ~5% that the parent inputs and that lives in
// localStorage. Deliberately separate from the static skill graph in
// src/data/skills.ts: static data ships with the app and never changes; this
// is the part that does. User records only ever *reference* a skill by id —
// they never copy any static skill fields, so the two can't drift.

/**
 * Profile for one baby. `name` is the unique key — duplicate names are
 * rejected at the store level. `birthDate` drives all age calculations.
 */
export interface BabyProfile {
  name: string
  /** ISO 8601 calendar date, `YYYY-MM-DD`. No time/zone — a birthday is a day. */
  birthDate: string
}

/**
 * A user-input ↔ skill link: one record per skill per baby.
 * `babyName` is a foreign key into `BabyProfile.name`.
 * `skillId` is a foreign key into `Skill.id` in src/data/skills.ts.
 */
export interface AcquiredSkill {
  /** References `BabyProfile.name`. */
  babyName: string
  /** References `Skill.id` in src/data/skills.ts. */
  skillId: string
  /** ISO 8601 date the parent recorded the acquisition (pre-filled to today). */
  acquiredDate: string
}

/**
 * Root shape of everything persisted to localStorage.
 * version 1 → single profile; version 2 → babies list + babyName on each acquired skill.
 * The storage layer migrates v1 to v2 on first load; v1 is never written back.
 */
export interface PersistedUserData {
  version: 2
  babies: BabyProfile[]
  acquired: AcquiredSkill[]
  /** Per-baby snapshot of available skill IDs at session end — drives the "new" badge diff. */
  prevSessionAvailableIds: Record<string, string[]>
}
