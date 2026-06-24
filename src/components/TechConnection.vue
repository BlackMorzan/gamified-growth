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
  <g v-else-if="progress === 'available'">
    <path :d="d" class="conn conn--available" fill="none" stroke-width="2" />
    <g class="pulse">
      <circle class="blob trail t3" r="1.2" :style="`offset-path: path('${d}')`" />
      <circle class="blob trail t2" r="1.7" :style="`offset-path: path('${d}')`" />
      <circle class="blob trail t1" r="2.3" :style="`offset-path: path('${d}')`" />
      <circle class="blob"          r="3.2" :style="`offset-path: path('${d}')`" />
    </g>
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
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.55));
}
.conn--acquired {
  stroke: var(--color-skill-acquired-border);
  filter: drop-shadow(0 0 3px rgba(66, 168, 115, 0.55));
}

.blob {
  fill: #bfe6ff;
  filter: drop-shadow(0 0 3px var(--color-accent)) drop-shadow(0 0 8px rgba(6, 182, 212, 0.55));
  offset-distance: 0%;
  animation: comet 4.2s ease-in-out infinite;
}
.blob.trail {
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.55));
  animation-name: comet-trail;
}
.blob.t1 { animation-delay: 0.05s; }
.blob.t2 { animation-delay: 0.10s; }
.blob.t3 { animation-delay: 0.15s; }

@keyframes comet {
  0%   { offset-distance: 0%;   opacity: 0; }
  6%   { opacity: 1; }
  26%  { offset-distance: 100%; opacity: 1; }
  32%  { opacity: 0; }
  100% { offset-distance: 100%; opacity: 0; }
}
@keyframes comet-trail {
  0%   { offset-distance: 0%;   opacity: 0;   }
  6%   { opacity: 0.45; }
  26%  { offset-distance: 100%; opacity: 0.45; }
  32%  { opacity: 0; }
  100% { offset-distance: 100%; opacity: 0;   }
}
</style>
