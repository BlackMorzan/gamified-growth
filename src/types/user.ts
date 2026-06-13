// src/types/user.ts
// User-owned data — the ~5% that the parent inputs and that lives in
// localStorage. Deliberately separate from the static skill graph in
// src/data/skills.ts: static data ships with the app and never changes; this
// is the part that does. User records only ever *reference* a skill by id —
// they never copy any static skill fields, so the two can't drift.

/**
 * General profile for the baby. One per app install (Phase 2 has no accounts).
 * `birthDate` drives every age calculation and gates the tree — the tree must
 * not render without it (see CLAUDE.md first-run flow).
 */
export interface BabyProfile {
  name: string
  /** ISO 8601 calendar date, `YYYY-MM-DD`. No time/zone — a birthday is a day. */
  birthDate: string
}

/**
 * A user-input ↔ skill link: one record per skill the parent has marked
 * acquired. `skillId` is a foreign key into a static {@link Skill}.id; the rest
 * is user input. Resolve the full skill via `skillById` / `skillGraph`, never
 * by embedding skill data here.
 */
export interface AcquiredSkill {
  /** References `Skill.id` in src/data/skills.ts. */
  skillId: string
  /** ISO 8601 date the parent recorded the acquisition (pre-filled to today). */
  acquiredDate: string
}

/**
 * Root shape of everything persisted to localStorage. `version` exists so the
 * storage layer (M2) can migrate or safely discard old/corrupt shapes rather
 * than trusting a raw `JSON.parse`. M2 owns read/write + validation; this is
 * only the type they share.
 */
export interface PersistedUserData {
  version: 1
  profile: BabyProfile | null
  acquired: AcquiredSkill[]
}
