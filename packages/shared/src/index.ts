export const actions = ['fix', 'snooze', 'ignore'] as const;
export type ActionType = (typeof actions)[number];

export const teams = [
  'DevOps Team',
  'Application Team',
  'Security Team',
  'Cloud Platform Team',
] as const;
export type TeamType = (typeof teams)[number];

export type ResourceType =
  | 'Container'
  | 'Kubernetes'
  | 'Serverless'
  | 'VirtualMachine'
  | 'Database'
  | 'Storage'
  | 'Identity';

export interface ResourceContext {
  id: string;
  name: string;
  type: ResourceType;
  assetTypeLabel?: string;
  createdAt?: string;
  tags?: string[];
  account?: string;
  detailsLabel?: string;
  detailRows?: ScenarioDetailRow[];
  environment: string;
  ownerHints: string[];
  exposure: 'public' | 'internal' | 'restricted';
  notes?: string;
}

export interface ScenarioDetailRow {
  field: string;
  value: string;
}

export interface ScenarioAnswer {
  action: ActionType;
  ownerTeam: TeamType;
}

export interface ScenarioSla {
  status: 'overdue' | 'due_soon';
  days: number;
}

export interface ScenarioDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  severityLabel: 'low' | 'medium' | 'high' | 'critical';
  sla: ScenarioSla;
  remediation: string;
  resources: ResourceContext[];
  securityLesson: string;
  ignoreFeedbackOptions: string[];
  answer: ScenarioAnswer;
}

export interface ChallengeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  joinCode: string;
  joinPassword?: string;
  isActive: boolean;
  scenarios: ScenarioDefinition[];
}

export interface ParticipantSession {
  id: string;
  token: string;
  participantName: string;
  challengeId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  currentScenarioIndex: number;
  score: number;
  streak: number;
  correctActions: number;
  correctOwners: number;
}

export interface ScenarioDecisionInput {
  action: ActionType;
  ownerTeam?: TeamType | null;
  ignoreFeedback?: string;
}

export interface ScenarioDecisionResult {
  scenarioId: string;
  submittedAction: ActionType;
  submittedOwnerTeam?: TeamType;
  submittedIgnoreFeedback?: string;
  correctAction: ActionType;
  correctOwnerTeam: TeamType;
  actionScoreDelta: number;
  ownerScoreDelta: number;
  streakBonusDelta: number;
  resultingStreak: number;
  totalScore: number;
  isActionCorrect: boolean;
  isOwnerCorrect: boolean;
  securityLesson: string;
  nextScenarioIndex: number;
  challengeCompleted: boolean;
}

export interface CompletedScenarioReview {
  scenarioId: string;
  title: string;
  submittedAction: ActionType;
  submittedOwnerTeam?: TeamType;
  submittedIgnoreFeedback?: string;
  correctAction: ActionType;
  correctOwnerTeam: TeamType;
  actionScoreDelta: number;
  ownerScoreDelta: number;
  streakBonusDelta: number;
  totalDelta: number;
  securityLesson: string;
}

export interface LeaderboardEntry {
  rank: number;
  participantName: string;
  score: number;
  completedAt: string;
}

export interface PlayerBootstrap {
  challenge: Omit<ChallengeDefinition, 'scenarios' | 'joinPassword'> & {
    scenarioCount: number;
  };
  session: ParticipantSession;
  currentScenario?: ScenarioDefinition;
  leaderboard: LeaderboardEntry[];
  completedReview: CompletedScenarioReview[];
}

export interface JoinChallengeInput {
  joinCode: string;
  participantName: string;
  existingToken?: string;
}

export interface ResumeSessionInput {
  token: string;
  challengeSlug: string;
}

export interface AdminChallengeSummary {
  id: string;
  slug: string;
  name: string;
  joinCode: string;
  isActive: boolean;
  scenarioCount: number;
  participantCount: number;
  completedCount: number;
}

export interface AdminSessionSummary {
  id: string;
  participantName: string;
  challengeId: string;
  challengeName: string;
  challengeSlug: string;
  score: number;
  currentScenarioIndex: number;
  completedAt?: string;
  updatedAt: string;
}

export interface AdminDashboardResponse {
  challenges: AdminChallengeSummary[];
  sessions: AdminSessionSummary[];
  challengeDefinitions: ChallengeDefinition[];
}

export interface UpsertChallengeInput {
  slug: string;
  name: string;
  description: string;
  joinCode: string;
  joinPassword?: string;
  isActive: boolean;
}

export interface UpsertScenarioInput {
  order: number;
  title: string;
  description: string;
  severityLabel: ScenarioDefinition['severityLabel'];
  sla: ScenarioSla;
  remediation: string;
  resources: ResourceContext[];
  securityLesson: string;
  ignoreFeedbackOptions: string[];
  answer: ScenarioAnswer;
}
