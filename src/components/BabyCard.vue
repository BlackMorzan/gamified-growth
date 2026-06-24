<script setup lang="ts">
import type { BabyProfile } from '@/types/user'
import type { DomainProgress } from '@/composables/useBabyProgress'
import { formatAge } from '@/utils/age'

defineProps<{
  baby: BabyProfile
  progress: DomainProgress[]
}>()

const DOMAIN_COLOR: Record<string, string> = {
  physical_motor: 'var(--color-domain-physical)',
  cognitive: 'var(--color-domain-cognitive)',
  language_communication: 'var(--color-domain-language)',
  social_emotional: 'var(--color-domain-social)',
}
</script>

<template>
  <RouterLink
    class="baby-card"
    :to="{ name: 'skill-tree', params: { babyName: baby.name } }"
  >
    <div class="baby-card__header">
      <span class="baby-card__name">{{ baby.name }}</span>
      <span class="baby-card__age">{{ formatAge(baby.birthDate) }}</span>
    </div>

    <div class="baby-card__grid">
      <div
        v-for="d in progress"
        :key="d.domain"
        class="domain-btn"
      >
        <div
          class="domain-btn__fill"
          :style="{ width: d.pct + '%', background: DOMAIN_COLOR[d.domain] }"
        />
        <span class="domain-btn__label">{{ d.label }}</span>
        <span class="domain-btn__count">{{ d.acquired }}/{{ d.total }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.baby-card {
  display: block;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.baby-card:hover,
.baby-card:focus-visible {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.25);
  outline: none;
}

.baby-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.baby-card__name {
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: 0.04em;
  color: var(--color-text);
}

.baby-card__age {
  font-size: 13px;
  color: var(--color-text-muted);
}

.baby-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.domain-btn {
  position: relative;
  height: 44px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-deep);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-3);
  transition: border-color 0.15s;
}

.domain-btn:hover {
  border-color: rgba(255, 255, 255, 0.22);
}

.domain-btn__fill {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  transition: width 0.3s ease;
}

.domain-btn__label {
  position: relative;
  z-index: 1;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text);
}

.domain-btn__count {
  position: relative;
  z-index: 1;
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
