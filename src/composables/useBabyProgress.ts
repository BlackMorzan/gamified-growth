import { computed, type ComputedRef } from 'vue'
import { skills, type SkillDomain } from '@/data/skills'
import { useProfileStore } from '@/stores/profile'

export interface DomainProgress {
  domain: SkillDomain
  label: string
  acquired: number
  total: number
  pct: number
}

const DOMAIN_LABELS: Record<SkillDomain, string> = {
  physical_motor: 'Physical',
  cognitive: 'Cognitive',
  language_communication: 'Language',
  social_emotional: 'Social',
}

const DOMAIN_ORDER: SkillDomain[] = [
  'physical_motor',
  'cognitive',
  'language_communication',
  'social_emotional',
]

const totalsByDomain = Object.fromEntries(
  DOMAIN_ORDER.map((domain) => [domain, skills.filter((s) => s.domain === domain).length]),
) as Record<SkillDomain, number>

export function useBabyProgress(babyId: string): { progress: ComputedRef<DomainProgress[]> } {
  const profileStore = useProfileStore()

  const progress = computed<DomainProgress[]>(() => {
    const acquiredForBaby = new Set(
      profileStore.acquired.filter((a) => a.babyId === babyId).map((a) => a.skillId),
    )

    return DOMAIN_ORDER.map((domain) => {
      const total = totalsByDomain[domain]
      const acquired = skills.filter((s) => s.domain === domain && acquiredForBaby.has(s.id)).length
      return {
        domain,
        label: DOMAIN_LABELS[domain],
        acquired,
        total,
        pct: Math.floor((acquired / total) * 100),
      }
    })
  })

  return { progress }
}
