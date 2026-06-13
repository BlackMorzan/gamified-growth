// src/types/skillState.ts
// The derived layer that sits between static skill data and user data: a
// skill's display state is computed from the static graph (requires[],
// milestone) overlaid with the user's acquired set. The computation itself
// lives in the useSkillGraph composable (H3); these are just the shared types
// its output and the SkillCard props are written against.

import type { Skill } from '@/data/skills'

/**
 * The visual/interaction state of a single skill card. Matches the Skill State
 * Visual Language table in CLAUDE.md.
 *
 * - `locked`             — prerequisites unmet (lock icon carries the state).
 * - `available`          — all `requires[]` acquired; reachable now.
 * - `acquired`           — marked done by the parent.
 * - `milestone`          — available *and* `milestone` (gold; not yet acquired).
 * - `acquired-milestone` — acquired *and* `milestone` ("gold wins" over green).
 *
 * Hover is a transient CSS `:hover` state, not a persisted one — it is
 * intentionally absent here.
 */
export type SkillState =
  | 'locked'
  | 'available'
  | 'acquired'
  | 'milestone'
  | 'acquired-milestone'

/**
 * A static {@link Skill} paired with its derived state for a given baby. Static
 * data stays nested and untouched under `skill`; `state` and `acquiredDate` are
 * the overlay. This is the prop shape SkillCard renders from (H5).
 */
export interface SkillWithState {
  skill: Skill
  state: SkillState
  /** Set only when `state` is `acquired` or `acquired-milestone`; otherwise null. */
  acquiredDate: string | null
}
