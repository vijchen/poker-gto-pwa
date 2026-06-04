import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'guide', component: () => import('@/views/GuideView.vue') },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
    { path: '/strategy', name: 'strategy', component: () => import('@/views/HomeView.vue') },
    { path: '/train', name: 'train', component: () => import('@/views/TrainView.vue') },
    { path: '/postflop', name: 'postflop', component: () => import('@/views/PostflopView.vue') },
    { path: '/equity', name: 'equity', component: () => import('@/views/EquityView.vue') },
    { path: '/odds', name: 'odds', component: () => import('@/views/OddsView.vue') },
    { path: '/glossary', name: 'glossary', component: () => import('@/views/GlossaryView.vue') },
    { path: '/quiz', name: 'quiz', component: () => import('@/views/QuizView.vue') },
    { path: '/handlog', name: 'handlog', component: () => import('@/views/HandLogView.vue') },
    { path: '/ranges', name: 'ranges', component: () => import('@/views/RangesView.vue') }
  ]
})

export default router
