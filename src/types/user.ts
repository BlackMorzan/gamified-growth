// src/types/user.ts
// User-owned data — the ~5% that the parent inputs and that lives in
// localStorage. Deliberately separate from the static skill graph in
// src/data/skills.ts: static data ships with the app and never changes; this
// is the part that does. User records only ever *reference* a skill by id —
// they never copy any static skill fields, so the two can't drift.

/**
 * Profile for one baby. `id` is the stable primary key (UUID); `name` is display-only.
 * Duplicate names are rejected at the store level. `birthDate` drives all age calculations.
 */
export interface BabyProfile {
  id: string
  name: string
  /** ISO 8601 calendar date, `YYYY-MM-DD`. No time/zone — a birthday is a day. */
  birthDate: string
}

/**
 * A user-input ↔ skill link: one record per skill per baby.
 * `babyId` is a foreign key into `BabyProfile.id`.
 * `skillId` is a foreign key into `Skill.id` in src/data/skills.ts.
 */
export interface AcquiredSkill {
  /** References `BabyProfile.id`. */
  babyId: string
  /** References `Skill.id` in src/data/skills.ts. */
  skillId: string
  /** ISO 8601 date the parent recorded the acquisition (pre-filled to today). */
  acquiredDate: string
}

/**
 * Root shape of everything persisted to localStorage.
 * version 3 → BabyProfile has `id`; AcquiredSkill uses `babyId` instead of `babyName`.
 * Versions 1 and 2 are not migrated — data is wiped on mismatch (beta).
 */
export interface PersistedUserData {
  version: 3
  babies: BabyProfile[]
  acquired: AcquiredSkill[]
  /** Per-baby snapshot of available skill IDs at session end — keyed by babyId. */
  prevSessionAvailableIds: Record<string, string[]>
}
