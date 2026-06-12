import { describe, it, expect } from 'vitest'
import { skills, skillById, type Skill } from '../skills'
import { validateSkills } from '@/lib/validateSkills'

describe('skill graph integrity', () => {
  it('has no structural issues', () => {
    // toEqual([]) prints the offending issues on failure, so it stays actionable.
    expect(validateSkills(skills)).toEqual([])
  })

  it('skillById indexes every skill exactly once', () => {
    expect(skillById.size).toBe(skills.length)
  })
})

describe('validateSkills (self-check — proves the validator is not a no-op)', () => {
  const base = (id: string, tier: number): Skill => ({
    id,
    name: id,
    domain: 'cognitive',
    category: 'memory',
    tier,
    requires: [],
    strengthens: [],
    milestone: false,
    evidence: ['x'],
    typical_age_months: { start: 0, end: 1 },
  })

  it('catches dangling, cycle, duplicate, self-reference, tier-order and age-range', () => {
    const broken: Skill[] = [
      { ...base('A', 1), requires: ['ZZZ'] },              // dangling-require
      { ...base('B', 2), requires: ['C'] },                // \_ cycle B ↔ C
      { ...base('C', 2), requires: ['B'] },                // /
      { ...base('A', 1) },                                 // duplicate id "A"
      { ...base('D', 1), strengthens: ['D'] },             // self-reference
      { ...base('E', 1), requires: ['F'] },                // tier-order (needs higher tier)
      { ...base('F', 5) },
      { ...base('G', 1), typical_age_months: { start: 9, end: 2 } }, // age-range
    ]

    const kinds = new Set(validateSkills(broken).map((i) => i.kind))
    expect(kinds).toContain('dangling-require')
    expect(kinds).toContain('cycle')
    expect(kinds).toContain('duplicate-id')
    expect(kinds).toContain('self-reference')
    expect(kinds).toContain('tier-order')
    expect(kinds).toContain('age-range')
  })

  it('returns [] for a clean minimal graph', () => {
    const clean: Skill[] = [base('A', 1), { ...base('B', 2), requires: ['A'] }]
    expect(validateSkills(clean)).toEqual([])
  })
})
