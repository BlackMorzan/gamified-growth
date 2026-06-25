<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { skills, type SkillDomain } from '@/data/skills'
import { useTechTreeStore } from '@/stores/techTree'
import TechTree from './TechTree.vue'

type Tab = { domain: SkillDomain; label: string; color: string }

const tabs: Tab[] = [
  { domain: 'physical_motor',        label: 'Physical & Motor',      color: 'var(--color-domain-physical)'  },
  { domain: 'cognitive',             label: 'Cognitive',             color: 'var(--color-domain-cognitive)' },
  { domain: 'language_communication',label: 'Language & Comm.',      color: 'var(--color-domain-language)'  },
  { domain: 'social_emotional',      label: 'Social & Emotional',    color: 'var(--color-domain-social)'    },
]

const store = useTechTreeStore()
const domainPct = computed(() =>
  tabs.map((tab) => {
    const total = skills.filter((s) => s.domain === tab.domain).length
    const acquired = skills.filter((s) => s.domain === tab.domain && store.acquiredIds.has(s.id)).length
    return total > 0 ? Math.floor((acquired / total) * 100) : 0
  }),
)

const route = useRoute()
const initialIndex = tabs.findIndex((t) => t.domain === route.query.domain)
const activeIndex = ref(initialIndex >= 0 ? initialIndex : 0)

const mounted = ref(false)
onMounted(() => { requestAnimationFrame(() => { mounted.value = true }) })
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
        <div
          class="tab-progress"
          :style="{ width: mounted ? `${domainPct[i]}%` : '0%', background: tab.color }"
          aria-hidden="true"
        />
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
  position: relative;
  overflow: hidden;
  padding: var(--space-2) var(--space-2);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0;
  cursor: pointer;
  white-space: normal;
  text-align: center;
  min-height: 48px;
  line-height: 1.3;
  transition: color 0.15s, border-color 0.15s;
  box-shadow: inset 14px 0 16px -8px rgba(0,0,0,0.6), inset -14px 0 16px -8px rgba(0,0,0,0.6);
}

.tab-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  border-radius: 0 2px 2px 0;
  opacity: 0.7;
  transition: width 0.6s ease;
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  text-shadow: 0 0 12px rgba(6, 182, 212, 0.55);
  background: linear-gradient(to bottom, rgba(6, 182, 212, 0.08), transparent);
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
