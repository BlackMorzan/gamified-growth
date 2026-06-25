<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { BabyProfile } from '@/types/user'
import type { DomainProgress } from '@/composables/useBabyProgress'
import { formatAge } from '@/utils/age'

const props = defineProps<{
  baby: BabyProfile
  progress: DomainProgress[]
  index: number
}>()

const router = useRouter()
const mounted = ref(false)
onMounted(() => { requestAnimationFrame(() => { mounted.value = true }) })

function goToTree(domain?: string) {
  router.push({ name: 'skill-tree', params: { babyName: props.baby.name }, query: domain ? { domain } : {} })
}

const DOMAIN_COLOR: Record<string, string> = {
  physical_motor: 'var(--color-domain-physical)',
  cognitive: 'var(--color-domain-cognitive)',
  language_communication: 'var(--color-domain-language)',
  social_emotional: 'var(--color-domain-social)',
}
</script>

<template>
  <div
    class="baby-card"
    role="link"
    tabindex="0"
    :style="{ animationDelay: `${props.index * 60}ms` }"
    @click="goToTree()"
    @keydown.enter.prevent="goToTree()"
  >
    <div class="baby-card__header">
      <span class="baby-card__name">{{ baby.name }}</span>
      <span class="baby-card__age">{{ formatAge(baby.birthDate) }}</span>
    </div>

    <div class="baby-card__grid">
      <button
        v-for="d in progress"
        :key="d.domain"
        class="domain-btn"
        :style="{ '--domain-color': DOMAIN_COLOR[d.domain] }"
        :aria-label="`${d.label}: ${d.acquired} of ${d.total} skills`"
        @click.stop="goToTree(d.domain)"
      >
        <div
          class="domain-btn__fill"
          :style="{ width: mounted ? d.pct + '%' : '0%' }"
        />
        <span class="domain-btn__label">{{ d.label }}</span>
        <span class="domain-btn__count">{{ d.acquired }}/{{ d.total }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.baby-card {
  display: block;
  background: linear-gradient(180deg, var(--color-surface), #131b35);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  cursor: pointer;
  box-shadow: var(--elev-2), var(--bevel);
  transition: border-color 0.2s, box-shadow 0.2s;
  animation: card-enter 0.35s ease both;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.baby-card:hover,
.baby-card:focus-visible {
  border-color: var(--color-accent);
  box-shadow: var(--elev-3), var(--bevel), 0 0 26px -4px rgba(6, 182, 212, 0.35);
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.18) 100%),
    var(--color-surface-deep);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-3);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.5), var(--bevel);
  cursor: pointer;
  font-family: var(--font-body);
  transition: border-color 0.15s;
}

.domain-btn:hover {
  border-color: rgba(255, 255, 255, 0.22);
}

.domain-btn__fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(0, 0, 0, 0.15) 100%),
    var(--domain-color);
  opacity: 0.32;
  transition: width 0.6s ease;
}

/* TODO (optional): pulse animation for domain button on acquire */
/* @keyframes domain-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.04); border-color: var(--color-accent); }
  100% { transform: scale(1); }
} */

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
