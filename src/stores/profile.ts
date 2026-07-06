import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BabyProfile, AcquiredSkill, PersistedUserData } from '@/types/user'

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
    saveSessionSnapshot,
    exportBaby,
  }
})
