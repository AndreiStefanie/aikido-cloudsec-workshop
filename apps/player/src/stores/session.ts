import type {
  CompletedScenarioReview,
  PlayerBootstrap,
  ScenarioDecisionInput,
  ScenarioDecisionResult,
} from '@workshop/shared';
import { defineStore } from 'pinia';

import { ApiError } from '../api/client';
import {
  fetchCurrentScenario,
  fetchLeaderboard,
  joinChallenge,
  resumeSession,
  submitDecision,
} from '../api/player';

const storageKey = 'cloudsec-workshop-session';

interface PersistedSession {
  token: string;
  challengeSlug: string;
}

interface JoinDraft {
  participantName: string;
  joinCode: string;
}

interface PendingAdvance {
  nextScenarioIndex: number;
  challengeCompleted: boolean;
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    bootstrap: null as PlayerBootstrap | null,
    feedback: null as ScenarioDecisionResult | null,
    pendingAdvance: null as PendingAdvance | null,
    joinDraft: {
      participantName: '',
      joinCode: '',
    } as JoinDraft,
    loading: false,
    error: '',
  }),
  getters: {
    token: state => state.bootstrap?.session.token,
    hasCompleted: state => Boolean(state.bootstrap?.session.completedAt),
  },
  actions: {
    setJoinDraft(payload: Partial<JoinDraft>) {
      this.joinDraft = {
        ...this.joinDraft,
        ...payload,
      };
    },
    hydrateFromStorage() {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as PersistedSession) : null;
    },
    clearSession(message = '') {
      localStorage.removeItem(storageKey);
      this.bootstrap = null;
      this.feedback = null;
      this.pendingAdvance = null;
      this.error = message;
    },
    persist() {
      if (!this.bootstrap) {
        return;
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          token: this.bootstrap.session.token,
          challengeSlug: this.bootstrap.challenge.slug,
        })
      );
    },
    async join(joinCode: string, participantName: string) {
      this.loading = true;
      this.error = '';
      try {
        const persisted = this.hydrateFromStorage();
        this.bootstrap = await joinChallenge({
          joinCode,
          participantName,
          existingToken: persisted?.token,
        });
        this.error = '';
        this.feedback = null;
        this.pendingAdvance = null;
        this.persist();
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unable to join challenge';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async resume(challengeSlug: string, token: string) {
      this.loading = true;
      this.error = '';
      try {
        this.bootstrap = await resumeSession({ challengeSlug, token });
        this.error = '';
        this.feedback = null;
        this.pendingAdvance = null;
        this.persist();
        return this.bootstrap;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          this.clearSession(
            'This session no longer exists. It may have expired or been revoked by an admin.'
          );
        } else {
          this.error =
            error instanceof Error
              ? error.message
              : 'Unable to resume challenge';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async answer(payload: ScenarioDecisionInput) {
      if (!this.bootstrap) {
        throw new Error('No active session');
      }

      this.loading = true;
      this.error = '';
      try {
        const result = await submitDecision(
          this.bootstrap.session.token,
          payload
        );
        const currentScenario = this.bootstrap.currentScenario;
        this.feedback = result;
        this.bootstrap.session.score = result.totalScore;
        this.bootstrap.session.streak = result.resultingStreak;
        if (currentScenario) {
          const review: CompletedScenarioReview = {
            scenarioId: result.scenarioId,
            title: currentScenario.title,
            submittedAction: result.submittedAction,
            submittedOwnerTeam: result.submittedOwnerTeam ?? undefined,
            submittedIgnoreFeedback: result.submittedIgnoreFeedback ?? undefined,
            correctAction: result.correctAction,
            correctOwnerTeam: result.correctOwnerTeam ?? undefined,
            correctIgnoreFeedback: result.correctIgnoreFeedback ?? undefined,
            actionScoreDelta: result.actionScoreDelta,
            ownerScoreDelta: result.ownerScoreDelta,
            streakBonusDelta: result.streakBonusDelta,
            totalDelta:
              result.actionScoreDelta +
              result.ownerScoreDelta +
              result.streakBonusDelta,
            securityLesson: result.securityLesson,
          };

          this.bootstrap.completedReview = [
            ...this.bootstrap.completedReview.filter(
              entry => entry.scenarioId !== review.scenarioId
            ),
            review,
          ];
        }
        this.pendingAdvance = {
          nextScenarioIndex: result.nextScenarioIndex,
          challengeCompleted: result.challengeCompleted,
        };
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          this.clearSession(
            'This session no longer exists. It may have expired or been revoked by an admin.'
          );
        } else {
          this.error =
            error instanceof Error ? error.message : 'Unable to submit answer';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async continueAfterFeedback() {
      if (!this.bootstrap || !this.pendingAdvance) {
        this.feedback = null;
        return;
      }

      this.loading = true;
      this.error = '';
      try {
        this.bootstrap.session.currentScenarioIndex =
          this.pendingAdvance.nextScenarioIndex;

        if (this.pendingAdvance.challengeCompleted) {
          this.bootstrap.session.completedAt = new Date().toISOString();
          this.bootstrap.currentScenario = undefined;
        } else {
          this.bootstrap.currentScenario = await fetchCurrentScenario(
            this.bootstrap.session.token
          );
        }

        this.bootstrap.leaderboard = await fetchLeaderboard(
          this.bootstrap.challenge.slug
        );
        this.feedback = null;
        this.pendingAdvance = null;
        this.persist();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          this.clearSession(
            'This session no longer exists. It may have expired or been revoked by an admin.'
          );
        } else {
          this.error =
            error instanceof Error ? error.message : 'Unable to continue';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
