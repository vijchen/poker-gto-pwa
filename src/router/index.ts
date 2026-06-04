import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/train', name: 'train', component: () => import('@/views/TrainView.vue') },
    { path: '/postflop', name: 'postflop', component: () => import('@/views/PostflopView.vue') },
    { path: '/equity', name: 'equity', component: () => import('@/views/EquityView.vue') },
    { path: '/odds', name: 'odds', component: () => import('@/views/OddsView.vue') },
    { path: '/glossary', name: 'glossary', component: () => import('@/views/GlossaryView.vue') },
    { path: '/ranges', name: 'ranges', component: () => import('@/views/RangesView.vue') }
  ]
})

export default router
