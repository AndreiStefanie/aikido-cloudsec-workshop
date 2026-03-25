import { createRouter, createWebHistory } from 'vue-router';

import AdminView from '../views/AdminView.vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0, left: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'admin',
      component: AdminView,
    },
  ],
});
