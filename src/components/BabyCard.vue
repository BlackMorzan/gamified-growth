<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { BabyProfile } from '@/types/user'
import type { DomainProgress } from '@/composables/useBabyProgress'
import { formatAge } from '@/utils/age'

const REVEAL_WIDTH = 64
const RUBBER = 0.3

const props = defineProps<{
  baby: BabyProfile
  progress: DomainProgress[]
  index: number
  sheetIsOpen: boolean
  autoReveal?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'move-to-top': []
  'auto-revealed': []
}>()

const router = useRouter()
const mounted = ref(false)
const dragX = ref(0)       // CSS translateX: 0=closed, -REVEAL_WIDTH=open
const isRevealed = ref(false)
const isSnapping = ref(false)

const cardEl = ref<HTMLElement | null>(null)
const innerEl = ref<HTMLElement | null>(null)
const kebabRef = ref<HTMLButtonElement | null>(null)
const editChipRef = ref<HTMLButtonElement | null>(null)
const moveToTopChipRef = ref<HTMLButtonElement | null>(null)

const showActions = computed(() => Math.abs(dragX.value) > 0.5 || isSnapping.value)

onMounted(() => { requestAnimationFrame(() => { mounted.value = true }) })

// When sheet closes, reset card
watch(() => props.sheetIsOpen, (open) => {
  if (!open) _close()
})

// Auto-reveal after this baby was just added (M4) — focus lands on "Move to top".
// immediate: true because the new BabyCard mounts with autoReveal already true —
// there's no false→true transition within this instance's lifetime to catch otherwise.
watch(() => props.autoReveal, (reveal) => {
  if (reveal) {
    _open('moveToTop')
    emit('auto-revealed')
  }
}, { immediate: true })

// Outside-tap listener — added/removed when isRevealed changes
function _handleDocumentClick(e: MouseEvent) {
  if (!cardEl.value?.contains(e.target as Node)) {
    _close()
  }
}

