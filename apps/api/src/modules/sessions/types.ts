import type {
  AdminChallengeSummary,
  AdminDashboardResponse,
  ChallengeDefinition,
  JoinChallengeInput,
  LeaderboardEntry,
  ParticipantSession,
  PlayerBootstrap,
  ScenarioDecisionInput,
  ScenarioDecisionResult,
  ScenarioDefinition,
  UpsertChallengeInput,
  UpsertScenarioInput,
} from '@workshop/shared';

export interface Repository {
  joinChallenge(input: JoinChallengeInput): Promise<PlayerBootstrap>;
  resumeSession(
    token: string,
    challengeSlug: string
  ): Promise<PlayerBootstrap | null>;
  revokeSession(sessionId: string): Promise<boolean>;
  getCurrentScenario(token: string): Promise<ScenarioDefinition | null>;
  submitDecision(
    token: string,
    input: ScenarioDecisionInput
  ): Promise<ScenarioDecisionResult | null>;
  getLeaderboard(challengeSlug: string): Promise<LeaderboardEntry[]>;
  getAdminDashboard(): Promise<AdminDashboardResponse>;
  upsertChallenge(
    challengeId: string | null,
    input: UpsertChallengeInput
  ): Promise<ChallengeDefinition>;
  upsertScenario(
    challengeId: string,
    scenarioId: string | null,
    input: UpsertScenarioInput
  ): Promise<ScenarioDefinition>;
}

export interface SessionRecord extends ParticipantSession {
  decisions: Record<string, ScenarioDecisionResult>;
}

export interface ChallengeRecord extends ChallengeDefinition {}

export interface ScoreBreakdown {
  actionScoreDelta: number;
  ownerScoreDelta: number;
  streakBonusDelta: number;
  nextStreak: number;
}

export interface DashboardCounts extends AdminChallengeSummary {}
