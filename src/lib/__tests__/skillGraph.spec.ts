import { describe, it, expect } from 'vitest'
import { skills, skillById, type Skill } from '@/data/skills'
import { buildSkillGraph, getUnlocks, getRequirements, unlocksById } from '@/lib/skillGraph'

describe('skillGraph — real data', () => {
  it('inverts a known edge: PM001 unlocks PM005 and PM007', () => {
    // PM005 (Rolling Over) and PM007 (Supported Sitting) both require PM001.
    const ids = getUnlocks('PM001').map((s) => s.id)
    expect(ids).toEqual(expect.arrayContaining(['PM005', 'PM007']))
  })

  it('resolves requirements back to full Skill objects, in authored order', () => {
    // PM008 (Grasping Objects) requires ['PM006', 'PM003'].
    expect(getRequirements('PM008').map((s) => s.id)).toEqual(['PM006', 'PM003'])
  })

  it('captures cross-domain edges (LC007 requires SE003 → SE003 unlocks LC007)', () => {
    expect(getUnlocks('SE003').map((s) => s.id)).toContain('LC007')
  })

  it('indexes every skill, including leaves that unlock nothing', () => {
    expect(unlocksById.size).toBe(skills.length)
    // PM024 (Self-Feeding with Utensils) is a leaf — nothing requires it.
    expect(getUnlocks('PM024')).toEqual([])
  })

  it('is a perfect inverse of requires[]: every edge appears in both directions', () => {
    for (const skill of skills) {
      for (const reqId of skill.requires) {
        expect(getUnlocks(reqId).map((s) => s.id)).toContain(skill.id)
      }
    }
  })

  it('only ever returns real Skill objects from the dataset', () => {
    for (const skill of skills) {
      for (const unlocked of getUnlocks(skill.id)) {
        expect(skillById.get(unlocked.id)).toBe(unlocked)
      }
    }
  })

  it('returns [] for an unknown id rather than throwing', () => {
    expect(getUnlocks('NOPE')).toEqual([])
    expect(getRequirements('NOPE')).toEqual([])
  })
})

describe('buildSkillGraph — injected fixtures', () => {
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

  it('inverts a small two-skill chain', () => {
    const graph = buildSkillGraph([base('A', 1), { ...base('B', 2), requires: ['A'] }])
    expect(graph.getUnlocks('A').map((s) => s.id)).toEqual(['B'])
    expect(graph.getUnlocks('B')).toEqual([]) // leaf
    expect(graph.getRequirements('B').map((s) => s.id)).toEqual(['A'])
  })

  it('handles a fan-out: one prerequisite unlocking several skills', () => {
    const graph = buildSkillGraph([
      base('A', 1),
      { ...base('B', 2), requires: ['A'] },
      { ...base('C', 2), requires: ['A'] },
    ])
    expect(graph.getUnlocks('A').map((s) => s.id)).toEqual(['B', 'C'])
  })

  it('ignores dangling requires[] without throwing (validateSkills owns that error)', () => {
    const graph = buildSkillGraph([{ ...base('A', 1), requires: ['GHOST'] }])
    expect(graph.getRequirements('A')).toEqual([]) // GHOST dropped, not resolved
    expect(graph.getUnlocks('GHOST')).toEqual([]) // unknown id → empty
  })
})
