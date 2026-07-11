<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useProfileStore } from '@/stores/profile'
import AddBabyForm from '@/components/AddBabyForm.vue'

const profileStore = useProfileStore()

const emit = defineEmits<{
  added: [babyId: string]
}>()

const expanded = ref(profileStore.babies.length === 0)
const triggerRef = ref<HTMLButtonElement | null>(null)
const formWrapperRef = ref<HTMLDivElement | null>(null)

watch(expanded, async (isExpanded) => {
  if (isExpanded) {
    await nextTick()
    const nameInput = formWrapperRef.value?.querySelector<HTMLInputElement>('#add-baby-name')
    nameInput?.focus()
  } else {
    triggerRef.value?.focus()
  }
})

function toggleExpanded() {
  expanded.value = !expanded.value
}

function handleSaved(babyId?: string) {
  expanded.value = false
  if (babyId) emit('added', babyId)
}

function handleCancel() {
  expanded.value = false
}
</script>

<template>
  <div class="add-baby-slot" :class="{ 'add-baby-slot--expanded': expanded }">
    <!-- Idle pill trigger -->
    <button
      ref="triggerRef"
      v-show="!expanded"
      class="add-baby-slot__trigger"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      + Add Baby
    </button>

    <!-- Expanded form -->
    <div ref="formWrapperRef" v-show="expanded" class="add-baby-slot__form-wrapper">
      <AddBabyForm
        @saved="handleSaved"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.add-baby-slot {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.add-baby-slot--expanded {
  grid-template-rows: 1fr;
}

.add-baby-slot__trigger {
  padding: var(--space-3) var(--space-4);
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
  min-height: 40px;
  overflow: hidden;
}

.add-baby-slot__trigger:hover {
  background: var(--color-skill-available);
}

.add-baby-slot__trigger:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.add-baby-slot__form-wrapper {
  overflow: hidden;
  min-width: 0;
}
</style>
