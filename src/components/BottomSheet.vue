<script setup lang="ts">
defineProps<{
  open: boolean
  ariaLabel: string
  panelClass?: string | Record<string, boolean>
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="sheet-backdrop"
      role="dialog"
      :aria-label="ariaLabel"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div class="sheet-panel" :class="panelClass">
        <div class="sheet-header">
          <slot name="header" />
          <button class="sheet-close" aria-label="Close" @click="emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sheet-panel {
  background: var(--color-surface);
  border-top: 2px solid var(--color-border-subtle);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-5) var(--space-6) var(--space-8);
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.sheet-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: var(--space-1);
  line-height: 1;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-close:hover { color: var(--color-text); }
.sheet-close:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
</style>
