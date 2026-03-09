import type {
  AdminDashboardResponse,
  ChallengeDefinition,
  JoinChallengeInput,
  LeaderboardEntry,
  PlayerBootstrap,
  ScenarioDecisionInput,
  ScenarioDecisionResult,
  ScenarioDefinition,
  UpsertChallengeInput,
  UpsertScenarioInput,
} from '@workshop/shared';
import { Pool } from 'pg';

import type { Repository } from './types.js';

export class PostgresRepository implements Repository {
  constructor(private readonly pool: Pool) {}

  async joinChallenge(_input: JoinChallengeInput): Promise<PlayerBootstrap> {
    throw new Error(
      'Postgres repository is not implemented yet. Apply infra/schema.sql and extend this adapter.'
    );
  }

  async resumeSession(
    _token: string,
    _challengeSlug: string
  ): Promise<PlayerBootstrap | null> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async revokeSession(_sessionId: string): Promise<boolean> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async getCurrentScenario(_token: string): Promise<ScenarioDefinition | null> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async submitDecision(
    _token: string,
    _input: ScenarioDecisionInput
  ): Promise<ScenarioDecisionResult | null> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async getLeaderboard(_challengeSlug: string): Promise<LeaderboardEntry[]> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async upsertChallenge(
    _challengeId: string | null,
    _input: UpsertChallengeInput
  ): Promise<ChallengeDefinition> {
    throw new Error('Postgres repository is not implemented yet.');
  }

  async upsertScenario(
    _challengeId: string,
    _scenarioId: string | null,
    _input: UpsertScenarioInput
  ): Promise<ScenarioDefinition> {
    throw new Error('Postgres repository is not implemented yet.');
  }
}
