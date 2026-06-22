<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  x1: number
  y1: number
  x2: number
  y2: number
  progress: 'locked' | 'available' | 'acquired'
}>()

const d = computed(() => {
  const dx = props.x2 - props.x1
  const dy = props.y2 - props.y1

  const radius = 12 // fixed corner radius, same for every connector
  const direction = dx >= 0 ? 1 : -1 // handle right-to-left edges
  const vDirection = dy >= 0 ? 1 : -1 // handle upward vs downward edges

  // midpoint where the vertical segment sits
  const midX = (props.x1 + props.x2) / 2

  // if nodes are basically level, just draw a straight line
  if (Math.abs(dy) < 1) {
    return `M ${props.x1},${props.y1} L ${props.x2},${props.y2}`
  }

  return `
    M ${props.x1},${props.y1}
    L ${midX - radius * direction},${props.y1}
    Q ${midX},${props.y1} ${midX},${props.y1 + radius * vDirection}
    L ${midX},${props.y2 - radius * vDirection}
    Q ${midX},${props.y2} ${midX + radius * direction},${props.y2}
    L ${props.x2},${props.y2}
  `.trim().replace(/\s+/g, ' ')
})
</script>

<template>
  <g v-if="progress === 'locked'">
    <path :d="d" class="conn conn--locked-erase" fill="none" />
    <path :d="d" class="conn conn--locked" fill="none" />
  </g>
  <path v-else :d="d" :class="`conn conn--${progress}`" fill="none" stroke-width="2" />
</template>

<style scoped>
.conn {
  transition: stroke 0.2s;
}
.conn--locked-erase {
  stroke: var(--color-bg);
  stroke-width: 3;
  opacity: 0.7;
}
.conn--locked {
  stroke: var(--color-disabled);
  stroke-dasharray: 4 4;
  stroke-width: 2;
  opacity: 0.7;
}
.conn--available {
  stroke: var(--color-accent);
  opacity: 0.7;
}
.conn--acquired {
  stroke: var(--color-skill-acquired-border);
}
</style>
