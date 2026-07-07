<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

const status = ref<'idle' | 'error'>('idle')
const errorMsg = ref('')

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(reader.result as string)
    } catch {
      status.value = 'error'
      errorMsg.value = 'File is not valid JSON.'
      return
    }

    const result = profileStore.importBaby(parsed)
    if (result.ok) {
      router.push('/')
    } else {
      status.value = 'error'
      errorMsg.value = result.error
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <main class="import-view">
    <div class="import-view__card">
      <p class="import-view__label">Import skill data</p>
      <label class="import-view__btn" for="import-file">Choose file</label>
      <input
        id="import-file"
        class="import-view__input"
        type="file"
        accept="application/json,.json"
        @change="onFileChange"
      />
      <p v-if="status === 'error'" class="import-view__msg import-view__msg--error">
        {{ errorMsg }}
      </p>
    </div>
  </main>
</template>

<style scoped>
.import-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--color-bg);
}

.import-view__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.import-view__label {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 0;
}

.import-view__btn {
  display: inline-block;
  padding: var(--space-2) var(--space-6);
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
}

.import-view__btn:hover {
  opacity: 0.85;
}

.import-view__input {
  display: none;
}

.import-view__msg {
  font-size: 14px;
  margin: 0;
}

.import-view__msg--error {
  color: var(--color-error);
}
</style>
