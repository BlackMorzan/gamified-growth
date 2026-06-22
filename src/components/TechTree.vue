<script setup lang="ts">
import { computed, ref } from 'vue'
import { skills } from '@/data/skills'
import type { Skill, SkillDomain } from '@/data/skills'
import { useTechTreeStore } from '@/stores/techTree'
import TechTierBand from './TechTierBand.vue'
import TechConnection from './TechConnection.vue'
import TechNode from './TechNode.vue'
import SkillBottomSheet from './SkillBottomSheet.vue'

const props = defineProps<{ domain: SkillDomain }>()

const store = useTechTreeStore()
const selectedSkill = ref<Skill | null>(null)

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

type EdgeSegment = {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  progress: 'locked' | 'available' | 'acquired'
}

// For edges that skip tiers, split into alternating between-card beziers and
// through-card lines. All waypoints sit at to's row; the first bezier handles
// any row transition. Overlap avoidance is a data-authoring concern.
const edgeSegments = computed((): EdgeSegment[] => {
  const segs: EdgeSegment[] = []
  for (const edge of domainEdges.value) {
    const y1 = nodeY(edge.from) + CARD_HEIGHT / 2
    const y2 = nodeY(edge.to) + CARD_HEIGHT / 2
    const tierDiff = edge.to.tier - edge.from.tier

    for (let k = 0; k < tierDiff; k++) {
      const fromTier = edge.from.tier + k
      // only the first segment starts at from's row; the rest travel along to's row
      const segY1 = k === 0 ? y1 : y2

      // between-card bezier
      segs.push({
        id: `${edge.id}_b${k}`,
        x1: tierX(fromTier) + CARD_WIDTH,
        y1: segY1,
        x2: tierX(fromTier + 1),
        y2,
        progress: edge.fromProgress,
      })

      // through-card line for each intermediate simulated card
      if (k < tierDiff - 1) {
        segs.push({
          id: `${edge.id}_t${k}`,
          x1: tierX(fromTier + 1),
          y1: y2,
          x2: tierX(fromTier + 1) + CARD_WIDTH,
          y2,
          progress: edge.fromProgress,
        })
      }
    }
  }
  const order = { acquired: 0, available: 1, locked: 2 }
  return segs.sort((a, b) => order[a.progress] - order[b.progress])
})

function nodeStyle(skill: Skill) {
  return { left: `${nodeX(skill)}px`, top: `${nodeY(skill)}px` }
}
</script>

<template>
  <div class="tree-viewport">
    <div
      class="tree-canvas"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
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
          v-for="seg in edgeSegments"
          :key="seg.id"
          :x1="seg.x1"
          :y1="seg.y1"
          :x2="seg.x2"
          :y2="seg.y2"
          :progress="seg.progress"
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
  </div>

  <SkillBottomSheet :skill="selectedSkill" @close="selectedSkill = null" />
</template>

<style scoped>
.tree-viewport {
  overflow: auto;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.tree-canvas {
  position: relative;
  min-height: 100%;
  /* pan/zoom transform goes here in M6 */
}

.tree-edges {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
