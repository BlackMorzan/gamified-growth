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
  const mid = (props.x1 + props.x2) / 2
  return `M ${props.x1},${props.y1} C ${mid},${props.y1} ${mid},${props.y2} ${props.x2},${props.y2}`
})
</script>

<template>
  <path :d="d" :class="`conn conn--${progress}`" fill="none" stroke-width="2" />
</template>

<style scoped>
.conn {
  transition: stroke 0.2s;
}
.conn--locked {
  stroke: var(--color-disabled);
  stroke-dasharray: 4 4;
  opacity: 0.5;
}
.conn--available {
  stroke: var(--color-accent);
  opacity: 0.7;
}
.conn--acquired {
  stroke: var(--color-skill-acquired-border);
}
</style>
