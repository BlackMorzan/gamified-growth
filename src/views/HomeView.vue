<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProfileStore } from '@/stores/profile'
import { useBabyProgress } from '@/composables/useBabyProgress'
import BabyCard from '@/components/BabyCard.vue'
import AddBabyForm from '@/components/AddBabyForm.vue'

const { babies } = storeToRefs(useProfileStore())
const showForm = ref(false)

function progressFor(babyName: string) {
  return useBabyProgress(babyName).progress.value
}
</script>

<template>
  <main class="home">
    <header class="home__header">
      <h1 class="home__title">Baby Skill Tree</h1>
      <button v-if="!showForm" class="add-btn" @click="showForm = true">+ Add Baby</button>
    </header>

    <AddBabyForm
      v-if="showForm"
      @saved="showForm = false"
      @cancel="showForm = false"
    />

    <section class="home__list">
      <BabyCard
        v-for="(baby, index) in babies"
        :key="baby.name"
        :baby="baby"
        :progress="progressFor(baby.name)"
        :index="index"
      />
      <p v-if="babies.length === 0" class="home__empty">
        No babies yet. Add one above to get started.
      </p>
    </section>
  </main>
</template>

<style scoped>
.home {
  padding: var(--space-8) var(--space-6);
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: radial-gradient(ellipse 120% 50% at 50% 0%, rgba(6, 182, 212, 0.04) 0%, transparent 70%);
}

.home__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home__title {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.05em;
  color: var(--color-text);
  text-shadow: 0 0 28px rgba(6, 182, 212, 0.25);
}

.add-btn {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.add-btn:hover {
  background: var(--color-skill-available);
}

.add-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.home__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.home__empty {
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-8) var(--space-6);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--elev-1), var(--bevel);
}
</style>
