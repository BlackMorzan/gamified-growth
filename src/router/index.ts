import { createRouter, createWebHistory } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/setup', component: () => import('../views/ProfileSetupView.vue') },
    { path: '/tree/:babyName', name: 'skill-tree', component: () => import('../views/SkillTreeView.vue') },
    { path: '/tree/:babyName/export', name: 'export', component: () => import('../views/ExportView.vue') },
    { path: '/tree/:babyName/import', name: 'import', component: () => import('../views/ImportView.vue') },
  ],
})

router.beforeEach((to) => {
  const profileStore = useProfileStore()
  const hasBabies = profileStore.babies.length > 0
  if (!hasBabies && to.path !== '/setup') return '/setup'
  if (hasBabies && to.path === '/setup') return '/'
})

export default router
