import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'strategy', component: () => import('@/views/HomeView.vue') },
    { path: '/train', name: 'train', component: () => import('@/views/TrainingHub.vue') },
    { path: '/tools', name: 'tools', component: () => import('@/views/ToolsView.vue') },
    { path: '/learn', name: 'learn', component: () => import('@/views/LearnView.vue') },
    { path: '/me', name: 'me', component: () => import('@/views/ProfileView.vue') }
  ]
})

export default router
