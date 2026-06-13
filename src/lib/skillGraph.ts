import { skills as allSkills, type Skill } from '@/data/skills'

/**
 * The static structure of the skill tree, queryable in both directions.
 *
 * `skills.ts` only authors the "backward" edge — each skill lists what it
 * `requires[]`. This module inverts that once to expose the "forward" edge
 * (what a skill *unlocks*), which every UI state and the acquire-reveal flow
 * need. There is intentionally no authored `unlocks[]` to keep in sync; it is
 * derived here so the two directions can never disagree.
 *
 * Pure and stateless: knows nothing about Vue or the user's acquired set.
 * The reactive "is this available given what's acquired" question belongs in
 * `useSkillGraph.ts`, not here.
 */
export interface SkillGraph {
  /** Reverse index: skill id → the skills it unlocks (those that `requires` it). */
  readonly unlocksById: ReadonlyMap<string, readonly Skill[]>
  /** Skills directly unlocked by `id` (i.e. that list `id` in `requires[]`). */
  getUnlocks(id: string): readonly Skill[]
  /** Hard prerequisites of `id`, in authored order. */
  getRequirements(id: string): readonly Skill[]
}

const EMPTY: readonly Skill[] = Object.freeze([])

/**
 * Builds a {@link SkillGraph} by inverting `requires[]` across the whole skill
 * set in a single pass. Pure — takes the skills explicitly so it can be unit
 * tested with injected fixtures, the same way {@link validateSkills} is.
 *
 * Must be given the *global* skill list, not a per-domain slice: some edges
 * cross domains (e.g. LC007 requires SE003), and a per-domain build would drop
 * them. Dangling `requires[]` entries are ignored here — `validateSkills`
 * already reports them, so this stays free of defensive branching.
 */
export function buildSkillGraph(skills: readonly Skill[]): SkillGraph {
  const byId = new Map<string, Skill>(skills.map((s) => [s.id, s]))

  // Seed every skill with an empty array so lookups for leaf skills (which
  // unlock nothing) still hit the map rather than falling through to EMPTY.
  const unlocksById = new Map<string, Skill[]>()
  for (const skill of skills) {
    unlocksById.set(skill.id, [])
  }

  // One pass: each prerequisite edge `skill.requires -> reqId` means
  // "reqId unlocks skill". Push skill onto reqId's unlock list.
  for (const skill of skills) {
    for (const reqId of skill.requires) {
      unlocksById.get(reqId)?.push(skill)
    }
  }

  return {
    unlocksById,
    getUnlocks: (id) => unlocksById.get(id) ?? EMPTY,
    getRequirements: (id) => {
      const skill = byId.get(id)
      if (!skill) return EMPTY
      return skill.requires
        .map((reqId) => byId.get(reqId))
        .filter((s): s is Skill => s !== undefined)
    },
  }
}

// The app-wide instance, derived once at module load from the real skill data.
const graph = buildSkillGraph(allSkills)

export const unlocksById = graph.unlocksById
export const getUnlocks = graph.getUnlocks
export const getRequirements = graph.getRequirements
