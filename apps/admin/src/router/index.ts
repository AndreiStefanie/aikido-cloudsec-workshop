import { createRouter, createWebHistory } from 'vue-router';

import AdminView from '../views/AdminView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'admin',
      component: AdminView,
    },
  ],
});
