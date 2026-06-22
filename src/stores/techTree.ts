import { computed } from 'vue'
import { defineStore } from 'pinia'
import { skills, skillById, type Skill } from '@/data/skills'
import { useProfileStore } from './profile'

export const useTechTreeStore = defineStore('techTree', () => {
  const profileStore = useProfileStore()

  const acquiredIds = computed(() => new Set(profileStore.acquired.map((a) => a.skillId)))

  function progressOf(skill: Skill): 'locked' | 'available' | 'acquired' {
    if (acquiredIds.value.has(skill.id)) return 'acquired'
    const met = skill.requires.every((id) => acquiredIds.value.has(id))
    return met ? 'available' : 'locked'
  }

  function acquiredDateOf(skill: Skill): string | undefined {
    return profileStore.acquired.find((a) => a.skillId === skill.id)?.acquiredDate
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
          fromProgress: fromProg === 'acquired'
            ? (progressOf(skill) === 'acquired' ? 'acquired' : 'available')
            : 'locked',
        }
      }),
    ),
  )

  const newlyAvailableIds = computed(() => {
    const prev = new Set(profileStore.prevSessionAvailableIds)
    return new Set(
      skills.filter((s) => progressOf(s) === 'available' && !prev.has(s.id)).map((s) => s.id),
    )
  })

  const currentAvailableIds = computed(() =>
    skills.filter((s) => progressOf(s) === 'available').map((s) => s.id),
  )

  return { acquiredIds, progressOf, acquiredDateOf, edges, newlyAvailableIds, currentAvailableIds }
})
