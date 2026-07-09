import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BabyProfile, AcquiredSkill, PersistedUserData } from '@/types/user'
import { skills as allSkills } from '@/data/skills'

const STORAGE_KEY = 'ggg-data'

function defaultData(): PersistedUserData {
  return { version: 3, babies: [], acquired: [], prevSessionAvailableIds: {} }
}

function loadFromStorage(): PersistedUserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.version !== 3) return defaultData()
    return {
      version: 3,
      babies: Array.isArray(parsed.babies) ? (parsed.babies as BabyProfile[]) : [],
      acquired: Array.isArray(parsed.acquired) ? (parsed.acquired as AcquiredSkill[]) : [],
      prevSessionAvailableIds:
        parsed.prevSessionAvailableIds !== null &&
        typeof parsed.prevSessionAvailableIds === 'object' &&
        !Array.isArray(parsed.prevSessionAvailableIds)
          ? (parsed.prevSessionAvailableIds as Record<string, string[]>)
          : {},
    }
  } catch {
    return defaultData()
  }
}

export const useProfileStore = defineStore('profile', () => {
  const initial = loadFromStorage()

  const babies = ref<BabyProfile[]>(initial.babies)
  const acquired = ref<AcquiredSkill[]>(initial.acquired)
  const prevSessionAvailableIds = ref<Record<string, string[]>>(initial.prevSessionAvailableIds)
  const activeBabyId = ref<string | null>(null)

  function _save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 3,
        babies: babies.value,
        acquired: acquired.value,
        prevSessionAvailableIds: prevSessionAvailableIds.value,
      } satisfies PersistedUserData),
    )
  }

  const activeBaby = computed(() => babies.value.find((b) => b.id === activeBabyId.value) ?? null)

  function setActiveBaby(id: string): void {
    activeBabyId.value = id
  }

  /** Returns false if a baby with that name already exists. */
  function addBaby(name: string, birthDate: string): boolean {
    if (babies.value.some((b) => b.name === name)) return false
    babies.value.push({ id: crypto.randomUUID(), name, birthDate })
    _save()
    return true
  }

  function acquire(skillId: string, date: string): void {
    const babyId = activeBabyId.value
    if (!babyId) return
    if (acquired.value.some((a) => a.skillId === skillId && a.babyId === babyId)) return
    acquired.value.push({ babyId, skillId, acquiredDate: date })
    _save()
  }

  function unacquire(skillId: string): void {
    const babyId = activeBabyId.value
    if (!babyId) return
    acquired.value = acquired.value.filter(
      (a) => !(a.skillId === skillId && a.babyId === babyId),
    )
    _save()
  }

  function setAcquiredDate(skillId: string, date: string): void {
    const babyId = activeBabyId.value
    if (!babyId) return
    const entry = acquired.value.find((a) => a.skillId === skillId && a.babyId === babyId)
    if (entry) entry.acquiredDate = date
    _save()
  }

  /** Returns false if another baby with that name already exists (case/whitespace-insensitive, excludes self). */
  function updateBaby(id: string, name: string, birthDate: string): boolean {
    const baby = babies.value.find((b) => b.id === id)
    if (!baby) return false
    const trimmed = name.trim()
    if (babies.value.some((b) => b.id !== id && b.name.trim().toLowerCase() === trimmed.toLowerCase())) return false
    baby.name = trimmed
    baby.birthDate = birthDate
    _save()
    return true
  }

  function deleteBaby(id: string): void {
    babies.value = babies.value.filter((b) => b.id !== id)
    acquired.value = acquired.value.filter((a) => a.babyId !== id)
    const snap = { ...prevSessionAvailableIds.value }
    delete snap[id]
    prevSessionAvailableIds.value = snap
    if (activeBabyId.value === id) activeBabyId.value = null
    _save()
  }

  function saveSessionSnapshot(availableIds: string[]): void {
    const babyId = activeBabyId.value
    if (!babyId) return
    prevSessionAvailableIds.value = { ...prevSessionAvailableIds.value, [babyId]: availableIds }
    _save()
  }

  /** Returns a JSON string of the baby's export envelope, or null if baby not found. */
  function exportBaby(name: string): string | null {
    const baby = babies.value.find((b) => b.name === name)
    if (!baby) return null
    const skills = acquired.value
      .filter((a) => a.babyId === baby.id)
      .map((a) => ({ skillId: a.skillId, acquiredDate: a.acquiredDate }))
    return JSON.stringify(
      { version: 1, baby: { name: baby.name, birthDate: baby.birthDate }, skills },
      null,
      2,
    )
  }

  /** Import result type. */
  type ImportResult = { ok: true } | { ok: false; error: string }

  /**
   * Validates and imports an export envelope. Baby is looked up by name from the file;
   * created automatically if not found. Full overwrite — no merge.
   * Unknown skillIds are skipped with console.warn. Returns `{ ok: true }` on success.
   */
  function importBaby(raw: unknown): ImportResult {
    // Structural validation
    if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'Invalid JSON structure.' }
    const d = raw as Record<string, unknown>
    if (d.version !== 1) return { ok: false, error: `Unsupported export version: ${d.version}.` }
    if (typeof d.baby !== 'object' || d.baby === null) return { ok: false, error: 'Missing baby field.' }
    const b = d.baby as Record<string, unknown>
    if (typeof b.name !== 'string' || !b.name) return { ok: false, error: 'Missing baby name.' }
    if (typeof b.birthDate !== 'string' || !b.birthDate) return { ok: false, error: 'Missing baby birthDate.' }
    if (!Array.isArray(d.skills)) return { ok: false, error: 'Missing skills array.' }

    // Find baby in store by name from the file
    const baby = babies.value.find(
      (x) => x.name.trim().toLowerCase() === (b.name as string).trim().toLowerCase(),
    )
    const resolvedBaby = baby ?? (() => {
      const created: BabyProfile = { id: crypto.randomUUID(), name: b.name as string, birthDate: b.birthDate as string }
      babies.value.push(created)
      return created
    })()

    const validSkillIds = new Set(allSkills.map((s) => s.id))

    const newAcquired: AcquiredSkill[] = []
    for (const entry of d.skills as unknown[]) {
      if (typeof entry !== 'object' || entry === null) {
        return { ok: false, error: 'Malformed skills entry.' }
      }
      const e = entry as Record<string, unknown>
      if (typeof e.skillId !== 'string' || !e.skillId) {
        return { ok: false, error: 'Malformed skills entry: missing skillId.' }
      }
      if (typeof e.acquiredDate !== 'string' || !e.acquiredDate) {
        return { ok: false, error: 'Malformed skills entry: missing acquiredDate.' }
      }
      if (!validSkillIds.has(e.skillId)) {
        console.warn(`[import] Unknown skillId "${e.skillId}" — skipped.`)
        continue
      }
      newAcquired.push({ babyId: resolvedBaby.id, skillId: e.skillId, acquiredDate: e.acquiredDate })
    }

    // Update birthDate and overwrite acquired skills for this baby
    resolvedBaby.birthDate = b.birthDate as string
    acquired.value = [
      ...acquired.value.filter((a) => a.babyId !== resolvedBaby.id),
      ...newAcquired,
    ]
    _save()
    return { ok: true }
  }

  const ageInMonths = computed((): number => {
    const baby = activeBaby.value
    if (!baby) return 0
    const birth = new Date(baby.birthDate)
    const now = new Date()
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return Math.max(0, months)
  })

  return {
    babies,
    acquired,
    prevSessionAvailableIds,
    activeBabyId,
    activeBaby,
    ageInMonths,
    setActiveBaby,
    addBaby,
    acquire,
    unacquire,
    setAcquiredDate,
    updateBaby,
    deleteBaby,
    saveSessionSnapshot,
    exportBaby,
    importBaby,
  }
})
