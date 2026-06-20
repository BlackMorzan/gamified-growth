<script setup lang="ts">
import TechTree from '@/components/TechTree.vue'
</script>

<template>
  <main class="tree-view">
    <header class="tree-header">
      <RouterLink to="/" class="back-link">← Home</RouterLink>
      <h1 class="tree-title">Physical &amp; Motor</h1>
    </header>
    <TechTree domain="physical_motor" />
  </main>
</template>

<style scoped>
.tree-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

.tree-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.back-link {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-text);
}

.tree-title {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--color-text);
  letter-spacing: 0.05em;
}
</style>
