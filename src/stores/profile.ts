import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BabyProfile, AcquiredSkill, PersistedUserData } from '@/types/user'

const STORAGE_KEY = 'ggg-data'

function defaultData(): PersistedUserData {
  return { version: 1, profile: null, acquired: [], prevSessionAvailableIds: [] }
}

function loadFromStorage(): PersistedUserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as Partial<PersistedUserData>
    if (parsed.version !== 1) return defaultData()
    return {
      version: 1,
      profile: parsed.profile ?? null,
      acquired: Array.isArray(parsed.acquired) ? parsed.acquired : [],
      prevSessionAvailableIds: Array.isArray(parsed.prevSessionAvailableIds)
        ? parsed.prevSessionAvailableIds
        : [],
    }
  } catch {
    return defaultData()
  }
}

export const useProfileStore = defineStore('profile', () => {
  const initial = loadFromStorage()

  const profile = ref<BabyProfile | null>(initial.profile)
  const acquired = ref<AcquiredSkill[]>(initial.acquired)
  const prevSessionAvailableIds = ref<string[]>(initial.prevSessionAvailableIds)

  function _save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        profile: profile.value,
        acquired: acquired.value,
        prevSessionAvailableIds: prevSessionAvailableIds.value,
      } satisfies PersistedUserData),
    )
  }

  function acquire(skillId: string, date: string): void {
    if (acquired.value.some((a) => a.skillId === skillId)) return
    acquired.value.push({ skillId, acquiredDate: date })
    _save()
  }

  function unacquire(skillId: string): void {
    acquired.value = acquired.value.filter((a) => a.skillId !== skillId)
    _save()
  }

  function saveSessionSnapshot(availableIds: string[]): void {
    prevSessionAvailableIds.value = availableIds
    _save()
  }

  return { profile, acquired, prevSessionAvailableIds, acquire, unacquire, saveSessionSnapshot }
})