watch(isRevealed, (revealed) => {
  if (revealed) {
    document.addEventListener('click', _handleDocumentClick)
  } else {
    document.removeEventListener('click', _handleDocumentClick)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', _handleDocumentClick)
})

async function _open(focusTarget: 'edit' | 'moveToTop' = 'edit') {
  dragX.value = -REVEAL_WIDTH
  isRevealed.value = true
  isSnapping.value = true
  setTimeout(() => { isSnapping.value = false }, 280)
  await nextTick()
  if (focusTarget === 'moveToTop') {
    moveToTopChipRef.value?.focus()
  } else {
    editChipRef.value?.focus()
  }
}

function _close() {
  dragX.value = 0
  isRevealed.value = false
  isSnapping.value = true
  setTimeout(() => { isSnapping.value = false }, 280)
}

function handleKebabClick() {
  if (isRevealed.value) {
    _close()
    nextTick(() => kebabRef.value?.focus())
  } else {
    _open()
  }
}

function handleEscape(e: KeyboardEvent) {
  if (isRevealed.value) {
    e.stopPropagation()
    _close()
    nextTick(() => kebabRef.value?.focus())
  }
}

function handleEditClick() {
  _close()
  emit('edit')
}

function handleDeleteClick() {
  _close()
  emit('delete')
}

function handleMoveToTopClick() {
  _close()
  emit('move-to-top')
}

// Card body click — close if revealed (don't navigate); navigate if closed
function handleInnerClick() {
  if (isRevealed.value) {
    _close()
    return
  }
  router.push({ name: 'skill-tree', params: { babyName: props.baby.name } })
}

function handleInnerKeyEnter() {
  if (!isRevealed.value) {
    router.push({ name: 'skill-tree', params: { babyName: props.baby.name } })
  }
}

function goToDomain(domain: string) {
  router.push({ name: 'skill-tree', params: { babyName: props.baby.name }, query: { domain } })
}

// ─── Touch / swipe ────────────────────────────────────────────────────────────

let touchStartX = 0
let touchStartY = 0
let touchStartDragX = 0
let touchLocked: 'h' | 'v' | null = null

function _clampedDrag(startX: number, delta: number): number {
  // delta > 0 = moved left (revealing)
  const natural = startX - delta
  if (natural > 0) return natural * RUBBER                                          // rubber right
  if (natural < -REVEAL_WIDTH) return -REVEAL_WIDTH + (natural + REVEAL_WIDTH) * RUBBER // rubber left
  return natural
}

function onTouchStart(e: TouchEvent) {
  isSnapping.value = false
  touchStartX = e.touches[0]!.clientX
  touchStartY = e.touches[0]!.clientY
  touchStartDragX = dragX.value
  touchLocked = null
}

function onTouchMove(e: TouchEvent) {
  const dx = e.touches[0]!.clientX - touchStartX
  const dy = e.touches[0]!.clientY - touchStartY

  if (touchLocked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    touchLocked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
  }

  if (touchLocked === 'h') {
    e.preventDefault()
    dragX.value = _clampedDrag(touchStartDragX, touchStartX - e.touches[0]!.clientX)
  }
}

function onTouchEnd(e: TouchEvent) {
  if (touchLocked !== 'h') return

  const delta = touchStartX - e.changedTouches[0]!.clientX
  const final = _clampedDrag(touchStartDragX, delta)
  const snapped = final <= -REVEAL_WIDTH * 0.5 ? -REVEAL_WIDTH : 0

  dragX.value = snapped
  isSnapping.value = true
  setTimeout(() => { isSnapping.value = false }, 280)

  const wasRevealed = isRevealed.value
  isRevealed.value = snapped < 0

  if (!wasRevealed && isRevealed.value) {
    nextTick(() => editChipRef.value?.focus())
  } else if (wasRevealed && !isRevealed.value) {
    nextTick(() => kebabRef.value?.focus())
  }
}

// Non-passive touchmove for direction lock (preventDefault)
onMounted(() => {
  innerEl.value?.addEventListener('touchmove', onTouchMove, { passive: false })
})
onUnmounted(() => {
  innerEl.value?.removeEventListener('touchmove', onTouchMove)
})

const DOMAIN_COLOR: Record<string, string> = {
  physical_motor: 'var(--color-domain-physical)',
  cognitive: 'var(--color-domain-cognitive)',
  language_communication: 'var(--color-domain-language)',
  social_emotional: 'var(--color-domain-social)',
}

defineExpose({
  focusKebab: () => kebabRef.value?.focus(),
})
</script>

<template>
  <div
    ref="cardEl"
    class="card-wrap"
    :style="{ animationDelay: `${props.index * 60}ms` }"
    @keydown.esc.stop="handleEscape"
  >
    <!-- Card content: slides left to reveal action chips -->
    <div
      ref="innerEl"
      class="card-inner"
      role="link"
      tabindex="0"
      :class="{ 'card-inner--snapping': isSnapping }"
      :style="{ transform: `translateX(${dragX}px)` }"
      @click="handleInnerClick"
      @keydown.enter.prevent="handleInnerKeyEnter"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="card-inner__header">
        <span class="card-inner__name">{{ baby.name }}</span>
        <span class="card-inner__age">{{ formatAge(baby.birthDate) }}</span>
        <button
          ref="kebabRef"
          class="kebab-btn"
          :aria-label="`Edit/Delete options for ${baby.name}`"
          :aria-expanded="isRevealed"
          @click.stop="handleKebabClick"
          @keydown.enter.stop.prevent="handleKebabClick"
          @keydown.space.stop.prevent="handleKebabClick"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="4" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="9" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="14" r="1.2" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="card-inner__grid">
        <button
          v-for="d in progress"
          :key="d.domain"
          class="domain-btn"
          :style="{ '--domain-color': DOMAIN_COLOR[d.domain] }"
          :aria-label="`${d.label}: ${d.acquired} of ${d.total} skills`"
          @click.stop="isRevealed ? _close() : goToDomain(d.domain)"
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

    <!-- Action chips: absolutely positioned, revealed when card slides left -->
    <div class="card-actions" v-show="showActions" :aria-hidden="!isRevealed ? 'true' : undefined">
      <button
        ref="editChipRef"
        class="chip chip--edit"
        :tabindex="isRevealed ? 0 : -1"
        :aria-label="`Edit ${baby.name}`"
        @click="handleEditClick"
      >
        <!-- Pencil icon -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M12.5 2.5L15.5 5.5L6.5 14.5L3 15L3.5 11.5L12.5 2.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M11 4L14 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
      <button
        ref="moveToTopChipRef"
        class="chip chip--move-top"
        :tabindex="isRevealed ? 0 : -1"
        :disabled="index === 0"
        :aria-label="`Move ${baby.name} to top`"
        @click="handleMoveToTopClick"
      >
        <!-- Up-arrow icon -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 14V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M4.5 8.5L9 4L13.5 8.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      </button>
      <button
        class="chip chip--delete"
        :tabindex="isRevealed ? 0 : -1"
        :aria-label="`Delete ${baby.name}`"
        @click="handleDeleteClick"
      >
        <!-- Trash icon -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M3 5H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M7 5V3H11V5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M5 5L5.5 15H12.5L13 5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M8 8V12M10 8V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper: clips the sliding card, holds the actions layer ── */
.card-wrap {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--elev-2), var(--bevel);
  animation: card-enter 0.35s ease both;
  transition: border-color 0.2s, box-shadow 0.2s;
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (hover: hover) {
  .card-wrap:has(.card-inner:hover) {
    border-color: var(--color-accent);
    box-shadow: var(--elev-3), var(--bevel), 0 0 26px -4px rgba(6, 182, 212, 0.35);
  }
}

.card-wrap:has(.card-inner:focus-visible) {
  border-color: var(--color-accent);
  box-shadow: var(--elev-3), var(--bevel), 0 0 26px -4px rgba(6, 182, 212, 0.35);
}

/* ── Card content: the full-width sliding layer ── */
.card-inner {
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, var(--color-surface), #131b35);
  border-radius: var(--radius-md); /* mirrors wrapper; needed for clean edge at translateX 0 */
  padding: var(--space-4);
  cursor: pointer;
  outline: none; /* wrapper handles the focus ring via :has() */
  /* no transform transition here — snapping class adds it */
}

.card-inner--snapping {
  transition: transform 0.25s ease;
}

.card-inner__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  gap: var(--space-2);
}

.card-inner__name {
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: 0.04em;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
}

.card-inner__age {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* ── Kebab trigger ── */
.kebab-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 0.15s, background 0.15s;
}

.kebab-btn:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.06);
}

.kebab-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: 50%;
}

/* ── Domain grid ── */
.card-inner__grid {
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

.domain-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
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

/* ── Action chips: absolute layer behind card-inner ── */
.card-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  display: flex;
  flex-direction: column;
  z-index: 0;
}

.chip {
  flex: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: opacity 0.15s;
}

.chip:hover { opacity: 0.85; }

.chip:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: -3px;
}

.chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chip:disabled:hover { opacity: 0.4; }

.chip--edit {
  background: var(--color-accent);
  border-radius: 0 var(--radius-md) 0 0;
}

.chip--move-top {
  background: var(--color-amber);
}

.chip--delete {
  background: var(--color-error);
  border-radius: 0 0 var(--radius-md) 0;
}
</style>
