<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { BabyProfile } from '@/types/user'
import type { DomainProgress } from '@/composables/useBabyProgress'
import { formatAge } from '@/utils/age'

const props = defineProps<{
  baby: BabyProfile
  progress: DomainProgress[]
  index: number
  sheetIsOpen: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const router = useRouter()
const mounted = ref(false)
const isRevealed = ref(false)
const cardEl = ref<HTMLElement | null>(null)

onMounted(() => { requestAnimationFrame(() => { mounted.value = true }) })

watch(() => props.sheetIsOpen, (open) => {
  if (!open) isRevealed.value = false
})

function handleDocumentClick(e: MouseEvent) {
  if (!cardEl.value?.contains(e.target as Node)) {
    isRevealed.value = false
    document.removeEventListener('click', handleDocumentClick)
  }
}

function toggleReveal() {
  isRevealed.value = !isRevealed.value
  if (isRevealed.value) {
    // nextTick not needed — @click.stop prevents this click reaching document
    document.addEventListener('click', handleDocumentClick)
  } else {
    document.removeEventListener('click', handleDocumentClick)
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

// Swipe-to-reveal (horizontal swipe, direction-locked)
let touchStartX = 0
let touchStartY = 0
let touchLocked: 'h' | 'v' | null = null

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchLocked = null
}

function onTouchMove(e: TouchEvent) {
  const dx = Math.abs(e.touches[0].clientX - touchStartX)
  const dy = Math.abs(e.touches[0].clientY - touchStartY)
  if (touchLocked === null && (dx > 8 || dy > 8)) {
    touchLocked = dx > dy ? 'h' : 'v'
  }
  if (touchLocked === 'h') e.preventDefault()
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (touchLocked === 'h' && Math.abs(dx) > 40) {
    if (!isRevealed.value) {
      isRevealed.value = true
      document.addEventListener('click', handleDocumentClick)
    } else {
      isRevealed.value = false
      document.removeEventListener('click', handleDocumentClick)
    }
  }
}

// Attach touchmove as non-passive so we can preventDefault for direction lock
onMounted(() => {
  cardEl.value?.addEventListener('touchmove', onTouchMove, { passive: false })
})
onUnmounted(() => {
  cardEl.value?.removeEventListener('touchmove', onTouchMove)
})

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
    ref="cardEl"
    class="baby-card"
    :class="{ 'baby-card--revealed': isRevealed }"
    role="link"
    tabindex="0"
    :style="{ animationDelay: `${props.index * 60}ms` }"
    @click="goToTree()"
    @keydown.enter.prevent="goToTree()"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="baby-card__header">
      <span class="baby-card__name">{{ baby.name }}</span>
      <span class="baby-card__age">{{ formatAge(baby.birthDate) }}</span>
      <button
        class="baby-card__pencil"
        :aria-label="`Edit ${baby.name}`"
        tabindex="0"
        @click.stop="toggleReveal"
        @keydown.enter.stop.prevent="toggleReveal"
        @keydown.space.stop.prevent="toggleReveal"
      >✏</button>
    </div>

    <div v-if="isRevealed" class="baby-card__actions">
      <button
        class="action-btn action-btn--edit"
        @click.stop="emit('edit')"
      >Edit Profile</button>
      <button
        class="action-btn action-btn--delete"
        @click.stop="emit('delete')"
      >Delete</button>
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

.baby-card--revealed {
  border-color: var(--color-border-subtle);
}

.baby-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  gap: var(--space-2);
}

.baby-card__name {
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: 0.04em;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
}

.baby-card__age {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.baby-card__pencil {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: var(--space-1);
  line-height: 1;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.baby-card__pencil:hover,
.baby-card--revealed .baby-card__pencil {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.06);
}

.baby-card__pencil:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.baby-card__actions {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.action-btn {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  min-height: 40px;
  transition: opacity 0.15s, background 0.15s;
}

.action-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.action-btn--edit {
  background: var(--color-skill-available);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.action-btn--edit:hover {
  background: var(--color-skill-available-hover);
}

.action-btn--delete {
  background: transparent;
  border: 1px solid rgba(233, 69, 96, 0.45);
  color: var(--color-error);
}

.action-btn--delete:hover {
  background: rgba(233, 69, 96, 0.1);
  border-color: var(--color-error);
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
