import type {
  AdminDashboardResponse,
  UpsertChallengeInput,
  UpsertScenarioInput,
} from '@workshop/shared';
import { defineStore } from 'pinia';

import {
  createChallenge,
  createScenario,
  fetchDashboard,
  revokeSession,
  updateChallenge,
} from '../api/admin';

const authStorageKey = 'cloudsec-admin-basic-auth';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    dashboard: null as AdminDashboardResponse | null,
    credentials: sessionStorage.getItem(authStorageKey) ?? '',
    loading: false,
    error: '',
  }),
  actions: {
    setCredentials(username: string, password: string) {
      this.credentials = btoa(`${username}:${password}`);
      sessionStorage.setItem(authStorageKey, this.credentials);
    },
    clearCredentials() {
      this.credentials = '';
      this.dashboard = null;
      this.error = '';
      sessionStorage.removeItem(authStorageKey);
    },
    async loadDashboard() {
      if (!this.credentials) {
        throw new Error('Missing credentials');
      }

      this.loading = true;
      this.error = '';
      try {
        this.dashboard = await fetchDashboard(this.credentials);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'Authentication required'
        ) {
          this.clearCredentials();
        }
        this.error =
          error instanceof Error ? error.message : 'Unable to load dashboard';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async saveChallenge(
      challengeId: string | null,
      payload: UpsertChallengeInput
    ) {
      if (!this.credentials) {
        throw new Error('Missing credentials');
      }

      this.loading = true;
      this.error = '';
      try {
        if (challengeId) {
          await updateChallenge(this.credentials, challengeId, payload);
        } else {
          await createChallenge(this.credentials, payload);
        }
        await this.loadDashboard();
      } finally {
        this.loading = false;
      }
    },
    async saveScenario(challengeId: string, payload: UpsertScenarioInput) {
      if (!this.credentials) {
        throw new Error('Missing credentials');
      }

      this.loading = true;
      this.error = '';
      try {
        await createScenario(this.credentials, challengeId, payload);
        await this.loadDashboard();
      } finally {
        this.loading = false;
      }
    },
    async revokeParticipantSession(sessionId: string) {
      if (!this.credentials) {
        throw new Error('Missing credentials');
      }

      this.loading = true;
      this.error = '';
      try {
        await revokeSession(this.credentials, sessionId);
        await this.loadDashboard();
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unable to revoke session';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
