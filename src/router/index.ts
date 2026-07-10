import { createRouter, createWebHistory } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/tree/import', name: 'import', component: () => import('../views/ImportView.vue') },
    { path: '/tree/:babyName', name: 'skill-tree', component: () => import('../views/SkillTreeView.vue') },
    { path: '/tree/:babyName/export', name: 'export', component: () => import('../views/ExportView.vue') },
  ],
})

router.beforeEach((to) => {
  const profileStore = useProfileStore()
  const hasBabies = profileStore.babies.length > 0
  if (!hasBabies && to.path !== '/' && to.name !== 'import') return '/'
})

export default router
