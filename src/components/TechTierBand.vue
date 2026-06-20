<script setup lang="ts">
defineProps<{
  tier: number
  canvasHeight: number
}>()

const COL_WIDTH = 200
</script>

<template>
  <div
    class="tier-band"
    :class="{ 'tier-band--alt': tier % 2 === 0 }"
    :style="{
      left: `${(tier - 1) * COL_WIDTH}px`,
      width: `${COL_WIDTH}px`,
      height: `${canvasHeight}px`,
    }"
  />
</template>

<style scoped>
.tier-band {
  position: absolute;
  top: 0;
  border-right: 1px solid var(--color-border-subtle);
}

.tier-band--alt {
  background: rgba(255, 255, 255, 0.015);
}
</style>
