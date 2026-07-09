<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProfileStore } from '@/stores/profile'
import { useBabyProgress } from '@/composables/useBabyProgress'
import type { BabyProfile } from '@/types/user'
import BabyCard from '@/components/BabyCard.vue'
import AddBabyForm from '@/components/AddBabyForm.vue'
import BottomSheet from '@/components/BottomSheet.vue'

const router = useRouter()
const profileStore = useProfileStore()
const { babies } = storeToRefs(profileStore)

const showForm = ref(false)
const editingBaby = ref<BabyProfile | null>(null)
const deletingBaby = ref<BabyProfile | null>(null)

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

watch(() => babies.value.length, (len) => {
  if (len === 0) router.push('/setup')
})
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
        :key="baby.id"
        :baby="baby"
        :progress="progressFor(baby.id)"
        :index="index"
        :sheet-is-open="editingBaby?.id === baby.id || deletingBaby?.id === baby.id"
        @edit="openEdit(baby)"
        @delete="openDelete(baby)"
      />
      <p v-if="babies.length === 0" class="home__empty">
        No babies yet. Add one above to get started.
      </p>
    </section>

    <!-- Edit profile sheet -->
    <BottomSheet
      :open="!!editingBaby"
      :aria-label="`Edit ${editingBaby?.name ?? ''}`"
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
      :aria-label="`Delete ${deletingBaby?.name ?? ''}'s profile`"
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
