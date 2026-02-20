import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'UserManagement', component: () => import('../views/UserManagement.vue'), meta: { title: 'User Management' } },
    { path: '/patterns', name: 'Patterns', component: () => import('../views/PatternsPage.vue'), meta: { title: 'Patterns' } },
  ],
});

export default router;
