import type {
  LeaderboardEntry,
  PlayerBootstrap,
  ScenarioDecisionInput,
  ScenarioDecisionResult,
  ScenarioDefinition,
} from '@workshop/shared';

import { apiRequest } from './client';

export function joinChallenge(payload: {
  joinCode: string;
  participantName: string;
  existingToken?: string;
}) {
  return apiRequest<PlayerBootstrap>('/player/join', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resumeSession(payload: {
  token: string;
  challengeSlug: string;
}) {
  return apiRequest<PlayerBootstrap>('/player/resume', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentScenario(token: string) {
  return apiRequest<ScenarioDefinition>('/player/current-scenario', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function submitDecision(token: string, payload: ScenarioDecisionInput) {
  return apiRequest<ScenarioDecisionResult>('/player/decision', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function fetchLeaderboard(challengeSlug: string) {
  return apiRequest<LeaderboardEntry[]>(`/leaderboard/${challengeSlug}`);
}
