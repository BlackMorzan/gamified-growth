import { describe, test, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { skills, type Skill } from '@/data/skills'
import { useProfileStore } from '../profile'
import { useTechTreeStore } from '../techTree'

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const _lsStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => _lsStore[key] ?? null,
  setItem: (key: string, value: string) => {
    _lsStore[key] = value
  },
  removeItem: (key: string) => {
    delete _lsStore[key]
  },
  clear: () => {
    for (const k of Object.keys(_lsStore)) delete _lsStore[k]
  },
  length: 0,
  key: () => null,
}

beforeEach(() => {
  localStorageMock.clear()
  vi.stubGlobal('localStorage', localStorageMock)
  setActivePinia(createPinia())
  useProfileStore().setActiveBaby('test-baby')
})

// ---------------------------------------------------------------------------
// Skill fixture builder — avoids repeating every required field
// ---------------------------------------------------------------------------

function makeSkill(partial: Pick<Skill, 'id' | 'requires'> & Partial<Skill>): Skill {
  return {
    name: partial.id,
    domain: 'physical_motor',
    category: 'gross_motor',
    tier: 1,
    row: 1,
    strengthens: [],
    milestone: false,
    evidence: [],
    typical_age_months: { start: 0, end: 6 },
    ...partial,
  }
}

// ---------------------------------------------------------------------------
// progressOf
// ---------------------------------------------------------------------------

describe('progressOf', () => {
  test('locked when prerequisites are not acquired', () => {
    const techTree = useTechTreeStore()
    const skill = makeSkill({ id: 'b', requires: ['a'] })
    expect(techTree.progressOf(skill)).toBe('locked')
  })

  test('available when all prerequisites are acquired', () => {
    const profile = useProfileStore()
    const techTree = useTechTreeStore()
    profile.acquire('a', '2024-01-01')
    const skill = makeSkill({ id: 'b', requires: ['a'] })
    expect(techTree.progressOf(skill)).toBe('available')
  })

  test('available when there are no prerequisites', () => {
    const techTree = useTechTreeStore()
    const skill = makeSkill({ id: 'root', requires: [] })
    expect(techTree.progressOf(skill)).toBe('available')
  })

  test('acquired when the skill itself is in the acquired set', () => {
    const profile = useProfileStore()
    const techTree = useTechTreeStore()
    profile.acquire('b', '2024-01-01')
    // prerequisites not met, but acquired wins
    const skill = makeSkill({ id: 'b', requires: ['a'] })
    expect(techTree.progressOf(skill)).toBe('acquired')
  })

  test('locked when only some prerequisites are acquired', () => {
    const profile = useProfileStore()
    const techTree = useTechTreeStore()
    profile.acquire('a', '2024-01-01')
    // 'b' still missing
    const skill = makeSkill({ id: 'c', requires: ['a', 'b'] })
    expect(techTree.progressOf(skill)).toBe('locked')
  })
})

// ---------------------------------------------------------------------------
// edges
// ---------------------------------------------------------------------------

describe('edges', () => {
  test('every edge.from.id is present in edge.to.requires[]', () => {
    const techTree = useTechTreeStore()
    for (const edge of techTree.edges) {
      expect(edge.to.requires).toContain(edge.from.id)
    }
  })

  test('edge count equals total requires[] entries across all skills', () => {
    const techTree = useTechTreeStore()
    const totalRequires = skills.reduce((n, s) => n + s.requires.length, 0)
    expect(techTree.edges.length).toBe(totalRequires)
  })

  test('no edge is derived from strengthens[]', () => {
    const techTree = useTechTreeStore()
    // For every skill that has strengthens[] entries, none of those ids should
    // appear as an edge.from.id paired with that skill as edge.to.
    for (const skill of skills) {
      for (const strengthensId of skill.strengthens) {
        const spurious = techTree.edges.find(
          (e) => e.from.id === strengthensId && e.to.id === skill.id,
        )
        // Only flag it if the id is NOT also in requires[] (cross-check)
        if (!skill.requires.includes(strengthensId)) {
          expect(spurious).toBeUndefined()
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// newlyAvailableIds
// ---------------------------------------------------------------------------

describe('newlyAvailableIds', () => {
  test('non-empty on a fresh session (root skills are available and not in empty prev snapshot)', () => {
    const techTree = useTechTreeStore()
    expect(techTree.newlyAvailableIds.size).toBeGreaterThan(0)
  })

  test('empty after saving a snapshot of the current available set', () => {
    const profile = useProfileStore()
    const techTree = useTechTreeStore()
    profile.saveSessionSnapshot([...techTree.newlyAvailableIds])
    expect(techTree.newlyAvailableIds.size).toBe(0)
  })

  test('newly-unlocked skills appear after their prerequisites are acquired', () => {
    const profile = useProfileStore()
    const techTree = useTechTreeStore()

    // Snapshot current state so we start from a clean "new" baseline
    profile.saveSessionSnapshot([...techTree.newlyAvailableIds])
    expect(techTree.newlyAvailableIds.size).toBe(0)

    // Find a skill whose requires[] are all currently available (no deeper deps)
    const availableNow = new Set(
      skills.filter((s) => techTree.progressOf(s) === 'available').map((s) => s.id),
    )
    const target = skills.find(
      (s) => s.requires.length > 0 && s.requires.every((r) => availableNow.has(r)),
    )!

    for (const reqId of target.requires) {
      profile.acquire(reqId, '2024-01-01')
    }

    expect(techTree.newlyAvailableIds.has(target.id)).toBe(true)
  })

  test('skills already in prevSession snapshot are not flagged as new', () => {
    const profile = useProfileStore()
    const techTree = useTechTreeStore()

    const currentAvailable = [...techTree.newlyAvailableIds]
    profile.saveSessionSnapshot(currentAvailable)

    // None of the skills that were available last session should be "new"
    for (const id of currentAvailable) {
      expect(techTree.newlyAvailableIds.has(id)).toBe(false)
    }
  })
})
