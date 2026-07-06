<script setup lang="ts">
defineEmits<{
  zoomIn: []
  zoomOut: []
  jumpToAge: []
}>()
</script>

<template>
  <div class="controls" role="group" aria-label="Tree navigation">
    <button class="ctrl-btn" aria-label="Zoom in" @click="$emit('zoomIn')">+</button>
    <button class="ctrl-btn" aria-label="Zoom out" @click="$emit('zoomOut')">−</button>
    <button class="ctrl-btn ctrl-btn--age" aria-label="Jump to current age" @click="$emit('jumpToAge')">
      ⊙
    </button>
  </div>
</template>

<style scoped>
.controls {
  position: fixed;
  bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
  right: calc(var(--space-4) + env(safe-area-inset-right, 0px));
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 20;
}

.ctrl-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text);
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  transition: background 0.15s;
}

.ctrl-btn:hover {
  background: var(--color-skill-available);
}

.ctrl-btn:active {
  background: var(--color-skill-available-hover);
}

.ctrl-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.ctrl-btn--age {
  font-size: 18px;
  color: var(--color-accent-gold);
  border-color: var(--color-accent-gold);
}
</style>
