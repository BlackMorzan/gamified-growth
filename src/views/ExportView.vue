<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const route = useRoute()
const profileStore = useProfileStore()
const error = ref(false)

onMounted(() => {
  const name = route.params.babyName as string
  const json = profileStore.exportBaby(name)
  if (!json) {
    error.value = true
    return
  }
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `baby-${name}-skills.json`
  a.click()
  URL.revokeObjectURL(url)
})
</script>

<template>
  <main class="export-view">
    <p v-if="error" class="export-view__msg export-view__msg--error">Baby not found.</p>
    <p v-else class="export-view__msg">Downloading…</p>
  </main>
</template>

<style scoped>
.export-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--color-bg);
}

.export-view__msg {
  font-size: 15px;
  color: var(--color-text-muted);
}

.export-view__msg--error {
  color: var(--color-error);
}
</style>
