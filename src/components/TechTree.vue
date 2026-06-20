<script setup lang="ts">
import { computed } from 'vue'
import { skills } from '@/data/skills'
import type { Skill, SkillDomain } from '@/data/skills'
import { useTechTreeStore } from '@/stores/techTree'
import TechTierBand from './TechTierBand.vue'
import TechConnection from './TechConnection.vue'
import TechNode from './TechNode.vue'

const props = defineProps<{ domain: SkillDomain }>()

const store = useTechTreeStore()

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
  Math.max(...domainSkills.value.map((s) => s.row)) * ROW_HEIGHT,
)

// Cross-domain edges are excluded — from and to must both be in this domain
const domainEdges = computed(() =>
  store.edges.filter(
    (e) => e.from.domain === props.domain && e.to.domain === props.domain,
  ),
)

function edgeAnchors(edge: (typeof domainEdges.value)[number]) {
  return {
    x1: nodeX(edge.from) + CARD_WIDTH,
    y1: nodeY(edge.from) + CARD_HEIGHT / 2,
    x2: nodeX(edge.to),
    y2: nodeY(edge.to) + CARD_HEIGHT / 2,
  }
}

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
        :canvas-height="canvasHeight"
      />

      <svg
        class="tree-edges"
        :width="canvasWidth"
        :height="canvasHeight"
        aria-hidden="true"
      >
        <TechConnection
          v-for="edge in domainEdges"
          :key="edge.id"
          v-bind="edgeAnchors(edge)"
          :progress="edge.fromProgress"
        />
      </svg>

      <TechNode
        v-for="skill in domainSkills"
        :key="skill.id"
        :skill="skill"
        :style="nodeStyle(skill)"
      />
    </div>
  </div>
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
  /* pan/zoom transform goes here in M6 */
}

.tree-edges {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
