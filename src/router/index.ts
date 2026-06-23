import { createRouter, createWebHistory } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/setup', component: () => import('../views/ProfileSetupView.vue') },
    { path: '/tree', component: () => import('../views/SkillTreeView.vue') },
  ],
})

router.beforeEach((to) => {
  const profileStore = useProfileStore()
  if (to.path === '/tree' && !profileStore.profile) return '/setup'
  if (to.path === '/setup' && profileStore.profile) return '/tree'
})

export default router
