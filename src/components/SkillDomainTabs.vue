<script setup lang="ts">
import { ref } from 'vue'
import type { SkillDomain } from '@/data/skills'
import TechTree from './TechTree.vue'

type Tab = { domain: SkillDomain; label: string }

const tabs: Tab[] = [
  { domain: 'physical_motor', label: 'Physical & Motor' },
  { domain: 'cognitive', label: 'Cognitive' },
  { domain: 'language_communication', label: 'Language & Communication' },
  { domain: 'social_emotional', label: 'Social & Emotional' },
]

const activeIndex = ref(0)
</script>

<template>
  <div class="domain-tabs-container">
    <div class="tab-bar" role="tablist" aria-label="Skill domains">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.domain"
        role="tab"
        :aria-selected="i === activeIndex"
        :aria-controls="`tabpanel-${tab.domain}`"
        :id="`tab-${tab.domain}`"
        :class="['tab-btn', { active: i === activeIndex }]"
        @click="activeIndex = i"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <template v-for="(tab, i) in tabs" :key="tab.domain">
        <div
          v-if="i === activeIndex"
          :id="`tabpanel-${tab.domain}`"
          role="tabpanel"
          :aria-labelledby="`tab-${tab.domain}`"
          class="tab-panel"
        >
          <TechTree :domain="tab.domain" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.domain-tabs-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: var(--space-2) var(--space-2);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.03em;
  cursor: pointer;
  white-space: normal;
  text-align: center;
  min-height: 48px;
  line-height: 1.3;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.tab-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: -2px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
</style>
