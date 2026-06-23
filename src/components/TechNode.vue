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
  transition: background 0.15s, box-shadow 0.15s;
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

/* locked */
.tech-node--locked {
  background: var(--color-skill-locked);
}
.tech-node--locked .tech-node__name,
.tech-node--locked .tech-node__icon {
  color: var(--color-text-locked);
}

/* available */
.tech-node--available {
  background: var(--color-skill-available);
  border-color: var(--color-accent);
}
.tech-node--available:hover,
.tech-node--available:focus-visible {
  background: var(--color-skill-available-hover);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.25);
  outline: none;
}
.tech-node--available .tech-node__icon {
  color: var(--color-accent);
}

/* acquired */
.tech-node--acquired {
  background: var(--color-skill-acquired);
  border-color: var(--color-skill-acquired-border);
}
.tech-node--acquired .tech-node__icon {
  color: var(--color-success-text);
}

/* milestone (available) */
.tech-node--milestone {
  background: var(--color-skill-milestone);
  border-color: var(--color-accent-gold);
}
.tech-node--milestone .tech-node__name,
.tech-node--milestone .tech-node__icon {
  color: var(--color-accent-gold);
}

/* milestone acquired — gold wins over green */
.tech-node--acquired-milestone {
  background: var(--color-skill-milestone);
  border-color: var(--color-accent-gold);
}
.tech-node--acquired-milestone .tech-node__name,
.tech-node--acquired-milestone .tech-node__icon {
  color: var(--color-accent-gold);
}
</style>
