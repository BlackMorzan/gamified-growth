import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BabyProfile, AcquiredSkill, PersistedUserData } from '@/types/user'

const STORAGE_KEY = 'ggg-data'

function defaultData(): PersistedUserData {
  return { version: 2, babies: [], acquired: [], prevSessionAvailableIds: {} }
}

function loadFromStorage(): PersistedUserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as Record<string, unknown>

    // Migrate v1 (single profile) → v2 (babies list)
    if (parsed.version === 1) {
      const v1Profile = parsed.profile as BabyProfile | null
      const v1Acquired = (parsed.acquired as { skillId: string; acquiredDate: string }[]) ?? []
      const v1Prev = (parsed.prevSessionAvailableIds as string[]) ?? []
      const babyName = v1Profile?.name ?? ''
      return {
        version: 2,
        babies: v1Profile ? [v1Profile] : [],
        acquired: v1Acquired.map((a) => ({ babyName, ...a })),
        prevSessionAvailableIds: babyName && v1Prev.length ? { [babyName]: v1Prev } : {},
      }
    }

    if (parsed.version !== 2) return defaultData()
    return {
      version: 2,
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
  const activeBabyName = ref<string | null>(null)

  function _save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        babies: babies.value,
        acquired: acquired.value,
        prevSessionAvailableIds: prevSessionAvailableIds.value,
      } satisfies PersistedUserData),
    )
  }

  function setActiveBaby(name: string): void {
    activeBabyName.value = name
  }

  /** Returns false if a baby with that name already exists. */
  function addBaby(name: string, birthDate: string): boolean {
    if (babies.value.some((b) => b.name === name)) return false
    babies.value.push({ name, birthDate })
    _save()
    return true
  }

  function acquire(skillId: string, date: string): void {
    const babyName = activeBabyName.value
    if (!babyName) return
    if (acquired.value.some((a) => a.skillId === skillId && a.babyName === babyName)) return
    acquired.value.push({ babyName, skillId, acquiredDate: date })
    _save()
  }

  function unacquire(skillId: string): void {
    const babyName = activeBabyName.value
    if (!babyName) return
    acquired.value = acquired.value.filter(
      (a) => !(a.skillId === skillId && a.babyName === babyName),
    )
    _save()
  }

  function setAcquiredDate(skillId: string, date: string): void {
    const babyName = activeBabyName.value
    if (!babyName) return
    const entry = acquired.value.find((a) => a.skillId === skillId && a.babyName === babyName)
    if (entry) entry.acquiredDate = date
    _save()
  }

  function saveSessionSnapshot(availableIds: string[]): void {
    const babyName = activeBabyName.value
    if (!babyName) return
    prevSessionAvailableIds.value = { ...prevSessionAvailableIds.value, [babyName]: availableIds }
    _save()
  }

  const ageInMonths = computed((): number => {
    const baby = babies.value.find((b) => b.name === activeBabyName.value)
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
    activeBabyName,
    ageInMonths,
    setActiveBaby,
    addBaby,
    acquire,
    unacquire,
    setAcquiredDate,
    saveSessionSnapshot,
  }
})
