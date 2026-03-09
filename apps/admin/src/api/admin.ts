import type {
  AdminDashboardResponse,
  ChallengeDefinition,
  ScenarioDefinition,
  UpsertChallengeInput,
  UpsertScenarioInput,
} from '@workshop/shared';

import { adminRequest } from './client';

export function fetchDashboard(credentials: string) {
  return adminRequest<AdminDashboardResponse>('/admin/dashboard', credentials);
}

export function revokeSession(credentials: string, sessionId: string) {
  return adminRequest<void>(`/admin/sessions/${sessionId}`, credentials, {
    method: 'DELETE',
  });
}

export function createChallenge(
  credentials: string,
  payload: UpsertChallengeInput
) {
  return adminRequest<ChallengeDefinition>('/admin/challenges', credentials, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateChallenge(
  credentials: string,
  challengeId: string,
  payload: UpsertChallengeInput
) {
  return adminRequest<ChallengeDefinition>(
    `/admin/challenges/${challengeId}`,
    credentials,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
}

export function createScenario(
  credentials: string,
  challengeId: string,
  payload: UpsertScenarioInput
) {
  return adminRequest<ScenarioDefinition>(
    `/admin/challenges/${challengeId}/scenarios`,
    credentials,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}
