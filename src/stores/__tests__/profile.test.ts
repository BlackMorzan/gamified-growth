import { describe, test, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProfileStore } from '../profile'

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
})

function storedData() {
  return JSON.parse(localStorageMock.getItem('ggg-data')!)
}

// ---------------------------------------------------------------------------
// addBaby
// ---------------------------------------------------------------------------

describe('addBaby', () => {
  test('adds a baby and returns its id', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')
    expect(id).not.toBeNull()
    expect(profile.babies).toEqual([{ id, name: 'Olivia', birthDate: '2024-01-01' }])
  })

  test('persists to localStorage', () => {
    const profile = useProfileStore()
    profile.addBaby('Olivia', '2024-01-01')
    expect(storedData().babies).toHaveLength(1)
  })

  test('returns null and does not add when the name already exists', () => {
    const profile = useProfileStore()
    profile.addBaby('Olivia', '2024-01-01')
    const secondId = profile.addBaby('Olivia', '2024-06-01')
    expect(secondId).toBeNull()
    expect(profile.babies).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// updateBaby
// ---------------------------------------------------------------------------

describe('updateBaby', () => {
  test('updates name and birthDate for a matching id', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    const ok = profile.updateBaby(id, 'Liv', '2024-02-01')
    expect(ok).toBe(true)
    expect(profile.babies[0]).toEqual({ id, name: 'Liv', birthDate: '2024-02-01' })
  })

  test('returns false when the id does not exist', () => {
    const profile = useProfileStore()
    expect(profile.updateBaby('missing', 'Liv', '2024-02-01')).toBe(false)
  })

  test('returns false when renaming to another baby\'s name (case/whitespace-insensitive)', () => {
    const profile = useProfileStore()
    profile.addBaby('Olivia', '2024-01-01')
    const id = profile.addBaby('Mason', '2024-02-01')!
    expect(profile.updateBaby(id, '  olivia  ', '2024-02-01')).toBe(false)
    expect(profile.babies.find((b) => b.id === id)?.name).toBe('Mason')
  })
})

// ---------------------------------------------------------------------------
// moveToTop
// ---------------------------------------------------------------------------

describe('moveToTop', () => {
  test('promotes a baby from the middle to index 0', () => {
    const profile = useProfileStore()
    const a = profile.addBaby('A', '2024-01-01')!
    const b = profile.addBaby('B', '2024-01-01')!
    const c = profile.addBaby('C', '2024-01-01')!
    profile.moveToTop(b)
    expect(profile.babies.map((baby) => baby.id)).toEqual([b, a, c])
  })

  test('persists the new order to localStorage', () => {
    const profile = useProfileStore()
    const a = profile.addBaby('A', '2024-01-01')!
    const b = profile.addBaby('B', '2024-01-01')!
    profile.moveToTop(b)
    expect(storedData().babies.map((baby: { id: string }) => baby.id)).toEqual([b, a])
  })

  test('is a no-op when the baby is already first', () => {
    const profile = useProfileStore()
    const a = profile.addBaby('A', '2024-01-01')!
    const b = profile.addBaby('B', '2024-01-01')!
    profile.moveToTop(a)
    expect(profile.babies.map((baby) => baby.id)).toEqual([a, b])
  })

  test('is a no-op when the id does not exist', () => {
    const profile = useProfileStore()
    const a = profile.addBaby('A', '2024-01-01')!
    const b = profile.addBaby('B', '2024-01-01')!
    profile.moveToTop('missing')
    expect(profile.babies.map((baby) => baby.id)).toEqual([a, b])
  })
})

// ---------------------------------------------------------------------------
// deleteBaby
// ---------------------------------------------------------------------------

describe('deleteBaby', () => {
  test('removes the baby and their acquired skills and session snapshot', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    profile.setActiveBaby(id)
    profile.acquire('SKILL_A', '2024-01-05')
    profile.saveSessionSnapshot(['SKILL_A'])

    profile.deleteBaby(id)

    expect(profile.babies).toHaveLength(0)
    expect(profile.acquired).toHaveLength(0)
    expect(profile.prevSessionAvailableIds[id]).toBeUndefined()
  })

  test('clears activeBabyId when the active baby is deleted', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    profile.setActiveBaby(id)
    profile.deleteBaby(id)
    expect(profile.activeBabyId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// acquire / unacquire / setAcquiredDate
// ---------------------------------------------------------------------------

describe('acquire / unacquire / setAcquiredDate', () => {
  test('acquire is scoped to the active baby and ignored without one', () => {
    const profile = useProfileStore()
    profile.acquire('SKILL_A', '2024-01-01')
    expect(profile.acquired).toHaveLength(0)
  })

  test('acquire is idempotent per baby+skill', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    profile.setActiveBaby(id)
    profile.acquire('SKILL_A', '2024-01-01')
    profile.acquire('SKILL_A', '2024-06-01')
    expect(profile.acquired).toHaveLength(1)
    expect(profile.acquired[0]?.acquiredDate).toBe('2024-01-01')
  })

  test('unacquire removes only the active baby\'s entry', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    profile.setActiveBaby(id)
    profile.acquire('SKILL_A', '2024-01-01')
    profile.unacquire('SKILL_A')
    expect(profile.acquired).toHaveLength(0)
  })

  test('setAcquiredDate updates the date for an existing entry', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    profile.setActiveBaby(id)
    profile.acquire('SKILL_A', '2024-01-01')
    profile.setAcquiredDate('SKILL_A', '2024-03-15')
    expect(profile.acquired[0]?.acquiredDate).toBe('2024-03-15')
  })
})

// ---------------------------------------------------------------------------
// saveSessionSnapshot
// ---------------------------------------------------------------------------

describe('saveSessionSnapshot', () => {
  test('stores the snapshot under the active baby id and persists it', () => {
    const profile = useProfileStore()
    const id = profile.addBaby('Olivia', '2024-01-01')!
    profile.setActiveBaby(id)
    profile.saveSessionSnapshot(['SKILL_A', 'SKILL_B'])
    expect(profile.prevSessionAvailableIds[id]).toEqual(['SKILL_A', 'SKILL_B'])
    expect(storedData().prevSessionAvailableIds[id]).toEqual(['SKILL_A', 'SKILL_B'])
  })

  test('is a no-op without an active baby', () => {
    const profile = useProfileStore()
    profile.saveSessionSnapshot(['SKILL_A'])
    expect(profile.prevSessionAvailableIds).toEqual({})
  })
})
