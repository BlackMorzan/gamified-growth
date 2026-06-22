<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTechTreeStore } from '@/stores/techTree'
import { useProfileStore } from '@/stores/profile'

const techTree = useTechTreeStore()
const profile = useProfileStore()

function saveSnapshot() {
  profile.saveSessionSnapshot(techTree.currentAvailableIds)
}

onMounted(() => {
  window.addEventListener('beforeunload', saveSnapshot)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveSnapshot()
  })
})
</script>

<template>
  <RouterView />
</template>
