// 1. Static imports must be at the top level
import FGSetup from '@/views/focus-group/FGSetup.vue'

export const focusGroupRoutes = [
  {
    path: '/focus-group/setup',
    name: 'FGSetup',
    component: FGSetup // Use the imported component here
  },
  {
    path: '/focus-group/session',
    name: 'FGSession',
    // Lazy-loading for the other views
    component: () => import('@/views/focus-group/FGSession.vue')
  },
  {
    path: '/focus-group/analysis',
    name: 'FGAnalysis',
    component: () => import('@/views/focus-group/FGAnalysis.vue')
  }
];