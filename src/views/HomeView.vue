<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useProfileStore } from '@/stores/profile'
import { useBabyProgress } from '@/composables/useBabyProgress'
import type { BabyProfile } from '@/types/user'
import BabyCard from '@/components/BabyCard.vue'
import AddBabyForm from '@/components/AddBabyForm.vue'
import AddBabySlot from '@/components/AddBabySlot.vue'
import BottomSheet from '@/components/BottomSheet.vue'

const profileStore = useProfileStore()
const { babies } = storeToRefs(profileStore)

const editingBaby = ref<BabyProfile | null>(null)
const deletingBaby = ref<BabyProfile | null>(null)
const justAddedBabyId = ref<string | null>(null)
const babyCardRefs = ref<Record<string, InstanceType<typeof BabyCard> | null>>({})

function setBabyCardRef(id: string, el: unknown) {
  babyCardRefs.value[id] = el as InstanceType<typeof BabyCard> | null
}

function handleBabyAdded(id: string) {
  if (profileStore.babies.length > 1) {
    justAddedBabyId.value = id
  }
}

async function handleMoveToTop(id: string) {
  profileStore.moveToTop(id)
  await nextTick()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  babyCardRefs.value[id]?.focusKebab()
}

function progressFor(babyId: string) {
  return useBabyProgress(babyId).progress.value
}

function openEdit(baby: BabyProfile) {
  editingBaby.value = baby
}

function closeEdit() {
  editingBaby.value = null
}

function openDelete(baby: BabyProfile) {
  deletingBaby.value = baby
}

function closeDelete() {
  deletingBaby.value = null
}

function confirmDelete() {
  if (!deletingBaby.value) return
  profileStore.deleteBaby(deletingBaby.value.id)
  deletingBaby.value = null
}
</script>

<template>
  <main class="home">
    <header class="home__header">
      <h1 class="home__title">Baby Skill Tree</h1>
    </header>

    <TransitionGroup name="baby-list" tag="section" class="home__list">
      <BabyCard
        v-for="(baby, index) in babies"
        :key="baby.id"
        :ref="(el) => setBabyCardRef(baby.id, el)"
        :baby="baby"
        :progress="progressFor(baby.id)"
        :index="index"
        :sheet-is-open="editingBaby?.id === baby.id || deletingBaby?.id === baby.id"
        :auto-reveal="justAddedBabyId === baby.id"
        @edit="openEdit(baby)"
        @delete="openDelete(baby)"
        @move-to-top="handleMoveToTop(baby.id)"
        @auto-revealed="justAddedBabyId = null"
      />
      <AddBabySlot key="add-baby-slot" @added="handleBabyAdded" />
    </TransitionGroup>

    <!-- Edit profile sheet -->
    <BottomSheet
      :open="!!editingBaby"
      :ariaLabel="`Edit ${editingBaby?.name ?? ''}`"
      @close="closeEdit"
    >
      <template #header>
        <h2 class="sheet-title">Edit Profile</h2>
      </template>
      <AddBabyForm
        v-if="editingBaby"
        :edit-baby="editingBaby"
        @saved="closeEdit"
        @cancel="closeEdit"
      />
    </BottomSheet>

    <!-- Delete confirm sheet -->
    <BottomSheet
      :open="!!deletingBaby"
      :ariaLabel="`Delete ${deletingBaby?.name ?? ''}'s profile`"
      @close="closeDelete"
    >
      <template #header>
        <h2 class="sheet-title sheet-title--danger">Delete Profile</h2>
      </template>
      <p class="delete-confirm__text">
        Delete <strong>{{ deletingBaby?.name }}</strong>'s profile? This can't be undone.
      </p>
      <div class="delete-confirm__actions">
        <button class="btn btn--danger" @click="confirmDelete">Delete</button>
        <button class="btn btn--ghost" @click="closeDelete">Cancel</button>
      </div>
    </BottomSheet>
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
  justify-content: flex-start;
}

.home__title {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.05em;
  color: var(--color-text);
  text-shadow: 0 0 28px rgba(6, 182, 212, 0.25);
}

.home__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.baby-list-move {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .baby-list-move {
    transition: none;
  }
}

/* Sheet content styles (not scoped inside BottomSheet) */
.sheet-title {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text);
  letter-spacing: 0.03em;
  margin: 0;
  flex: 1;
  min-width: 0;
  align-self: center;
}

.sheet-title--danger {
  color: var(--color-error);
}

.delete-confirm__text {
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
}

.delete-confirm__text strong {
  color: var(--color-text);
  font-weight: 700;
}

.delete-confirm__actions {
  display: flex;
  gap: var(--space-3);
}

.btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  min-height: 40px;
  transition: opacity 0.15s;
}

.btn:hover { opacity: 0.85; }

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn--danger {
  background: var(--color-error);
  color: #fff;
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-subtle);
}
</style>
