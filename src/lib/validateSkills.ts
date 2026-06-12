import type { Skill } from '@/data/skills'

/**
 * A single integrity problem found in the static skill graph.
 * `skillId` is the skill the problem is attributed to; `detail` is human-readable.
 */
export interface SkillGraphIssue {
  kind:
    | 'duplicate-id'
    | 'self-reference'
    | 'dangling-require'
    | 'dangling-strengthen'
    | 'tier-order'
    | 'age-range'
    | 'cycle'
  skillId: string
  detail: string
}

/**
 * Validates the static skill graph for problems the TypeScript compiler cannot
 * catch — the skills reference each other by string ID at runtime, so a typo or
 * a bad edge is invisible to the type system.
 *
 * Returns an empty array when the data is clean. Pure; never throws.
 */
export function validateSkills(skills: readonly Skill[]): SkillGraphIssue[] {
  const issues: SkillGraphIssue[] = []
  const byId = new Map<string, Skill>()

  // Duplicate IDs — a plain Map keyed by id would silently keep only the last.
  for (const skill of skills) {
    if (byId.has(skill.id)) {
      issues.push({
        kind: 'duplicate-id',
        skillId: skill.id,
        detail: `id "${skill.id}" is defined more than once.`,
      })
    } else {
      byId.set(skill.id, skill)
    }
  }

  for (const skill of skills) {
    // Self-references.
    if (skill.requires.includes(skill.id)) {
      issues.push({ kind: 'self-reference', skillId: skill.id, detail: 'requires[] lists itself.' })
    }
    if (skill.strengthens.includes(skill.id)) {
      issues.push({ kind: 'self-reference', skillId: skill.id, detail: 'strengthens[] lists itself.' })
    }

    // Dangling references.
    for (const reqId of skill.requires) {
      if (!byId.has(reqId)) {
        issues.push({ kind: 'dangling-require', skillId: skill.id, detail: `requires unknown skill "${reqId}".` })
      }
    }
    for (const strId of skill.strengthens) {
      if (!byId.has(strId)) {
        issues.push({ kind: 'dangling-strengthen', skillId: skill.id, detail: `strengthens unknown skill "${strId}".` })
      }
    }

    // Tier ordering — a prerequisite must not sit at a higher tier than the
    // skill it unlocks. (Same-tier prerequisites are allowed by design.)
    for (const reqId of skill.requires) {
      const req = byId.get(reqId)
      if (req && req.tier > skill.tier) {
        issues.push({
          kind: 'tier-order',
          skillId: skill.id,
          detail: `requires "${reqId}" (tier ${req.tier}), a higher tier than this skill (tier ${skill.tier}).`,
        })
      }
    }

    // Age-range sanity.
    const { start, end } = skill.typical_age_months
    if (start > end) {
      issues.push({ kind: 'age-range', skillId: skill.id, detail: `typical_age_months.start (${start}) is after end (${end}).` })
    }
    if (start < 0 || end < 0) {
      issues.push({ kind: 'age-range', skillId: skill.id, detail: `typical_age_months has a negative bound (${start}–${end}).` })
    }
  }

  // Cycle detection over the requires[] graph (DFS with recursion-stack colouring).
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color = new Map<string, number>()
  const reported = new Set<string>()

  const visit = (id: string, stack: string[]): void => {
    color.set(id, GRAY)
    stack.push(id)

    const skill = byId.get(id)
    if (skill) {
      for (const reqId of skill.requires) {
        if (!byId.has(reqId)) continue // dangling edge already reported above
        const c = color.get(reqId) ?? WHITE
        if (c === GRAY) {
          // Back-edge → cycle. Report each distinct cycle once.
          const path = stack.slice(stack.indexOf(reqId)).concat(reqId)
          const key = [...path].sort().join(',')
          if (!reported.has(key)) {
            reported.add(key)
            issues.push({ kind: 'cycle', skillId: reqId, detail: `requires[] cycle: ${path.join(' → ')}.` })
          }
        } else if (c === WHITE) {
          visit(reqId, stack)
        }
      }
    }

    stack.pop()
    color.set(id, BLACK)
  }

  for (const skill of skills) {
    if ((color.get(skill.id) ?? WHITE) === WHITE) {
      visit(skill.id, [])
    }
  }

  return issues
}
