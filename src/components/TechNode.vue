<script setup lang="ts">
import { computed } from 'vue'
import type { Skill } from '@/data/skills'
import { useTechTreeStore } from '@/stores/techTree'
import { useSplitName } from '@/composables/useSplitName'

const props = defineProps<{ skill: Skill }>()
const emit = defineEmits<{ select: [skill: Skill] }>()

const store = useTechTreeStore()

function open() {
  emit('select', props.skill)
}

const progress = computed(() => store.progressOf(props.skill))
const acquiredDate = computed(() => store.acquiredDateOf(props.skill))
const isNew = computed(() => store.newlyAvailableIds.has(props.skill.id))

const cardClass = computed(() => {
  if (props.skill.milestone && progress.value === 'acquired') return 'tech-node tech-node--acquired-milestone'
  if (props.skill.milestone) return 'tech-node tech-node--milestone'
  return `tech-node tech-node--${progress.value}`
})

const icon = computed(() => {
  if (progress.value === 'locked') return '🔒'
  if (props.skill.milestone) return '★'
  if (progress.value === 'acquired') return '✓'
  return '◎'
})

const ageLine = computed(() => {
  const { start, end } = props.skill.typical_age_months
  return `${start}–${end}m`
})

const splitName = computed(() => useSplitName(props.skill.name))
</script>

<template>
  <div
    :class="cardClass"
    role="button"
    tabindex="0"
    :aria-label="skill.name"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
  >
    <span v-if="isNew" class="tech-node__badge">New</span>
    <div class="tech-node__top">
      <div class="tech-node__icon" aria-hidden="true">{{ icon }}</div>
      <div class="tech-node__name">
        <span>{{ splitName.line1 }}</span>
        <span v-if="splitName.line2">{{ splitName.line2 }}</span>
      </div>
    </div>
    <div class="tech-node__sub">
      <template v-if="progress === 'acquired' && acquiredDate">{{ acquiredDate }}</template>
      <template v-else>{{ ageLine }}</template>
    </div>
  </div>
</template>

<style scoped>
.tech-node {
  position: absolute;
  width: 140px;
  height: 72px;
  padding: var(--space-2) var(--space-1) var(--space-2) var(--space-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--elev-1), var(--bevel);
  transition:
    background 0.2s ease,
    box-shadow 0.3s ease,
    transform 0.15s cubic-bezier(.2,.7,.3,1),
    opacity 0.2s ease,
    border-color 0.2s ease;
}

.tech-node:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.tech-node__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--color-accent);
  color: #fff;
  padding: 1px 4px;
  border-radius: 3px;
}

.tech-node__top {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.tech-node__icon {
  font-size: 13px;
  line-height: 1.3;
  flex-shrink: 0;
}

.tech-node__name {
  display: flex;
  flex-direction: column;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--color-text);
  line-height: 1.3;
  min-width: 0;
}

.tech-node__name span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tech-node__sub {
  font-size: 10px;
  color: var(--color-text-muted);
}

/* locked — recedes via opacity + lowest elevation only; no filter/transform avoids GPU layer */
.tech-node--locked {
  background: var(--color-skill-locked);
  opacity: 0.5;
  box-shadow: var(--elev-1);
}
.tech-node--locked .tech-node__name,
.tech-node--locked .tech-node__icon {
  color: var(--color-text-locked);
}

/* available — forward, bright, lifted via shadow + glow, breathing */
.tech-node--available {
  background: linear-gradient(180deg, var(--color-skill-available), #0c1a2d);
  border-color: var(--color-accent);
  box-shadow: var(--elev-2), var(--bevel), 0 0 26px -4px rgba(6, 182, 212, 0.55);
  animation: breathe 2.8s ease-in-out infinite;
}
.tech-node--available:focus-visible {
  background: linear-gradient(180deg, var(--color-skill-available-hover), #0c1a2d);
  box-shadow: var(--elev-2), var(--bevel), 0 0 26px -4px rgba(6, 182, 212, 0.55);
}
.tech-node--available .tech-node__icon {
  color: var(--color-accent);
}

/* acquired — settled, calm green light */
.tech-node--acquired {
  background: linear-gradient(180deg, var(--color-skill-acquired), #0b1f16);
  border-color: var(--color-skill-acquired-border);
  box-shadow: var(--elev-2), var(--bevel), 0 0 20px -7px rgba(66, 168, 115, 0.55);
}
.tech-node--acquired .tech-node__icon {
  color: var(--color-success-text);
}

/* milestone (available) — gold frame, elevated */
.tech-node--milestone {
  background: linear-gradient(180deg, var(--color-skill-milestone), #16130a);
  border-color: var(--color-accent-gold);
  box-shadow: var(--elev-2), var(--bevel), 0 0 22px -8px rgba(245, 166, 35, 0.5);
}
.tech-node--milestone .tech-node__name,
.tech-node--milestone .tech-node__icon {
  color: var(--color-accent-gold);
}

/* milestone acquired — gold always wins over green */
.tech-node--acquired-milestone {
  background: linear-gradient(180deg, var(--color-skill-milestone), #16130a);
  border-color: var(--color-accent-gold);
  box-shadow: var(--elev-2), var(--bevel), 0 0 22px -8px rgba(245, 166, 35, 0.5);
}
.tech-node--acquired-milestone .tech-node__name,
.tech-node--acquired-milestone .tech-node__icon {
  color: var(--color-accent-gold);
}

/* hover-lift — pointer devices only; scale is transient so no GPU layer at rest */
@media (hover: hover) {
  .tech-node--available:hover {
    transform: scale(1.06);
    box-shadow: var(--elev-3), var(--bevel), 0 0 36px -2px rgba(6, 182, 212, 0.7);
    animation: none;
  }

  .tech-node:not(.tech-node--available):hover {
    transform: scale(1.03);
    box-shadow: var(--elev-3), var(--bevel);
  }
}

/* tap feedback — all devices, all states */
.tech-node:active {
  transform: scale(0.96);
  transition: transform 0.08s ease;
}

@keyframes breathe {
  0%, 100% { box-shadow: var(--elev-2), var(--bevel), 0 0 22px -6px rgba(6, 182, 212, 0.55); }
  50%       { box-shadow: var(--elev-3), var(--bevel), 0 0 34px -2px rgba(6, 182, 212, 0.55); }
}
</style>
