<script setup lang="ts">
import { computed, ref, watchEffect, onMounted, onUnmounted } from 'vue'
import { skills } from '@/data/skills'
import type { Skill, SkillDomain } from '@/data/skills'
import { useTechTreeStore } from '@/stores/techTree'
import { useProfileStore } from '@/stores/profile'
import { usePanZoom } from '@/composables/usePanZoom'
import TechTierBand from './TechTierBand.vue'
import TechConnection from './TechConnection.vue'
import TechNode from './TechNode.vue'
import TechTreeControls from './TechTreeControls.vue'
import SkillBottomSheet from './SkillBottomSheet.vue'

const props = defineProps<{ domain: SkillDomain }>()

const store = useTechTreeStore()
const profileStore = useProfileStore()
const selectedSkill = ref<Skill | null>(null)
const viewportEl = ref<HTMLElement | null>(null)

const panZoom = usePanZoom()

panZoom.setBoundsGetter(() => {
  const s = panZoom.scale.value
  const viewW = viewportEl.value?.clientWidth ?? window.innerWidth
  const viewH = viewportEl.value?.clientHeight ?? window.innerHeight
  const scaledW = canvasWidth.value * s
  const scaledH = canvasHeight.value * s
  return {
    minX: scaledW >= viewW ? viewW - scaledW : (viewW - scaledW) / 2,
    maxX: scaledW >= viewW ? 0 : (viewW - scaledW) / 2,
    minY: scaledH >= viewH ? viewH - scaledH : 0,
    maxY: 0,
  }
})

const COL_WIDTH = 200
const ROW_HEIGHT = 120
const CARD_WIDTH = 140
const CARD_HEIGHT = 72

function nodeX(skill: Skill): number {
  return (skill.tier - 1) * COL_WIDTH + (COL_WIDTH - CARD_WIDTH) / 2
}

function nodeY(skill: Skill): number {
  return (skill.row - 1) * ROW_HEIGHT + (ROW_HEIGHT - CARD_HEIGHT) / 2
}

const domainSkills = computed(() => skills.filter((s) => s.domain === props.domain))

const tiers = computed(() =>
  [...new Set(domainSkills.value.map((s) => s.tier))].sort((a, b) => a - b),
)

const canvasWidth = computed(() =>
  Math.max(...domainSkills.value.map((s) => s.tier)) * COL_WIDTH,
)

const canvasHeight = computed(() =>
  domainSkills.value.length
    ? Math.max(...domainSkills.value.map((s) => s.row)) * ROW_HEIGHT
    : 0,
)

// Cross-domain edges are excluded — from and to must both be in this domain
const domainEdges = computed(() =>
  store.edges.filter(
    (e) => e.from.domain === props.domain && e.to.domain === props.domain,
  ),
)

// x of the left-center of a simulated card at the given tier
function tierX(tier: number): number {
  return (tier - 1) * COL_WIDTH + (COL_WIDTH - CARD_WIDTH) / 2
}

type EdgeEntry = {
  id: string
  d: string
  progress: 'locked' | 'available' | 'acquired' | 'partial-available'
}

// One stitched path per logical edge. For tier-skipping edges the vertical drop
// lands in the first inter-tier gap; the rest of the run is horizontal at y2.
// Hard 90° bends (no bezier radius) so the blob travels one continuous path.
const edges = computed((): EdgeEntry[] => {
  const result: EdgeEntry[] = []
  for (const edge of domainEdges.value) {
    const y1 = nodeY(edge.from) + CARD_HEIGHT / 2
    const y2 = nodeY(edge.to) + CARD_HEIGHT / 2
    const x1 = tierX(edge.from.tier) + CARD_WIDTH
    const x2 = tierX(edge.to.tier)

    let d: string
    if (Math.abs(y2 - y1) < 1) {
      d = `M ${x1},${y1} L ${x2},${y2}`
    } else {
      const r = 12
      const vDir = y2 > y1 ? 1 : -1
      // bend sits halfway through the first inter-tier gap; remainder is a
      // straight horizontal run so no second bend is needed for tier-skipping edges
      const midX = (x1 + tierX(edge.from.tier + 1)) / 2
      d = `M ${x1},${y1} L ${midX - r},${y1} Q ${midX},${y1} ${midX},${y1 + r * vDir} L ${midX},${y2 - r * vDir} Q ${midX},${y2} ${midX + r},${y2} L ${x2},${y2}`
    }

    result.push({
      id: edge.id,
      d,
      progress: edge.fromProgress as EdgeEntry['progress'],
    })
  }
  const order = { acquired: 0, available: 1, 'partial-available': 2, locked: 3 }
  return result.sort((a, b) => order[a.progress] - order[b.progress])
})

