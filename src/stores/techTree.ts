import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { skills, skillById, type Skill } from '@/data/skills'
import { useProfileStore } from './profile'

export const useTechTreeStore = defineStore('techTree', () => {
  const profileStore = useProfileStore()

  const acquiredIds = computed(() => {
    const babyName = profileStore.activeBabyName
    if (!babyName) return new Set<string>()
    return new Set(
      profileStore.acquired.filter((a) => a.babyName === babyName).map((a) => a.skillId),
    )
  })

  function progressOf(skill: Skill): 'locked' | 'available' | 'acquired' {
    if (acquiredIds.value.has(skill.id)) return 'acquired'
    const met = skill.requires.every((id) => acquiredIds.value.has(id))
    return met ? 'available' : 'locked'
  }

  function acquiredDateOf(skill: Skill): string | undefined {
    const babyName = profileStore.activeBabyName
    if (!babyName) return undefined
    return profileStore.acquired.find((a) => a.skillId === skill.id && a.babyName === babyName)
      ?.acquiredDate
  }

  const edges = computed(() =>
    skills.flatMap((skill) =>
      skill.requires.map((prereqId) => {
        const fromSkill = skillById.get(prereqId)!
        const fromProg = progressOf(fromSkill)
        return {
          id: `${prereqId}->${skill.id}`,
          from: fromSkill,
          to: skill,
          fromProgress: (() => {
            if (fromProg !== 'acquired') return 'locked'
            const toP = progressOf(skill)
            return toP === 'locked' ? 'partial-available' : toP
          })(),
        }
      }),
    ),
  )

  const newlyAvailableIds = computed(() => {
    const babyName = profileStore.activeBabyName
    const prev = new Set(babyName ? (profileStore.prevSessionAvailableIds[babyName] ?? []) : [])
    return new Set(
      skills.filter((s) => progressOf(s) === 'available' && !prev.has(s.id)).map((s) => s.id),
    )
  })

  const currentAvailableIds = computed(() =>
    skills.filter((s) => progressOf(s) === 'available').map((s) => s.id),
  )

  const earningIds = ref(new Set<string>())

  function markEarning(id: string) {
    earningIds.value = new Set([...earningIds.value, id])
    setTimeout(() => {
      const next = new Set(earningIds.value)
      next.delete(id)
      earningIds.value = next
    }, 750)
  }

  return { acquiredIds, progressOf, acquiredDateOf, edges, newlyAvailableIds, currentAvailableIds, earningIds, markEarning }
})
