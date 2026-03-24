import { createRouter, createWebHistory } from 'vue-router';

import ChallengeSetupView from '../views/ChallengeSetupView.vue';
import ChallengeView from '../views/ChallengeView.vue';
import HomeView from '../views/HomeView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/challenge',
      name: 'challenge-setup',
      component: ChallengeSetupView,
    },
    {
      path: '/play/:challengeSlug',
      name: 'play',
      component: ChallengeView,
      props: true,
    },
    {
      path: '/leaderboard/:challengeSlug',
      name: 'leaderboard',
      component: LeaderboardView,
      props: true,
    },
  ],
});