function nodeStyle(skill: Skill) {
  return { left: `${nodeX(skill)}px`, top: `${nodeY(skill)}px` }
}

// Keep every corner of the viewport inside the canvas.
// When the canvas is wider/taller than the viewport: hard clamp [viewDim - scaledDim, 0].
// When smaller (zoomed out): center it (locked, no pan).
// watchEffect (flush:'pre') writes back before each render so zoom math always sees clean state.
watchEffect(() => {
  const s = panZoom.scale.value
  const viewW = viewportEl.value?.clientWidth ?? window.innerWidth
  const viewH = viewportEl.value?.clientHeight ?? window.innerHeight
  const scaledW = canvasWidth.value * s
  const scaledH = canvasHeight.value * s

  const clampedX =
    scaledW >= viewW
      ? Math.max(viewW - scaledW, Math.min(0, panZoom.translateX.value))
      : (viewW - scaledW) / 2
  // Canvas has min-height:100% so its DOM height always fills the viewport.
  // When content is shorter, pin to top (ty=0); when taller, clamp to the hard edges.
  const clampedY =
    scaledH >= viewH ? Math.max(viewH - scaledH, Math.min(0, panZoom.translateY.value)) : 0

  if (panZoom.translateX.value !== clampedX) panZoom.translateX.value = clampedX
  if (panZoom.translateY.value !== clampedY) panZoom.translateY.value = clampedY
})

function jumpToAgeTier() {
  const age = profileStore.ageInMonths
  const viewW = viewportEl.value?.clientWidth ?? window.innerWidth

  // Skills in this domain whose age range contains current age
  const matching = domainSkills.value.filter(
    (s) => s.typical_age_months.start <= age && age <= s.typical_age_months.end,
  )

  let targetTier: number
  if (matching.length > 0) {
    const sum = matching.reduce((acc, s) => acc + s.tier, 0)
    targetTier = Math.round(sum / matching.length)
  } else {
    // Fall back to skill whose age midpoint is closest
    const sorted = [...domainSkills.value].sort((a, b) => {
      const aMid = (a.typical_age_months.start + a.typical_age_months.end) / 2
      const bMid = (b.typical_age_months.start + b.typical_age_months.end) / 2
      return Math.abs(aMid - age) - Math.abs(bMid - age)
    })
    targetTier = sorted[0]?.tier ?? 1
  }

  const tierCenterX = (targetTier - 1) * COL_WIDTH + COL_WIDTH / 2
  panZoom.setView(viewW / 2 - tierCenterX * panZoom.scale.value, 24, panZoom.scale.value)
}

// Register touch handlers as non-passive so gestures are fully captured
onMounted(() => {
  jumpToAgeTier()
  const el = viewportEl.value
  if (!el) return
  el.addEventListener('touchstart', panZoom.onTouchStart, { passive: true })
  el.addEventListener('touchmove', panZoom.onTouchMove, { passive: true })
  el.addEventListener('touchend', panZoom.onTouchEnd, { passive: true })
})

onUnmounted(() => {
  panZoom.cancelInertia()
  const el = viewportEl.value
  if (!el) return
  el.removeEventListener('touchstart', panZoom.onTouchStart)
  el.removeEventListener('touchmove', panZoom.onTouchMove)
  el.removeEventListener('touchend', panZoom.onTouchEnd)
})
</script>

<template>
  <div ref="viewportEl" class="tree-viewport">
    <div
      class="tree-canvas"
      :style="{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: panZoom.transform.value,
      }"
    >
      <TechTierBand
        v-for="tier in tiers"
        :key="tier"
        :tier="tier"
      />

      <svg
        class="tree-edges"
        :width="canvasWidth"
        :height="canvasHeight"
        aria-hidden="true"
      >
        <TechConnection
          v-for="edge in edges"
          :key="edge.id"
          :d="edge.d"
          :progress="edge.progress"
        />
      </svg>

      <TechNode
        v-for="skill in domainSkills"
        :key="skill.id"
        :skill="skill"
        :style="nodeStyle(skill)"
        @select="selectedSkill = $event"
      />
    </div>

    <TechTreeControls
      @zoom-in="panZoom.zoomIn()"
      @zoom-out="panZoom.zoomOut()"
      @jump-to-age="jumpToAgeTier()"
    />
  </div>

  <SkillBottomSheet :skill="selectedSkill" @close="selectedSkill = null" />
</template>

<style scoped>
.tree-viewport {
  overflow: hidden;
  width: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
  touch-action: none;
}

/* vignette — fixed overlay that creates a "floor" the nodes float above */
.tree-viewport::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  background: radial-gradient(
    ellipse 85% 75% at 50% 42%,
    transparent 25%,
    rgba(8, 10, 22, 0.65) 100%
  );
}

.tree-canvas {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  min-height: 100%;
}

.tree-edges {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
